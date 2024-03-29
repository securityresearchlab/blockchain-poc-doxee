import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {SecretsManager} from 'aws-sdk';
import * as FabricClient from 'fabric-client';
import * as fs from 'fs';
import {InjectAwsService} from 'nest-aws-sdk';
import * as path from 'path';
import {User} from 'src/users/entities/user';
import {TransactionDto} from './dto/transaction-dto';
import {composeConnectionProfile} from '../blockchain/config/connectionProfile';
import {executeBashScriptSpawn, executeBashSript} from '../blockchain/utils';

@Injectable()
export class ChaincodeService {
  private readonly logger = new Logger(ChaincodeService.name);
  private readonly BASE_PATH = path.join(process.cwd(), 'src', 'chain-document');
  private readonly BLOCKCHAIN_PATH = path.join(process.cwd(), 'src', 'blockchain');
  private readonly CERTS_PATH = path.join(this.BLOCKCHAIN_PATH, 'certs');
  private readonly SCRIPTS_PATH = path.join(this.BLOCKCHAIN_PATH, 'scripts');
  private readonly SMART_CONTRACTS_PATH = path.join(this.BASE_PATH, 'smart-contracts');

  constructor(
    @InjectAwsService(SecretsManager)
    private readonly secretsManager: SecretsManager,
    private configService: ConfigService,
  ) {}

  async installChaincode(chaincodeName: string) {
    // Copy smart contract folder inside peer node
    await this.transferSmartContract(chaincodeName);

    // Start chaincode installation
    this.logger.log(`Start installation of chain code ${chaincodeName}`);
    const executeConfigureChaincodeRemoteScriptPath = path.join(this.SCRIPTS_PATH, 'execute-config-chiancode-remote.sh');
    await executeBashScriptSpawn(
      executeConfigureChaincodeRemoteScriptPath,
      [
        this.configService.get('AWS_NETWORK_ID'),
        this.configService.get('MEMBER_ID'),
        this.configService.get('NODE_ID'),
        this.configService.get('ORDERER_ENDPOINT'),
        this.configService.get('PEER_ENDPOINT'),
      ],
      this.logger,
    );
  }

  private async transferSmartContract(chaincodeName: string) {
    this.logger.log(`Start transfer of smart contract ${chaincodeName}`);

    const transferSmartContractScriptPath = path.join(this.SCRIPTS_PATH, 'transfer-smart-contract.sh');
    await executeBashSript(
      transferSmartContractScriptPath,
      [chaincodeName, path.join(this.SMART_CONTRACTS_PATH, chaincodeName)],
      this.logger,
    );
  }

  /**
   * Query items from channel
   * @param user
   * @param args
   * @returns
   */
  async query(user: User, fcn: 'getPrivateData' | 'getAllPrivateData', args: Array<string>): Promise<Array<Object>> {
    const CHANNEL_NAME = this.configService.get('CHANNEL_NAME');
    this.logger.log(`Start query ${fcn} on channel: ${CHANNEL_NAME} with args: ${args}`);

    const client = await this.getClient(user);
    const channel = client.getChannel(CHANNEL_NAME);

    return channel
      .queryByChaincode(this.composeRequest(fcn, args))
      .then((res) => {
        this.logger.debug(`Query response: ${JSON.stringify(res)}`);
        return JSON.parse(fcn == 'getPrivateData' ? res[0].toString() : res.toString());
      })
      .catch((err) => {
        this.logger.error(err);
        throw err;
      });
  }

