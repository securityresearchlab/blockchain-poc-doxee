import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { User } from 'src/users/entities/user';
import { readFile, readdir, writeFile } from 'fs/promises';
import * as fs from 'fs';
import * as path from 'path';
import { executeBashSript, getFileList } from './utils';
import { MailService } from 'src/mail/mail.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BlockchainService {
    private readonly logger = new Logger(BlockchainService.name);

    private readonly BASE_PATH = path.join(process.cwd(), 'src', 'blockchain');
    private readonly SCRIPT_DIR_PATH = path.join(this.BASE_PATH, 'scripts', 'org-template-scripts');
    private readonly ORG_DIR_PATH = path.join(this.BASE_PATH, 'addOrgTemplate');
    private readonly MAKE_EXECUTABLE_SCRIPT_PATH = path.join(process.cwd(), 'src', 'blockchain', 'scripts', 'makeGeneratedScriptsExecutable.sh')

    constructor(
        private configService: ConfigService, 
        private mailService: MailService
    ) {}

    /**
     * Generates all files needed to create a new organization, invokes scripts and creates a wallet
     * @param user 
     * @returns 
     */
    async enrollOrg(user: User): Promise<string> {
        this.logger.log('Start enrolling organization: ' + user.organization);

        const awsGenerateInvitationScriptPath = path.join(process.cwd(), 'src', 'blockchain', 'scripts', 'awsGenerateInvitation.sh');
        const proposalId: string = await executeBashSript(
            awsGenerateInvitationScriptPath, 
            [
                this.configService.get('AWS_ACCOUNT_ID'),
                this.configService.get('AWS_NETWORK_ID'),
                this.configService.get('AWS_MEMBER_ID'),
            ], 
            this.logger
        ).then(res => {
            if(res) return res.replaceAll('"', "");
            return res;
        });

        this.logger.log("proposalId generated: " + proposalId);

        // Send proposalId to client Email
        if (proposalId) {
            await this.mailService.sendProposalId(user, proposalId);
            return proposalId
        }

        throw new HttpException('Error during Org initialization', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Generates all files needed to create a new organization
     * @param user 
     * @returns 
     */
    private async generateOrgFiles(user: User) {
        this.logger.log('Start generating files for organization: ' + user.organization);
        
        // Generating folder structure in order to save new files
        await this.generateDirStructure(user);

        // Read all template files
        let generatedFiles: Array<String> = new Array<String>();
        const orgTemplateFiles: string[] = (await getFileList(this.ORG_DIR_PATH)).concat(...(await getFileList(this.SCRIPT_DIR_PATH)));

        // Convert each template to a new file needed to create the new organization
        for(const file of orgTemplateFiles) {
            generatedFiles.push(await this.generateFromTemplate(user, file));
        }

        if(generatedFiles.length == orgTemplateFiles.length) {
            // Make generated scripts executable
            executeBashSript(this.MAKE_EXECUTABLE_SCRIPT_PATH, new Array<string>(), this.logger);
            return generatedFiles;
        }

        this.logger.warn(`The number generated files (${generatedFiles.length}) is not corresponding to (${orgTemplateFiles.length})`)
        throw new HttpException('Error during Org initialization', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Replace placeholders with user info and stores a new file under generated folder
     * @param user User info
     * @param dirPath base file path
     * @param fileName file name
     * @returns 
     */
    private async generateFromTemplate(user: User, fileName: string): Promise<String> {
        const ORGANIZATION_NAME_PLACEHOLDER = 'ORGANIZATION_NAME_PLACEHOLDER';
        const ORGANIZATION_NAME_LOWERCASE_PLACEHOLDER = 'ORGANIZATION_NAME_LOWERCASE_PLACEHOLDER';
        const ORGANIZATION_DOMAIN_PLACEHOLDER = 'ORGANIZATION_DOMAIN_PLACEHOLDER';

        const newFilePath = path.join(fileName.replace('addOrgTemplate', 'generated/addOrg' + user.name + user.surname)
            .replace('org-template-scripts', 'generated/org-' + (user.name + user.surname).toLowerCase() + '-scripts')
            .replace('Template', user.name + user.surname)
            .replace('template', (user.name + user.surname).toLowerCase()));

        try {
            this.logger.log('Generating file: ' + newFilePath);
            let data: string = (await readFile(fileName)).toString();

            data = data.replaceAll(ORGANIZATION_NAME_PLACEHOLDER, user.name + user.surname);
            data = data.replaceAll(ORGANIZATION_NAME_LOWERCASE_PLACEHOLDER, (user.name + user.surname).toLowerCase());
            data = data.replaceAll(ORGANIZATION_DOMAIN_PLACEHOLDER, user.organization);

            await writeFile(newFilePath, data, 'utf-8');
            return newFilePath;
        } catch (error) {
            this.logger.error(error);
            this.logger.warn('Failed to generate file: ' + newFilePath);
            return undefined;
        }
    }

    private async generateDirStructure(user: User) {
        const dirPath = [
            path.join('generated', 'addOrg' + user.name + user.surname, 'compose', 'docker', 'peercfg'),
            path.join('generated', 'addOrg' + user.name + user.surname, 'compose', 'podman', 'peercfg'),
            path.join('generated', 'addOrg' + user.name + user.surname, 'fabric-ca', 'org-' + (user.name + user.surname).toLowerCase()),
            path.join('scripts', 'generated', 'org-' + (user.name + user.surname).toLowerCase() + '-scripts'),
            path.join('organizations', 'peerOrganizations'),
            path.join('organizations', 'ordererOrganizations'),
        ]

        let currDirPath: string;

        dirPath.forEach(folderStruct => {
            currDirPath = this.BASE_PATH;
            folderStruct.split(path.sep).forEach(el => {
                currDirPath = path.join(currDirPath, el);
                // If folder not exists generate it
                if(!fs.existsSync(currDirPath))
                    fs.mkdirSync(currDirPath);
            })
        })
            
    }

}
