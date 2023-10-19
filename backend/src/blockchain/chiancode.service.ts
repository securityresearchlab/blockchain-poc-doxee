import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SecretsManager } from "aws-sdk";
import * as FabricClient from "fabric-client";
import { InjectAwsService } from "nest-aws-sdk";
import { User } from "src/users/entities/user";
import { CONNECTION_PROFILE } from "./config/connectionProfile";

@Injectable()
export class ChaincodeService {
    private readonly logger = new Logger(ChaincodeService.name);

    constructor(
        @InjectAwsService(SecretsManager)
        private readonly secretsManager: SecretsManager,
        private configService: ConfigService, 
    ) {}

    async query(user: User, args: Array<string>) {
        const CHANNEL_NAME = this.configService.get('CHANNEL_NAME');
        const CHAINCODE_NAME = this.configService.get('CHAINCODE_NAME');

        const request: FabricClient.ChaincodeQueryRequest = {
            chaincodeId: CHAINCODE_NAME,
            fcn: 'getAll',
            args: args,
        }
        
        const client = await this.getClient(user);
        const channel = client.getChannel(CHANNEL_NAME);

        return channel.queryByChaincode(request)
            .then(res => res[0].toString())
            .catch(err => {
                this.logger.error(err);
                throw err;
            })

    }

    private async getClient(user :User) {
        const client = FabricClient.loadFromConfig(CONNECTION_PROFILE);

        const privateKeyPEM = await this.getSecret(this.configService.get("PRIVATE_KEY_ARN"));
        const signedCertPEM = await this.getSecret(this.configService.get("SIGNED_CERT_ARN"));

        const userData = {
            username: 'admin',
            mspid: user.members.sort((a, b) => b.creationDate.getTime() - a.creationDate.getTime())?.at(0).memberId,
            cryptoContent: { privateKeyPEM, signedCertPEM },
            skipPersistence: true,
        };
        const chianUser = await client.createUser(userData);
        client.setUserContext(chianUser, true);

        return client;
    }

    private async getSecret(secretId) {
        const secret = await this.secretsManager.getSecretValue({ SecretId: secretId }).promise();
        return secret.SecretString;
    }

}