  /**
   * Invoke chain code to create or delete items
   * @param user
   * @param method 'PUT' || 'DELETE'
   * @param args
   * @returns
   */
  async invoke(user: User, method: 'PUT' | 'DELETE', args: Array<string>): Promise<TransactionDto> {
    const CHANNEL_NAME = this.configService.get('CHANNEL_NAME');
    this.logger.log(`Start invoke ${method} on channel: ${CHANNEL_NAME} with args: ${args}`);

    let errorMessage;
    let transactionId;
    const request = this.composeRequest(method.toLowerCase(), args);
    const client = await this.getClient(user);
    const channel = client.getChannel(CHANNEL_NAME);
    transactionId = client.newTransactionID();
    request.txId = transactionId;
    request.targets = channel.getPeers().map((peer) => peer.getPeer());

    this.logger.log(`Request: ${JSON.stringify(request)}`);

    const proposalResults = await channel.sendTransactionProposal(request as FabricClient.ChaincodeInvokeRequest);

    this.logger.log('Proposal results: ', JSON.stringify(proposalResults));
    try {
      const [proposalResponsesObj, proposal] = proposalResults;
      const proposalResponses = proposalResponsesObj as FabricClient.ProposalResponse[];
      const proposalErrorResponses = proposalResponsesObj as FabricClient.ProposalErrorResponse[];

      let successful = true;
      for (let i = 0; i < proposalResponses.length; i += 1) {
        if (!(proposalResponses[i].response && proposalResponses[i].response.status === 200)) {
          successful = false;
          break;
        }
      }

      if (successful) {
        const promises = [];
        const eventHubs = channel.getChannelEventHubsForOrg();
        eventHubs.forEach((eh) => {
          const invokeEventPromise = new Promise((resolve, reject) => {
            const eventTimeout = setTimeout(() => {
              eh.disconnect();
            }, 10000);
            eh.registerTxEvent(
              transactionId.getTransactionID(),
              (tx, code) => {
                clearTimeout(eventTimeout);
                if (code !== 'VALID') {
                  const message = `Invoke chaincode transaction was invalid with code of ${code}`;
                  return reject(new Error(message));
                }
                const message = 'Invoke chaincode transaction was valid';
                return resolve(message);
              },
              (err) => {
                clearTimeout(eventTimeout);
                reject(err);
              },
              {unregister: true, disconnect: true},
            );
            eh.connect();
          });
          promises.push(invokeEventPromise);
        });

        const ordererRequest: FabricClient.TransactionRequest = {txId: transactionId, proposalResponses, proposal};
        promises.push(channel.sendTransaction(ordererRequest));
        const ordererResponses = await Promise.all(promises);
        const ordererResponse = ordererResponses.pop();
        if (ordererResponse.status !== 'SUCCESS') {
          errorMessage = `Failed to order the transaction with code of ${ordererResponse.status}`;
        }
      } else {
        errorMessage = `Failed to send proposal: ${proposalErrorResponses[0].message}`;
      }
    } catch (err) {
      errorMessage = err.toString();
    }

    if (errorMessage) {
      throw new Error(errorMessage);
    }

    const txId = transactionId.getTransactionID();
    console.info(`Successfully invoked ${request.fcn} on chaincode ${request.chaincodeId} for transaction ${txId}`);
    return new TransactionDto(txId);
  }

  /**
   * Compose request to query or invoke the chaincode
   * @param fcn query or invoke
   * @param args
   * @returns
   */
  private composeRequest(fcn: string, args: Array<string>): FabricClient.ChaincodeQueryRequest | FabricClient.ChaincodeInvokeRequest {
    const CHAINCODE_NAME = this.configService.get('CHAINCODE_NAME');
    return {
      chaincodeId: CHAINCODE_NAME,
      fcn: fcn,
      args: args,
    };
  }

  private async getClient(user: User) {
    this.logger.log(`Start retrieving client of user ${user.id}`);
    const connectionProfile = composeConnectionProfile(
      this.configService.get('MEMBER_ID'),
      this.configService.get('CA_ENDPOINT'),
      this.configService.get('ORDERER_ENDPOINT'),
      this.configService.get('PEER_ENDPOINT'),
      path.join(this.CERTS_PATH, 'managedblockchain-tls-chain.pem'),
    );
    const client = FabricClient.loadFromConfig(connectionProfile);
    // const privateKeyPEM = await this.getSecret(this.configService.get("PRIVATE_KEY_ARN"));
    // const signedCertPEM = await this.getSecret(this.configService.get("SIGNED_CERT_ARN"));
    // const memberId = user.members.sort((a, b) => b.creationDate.getTime() - a.creationDate.getTime())?.at(0).memberId;
    const privateKeyPEM = fs.readFileSync(path.join(this.CERTS_PATH, 'private_key')).toString();
    const signedCertPEM = fs.readFileSync(path.join(this.CERTS_PATH, 'sign_cert.pem')).toString();
    const memberId = this.configService.get('MEMBER_ID');

    const userData: FabricClient.UserOpts = {
      username: 'admin',
      mspid: memberId,
      cryptoContent: {
        privateKeyPEM: privateKeyPEM,
        signedCertPEM: signedCertPEM,
      },
      skipPersistence: true,
    };

    const chainUser = await client.createUser(userData);
    client.setUserContext(chainUser, true);

    return client;
  }

  /**
   * Funciton used to retrieve secrets from AWS Secrets Manager
   * @param secretId
   * @returns
   */
  private async getSecret(secretId) {
    this.logger.log(`Start retrieving secret ${secretId}`);
    const secret = await this.secretsManager.getSecretValue({SecretId: secretId}).promise();
    return secret.SecretString;
  }
}
