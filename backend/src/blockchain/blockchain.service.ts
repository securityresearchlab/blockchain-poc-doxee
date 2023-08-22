import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { User } from 'src/users/entities/user';
import * as FabricCAServices from 'fabric-ca-client';
import { Wallets, X509Identity } from 'fabric-network';
import * as fs from 'fs';
import * as path from 'path';
import { readFile, writeFile } from 'fs/promises';

/**
 * This service provides methods to invoke scripts in order to interact with network blockchain
 */
@Injectable()
export class BlockchainService {
    private readonly logger = new Logger(BlockchainService.name);

    private readonly BASE_PATH = path.join(process.cwd(), 'src', 'blockchain');
    private readonly SCRIPT_DIR_PATH = path.join(this.BASE_PATH, 'script');
    private readonly CRYPTO_DIR_PATH = path.join(this.BASE_PATH, 'organizations', 'cryptogen');

    constructor() {}

    /**
     * Generates all files needed to create a new organization, invokes scripts and creates a wallet
     * @param user 
     * @returns 
     */
    async enrollOrg(user: User) {
        this.logger.log('Start enrolling organization: ' + user.organization);

        // 1. Generate files from templates
        await this.generateOrgFiles(user);

        // 2. Invoke generated scripts

        // 3. Create org wallet

        this.logger.log('Organization ' + user.organization + ' enrolled');
    }

    /**
     * Generates all files needed to create a new organization
     * @param user 
     * @returns 
     */
    private async generateOrgFiles(user: User) {
        const FILES = ['createOrgTemplate.sh', 'registerEnrollTemplate.sh', 'crypto-config-org-template.yaml'];

        this.logger.log('Start generating files for organization: ' + user.organization);

        const f1 = await this.generateFromTemplate(user, this.SCRIPT_DIR_PATH, FILES.at(0));
        const f2 = await this.generateFromTemplate(user, this.SCRIPT_DIR_PATH, FILES.at(1));
        const f3 = await this.generateFromTemplate(user, this.CRYPTO_DIR_PATH, FILES.at(2));

        if (f1 && f2 && f3) {
            this.logger.log('Files generated for organization: ' + user.organization);
            return [f1, f2, f3];
        }
        
        throw new HttpException('Error during Org initialization', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Replace placeholders with user info and stores a new file under generated folder
     * @param user User info
     * @param dirPath base file path
     * @param fileName file name
     * @returns 
     */
    private async generateFromTemplate(user: User, dirPath: string, fileName: string): Promise<String> {
        const ORGANIZATION_NAME_PLACEHOLDER = 'ORGANIZATION_NAME_PLACEHOLDER';
        const ORGANIZATION_DOMAIN_PLACEHOLDER = 'ORGANIZATION_DOMAIN_PLACEHOLDER';
        
        const newFilePath = path.join(dirPath, 'generated', fileName
            .replace('Template', user.name + user.surname)
            .replace('template', user.name.toLowerCase() + user.surname.toLowerCase()));

        try {
            this.logger.log('Generating file: ' + newFilePath);
            let data: string = (await readFile(path.join(dirPath, fileName))).toString();

            data = data.replaceAll(ORGANIZATION_NAME_PLACEHOLDER, user.name + user.surname);
            data = data.replaceAll(ORGANIZATION_DOMAIN_PLACEHOLDER, user.organization);

            await writeFile(newFilePath, data, 'utf-8');
            return newFilePath;
        } catch (error) {
            this.logger.error(error);
            this.logger.warn('Failed to generate file: ' + newFilePath);
            return undefined;
        }
    }
}
