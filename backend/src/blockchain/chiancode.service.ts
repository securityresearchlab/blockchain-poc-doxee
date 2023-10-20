import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SecretsManager } from "aws-sdk";
import * as FabricClient from "fabric-client";
import { InjectAwsService } from "nest-aws-sdk";
import { User } from "src/users/entities/user";
import { CONNECTION_PROFILE } from "./config/connectionProfile";
import { TransactionDto } from "../chain-document/dto/transaction-dto";

@Injectable()
export class ChaincodeService {
    private readonly logger = new Logger(ChaincodeService.name);

    constructor(
        @InjectAwsService(SecretsManager)
        private readonly secretsManager: SecretsManager,
        private configService: ConfigService, 
    ) {}

    /**
     * Query items from channel
     * @param user 
     * @param args 
     * @returns 
     */
    async query(user: User, fcn: 'get'|'getAll', args: Array<string>): Promise<Array<Object>> {
      const CHANNEL_NAME = this.configService.get('CHANNEL_NAME');
      this.logger.log(`Start query ${fcn} on channel: ${CHANNEL_NAME} with args: ${args}`);
               
      const client = await this.getClient(user);
      const channel = client.getChannel(CHANNEL_NAME);

      return channel.queryByChaincode(this.composeRequest(fcn, args))
          .then(res => {
            this.logger.debug(`Query response: ${JSON.stringify(res)}`);
            return JSON.parse(res[0].toString());
          })
          .catch(err => {
              this.logger.error(err);
              throw err;
          });
    }

    /**
     * Invoke chain code to create or delete items
     * @param user 
     * @param method 'POST' || 'PUT' || 'DELETE'
     * @param args 
     * @returns 
     */
    async invoke(user: User, method: 'POST'|'PUT'|'DELETE', args: Array<string>): Promise<TransactionDto> {
        const CHANNEL_NAME = this.configService.get('CHANNEL_NAME');
        this.logger.log(`Start invoke ${method} on channel: ${CHANNEL_NAME} with args: ${args}`);

        let errorMessage;
        let transactionId;
        const request = this.composeRequest(method.toLowerCase(), args);
        try {
            const client = await this.getClient(user);
            const channel = client.getChannel(CHANNEL_NAME);
            transactionId = client.newTransactionID();
            request.txId = transactionId;
            request.targets = channel.getPeers().map(peer => peer.getPeer());

            const proposalResults = await channel.sendTransactionProposal(request as FabricClient.ChaincodeInvokeRequest);

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
                    const eventTimeout = setTimeout(() => { eh.disconnect(); }, 10000);
                    eh.registerTxEvent(transactionId.getTransactionID(), (tx, code) => {
                      clearTimeout(eventTimeout);
                      if (code !== 'VALID') {
                        const message = `Invoke chaincode transaction was invalid with code of ${code}`;
                        return reject(new Error(message));
                      }
                      const message = 'Invoke chaincode transaction was valid';
                      return resolve(message);
                    }, (err) => {
                      clearTimeout(eventTimeout);
                      reject(err);
                    },
                    { unregister: true, disconnect: true });
                    eh.connect();
                  });
                  promises.push(invokeEventPromise);
                });
                
                const ordererRequest: FabricClient.TransactionRequest = { txId: transactionId, proposalResponses, proposal };
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
        }
    }

    private async getClient(user :User) {
        this.logger.log(`Start retrieving client of user ${user.id}`);
        const client = FabricClient.loadFromConfig(CONNECTION_PROFILE);

        const privateKeyPEM = await this.getSecret(this.configService.get("PRIVATE_KEY_ARN"));
        const signedCertPEM = await this.getSecret(this.configService.get("SIGNED_CERT_ARN"));
        const memberId = user.members.sort((a, b) => b.creationDate.getTime() - a.creationDate.getTime())?.at(0).memberId;

        this.logger.log(`Using member ${memberId} for user ${user.id}`);

        const userData = {
            username: 'admin',
            mspid: memberId,
            cryptoContent: { privateKeyPEM, signedCertPEM },
            skipPersistence: true,
        };

        const chianUser = await client.createUser(userData);
        client.setUserContext(chianUser, true);

        return client;
    }

    private async getSecret(secretId) {
        this.logger.log(`Start retrieving secret ${secretId}`);
        const secret = await this.secretsManager.getSecretValue({ SecretId: secretId }).promise();
        return secret.SecretString;
    }

}