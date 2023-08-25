import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { User } from 'src/users/entities/user';
import { readFile, readdir, writeFile } from 'fs/promises';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';

/**
 * This service provides methods to invoke scripts in order to interact with network blockchain
 */
@Injectable()
export class BlockchainService {
    private readonly logger = new Logger(BlockchainService.name);

    private readonly BASE_PATH = path.join(process.cwd(), 'src', 'blockchain');
    private readonly SCRIPT_DIR_PATH = path.join(this.BASE_PATH, 'scripts', 'org-template-scripts');
    private readonly ORG_DIR_PATH = path.join(this.BASE_PATH, 'addOrgTemplate');
    private readonly MAKE_EXECUTABLE_SCRIPT_PATH = path.join(process.cwd(), 'src', 'blockchain', 'scripts', 'makeGeneratedScriptsExecutable.sh')

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

        // 2. Invoke generated scripts [ joining channel , create private data collection with main organization]

        // 3. Create org wallet

        this.logger.log('Organization ' + user.organization + ' enrolled');

        // For testing purposes
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
        exec(this.MAKE_EXECUTABLE_SCRIPT_PATH, (err, stdout, stderr) => {
            this.logger.error(err);
            this.logger.log(stdout);
            this.logger.warn(stderr);
        });

        // Read all template files
        let generatedFiles: Array<String> = new Array<String>();
        const orgTemplateFiles: string[] = (await this.getFileList(this.ORG_DIR_PATH)).concat(...(await this.getFileList(this.SCRIPT_DIR_PATH)));

        // Convert each template to a new file needed to create the new organization
        for(const file of orgTemplateFiles) {
            generatedFiles.push(await this.generateFromTemplate(user, file));
        }

        if(generatedFiles.length == orgTemplateFiles.length)
            return generatedFiles;

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
        const ORGANIZATION_DOMAIN_PLACEHOLDER = 'ORGANIZATION_DOMAIN_PLACEHOLDER';

        const newFilePath = path.join(fileName.replace('addOrgTemplate', 'generated/addOrg' + user.name + user.surname)
            .replace('org-template-scripts', 'generated/org-' + user.name.toLowerCase() + user.surname.toLowerCase() + '-scripts')
            .replace('Template', user.name + user.surname)
            .replace('template', user.name.toLowerCase() + user.surname.toLowerCase()));

        try {
            this.logger.log('Generating file: ' + newFilePath);
            let data: string = (await readFile(fileName)).toString();

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

    private async generateDirStructure(user: User) {
        const dirPath = [
            path.join('generated', 'addOrg' + user.name + user.surname, 'compose', 'docker', 'peercfg'),
            path.join('generated', 'addOrg' + user.name + user.surname, 'compose', 'podman', 'peercfg'),
            path.join('generated', 'addOrg' + user.name + user.surname, 'fabric-ca', 'org-' + user.name.toLowerCase() + user.surname.toLowerCase()),
            path.join('scripts', 'generated', 'org-' + user.name.toLowerCase() + user.surname.toLowerCase() + '-scripts'),
            // path.join('organizations', 'peerOrganizations', 'org' + user.name + user.surname + '.example.com', 'peers', 'peer0.org' + user.name + user.surname + '.example.com'),
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

    async getFileList(dirName: string): Promise<string[]> {
        let files: string[] = [];
        const items = await readdir(dirName, { withFileTypes: true });
    
        for (const item of items) {
            if (item.isDirectory()) {
                files = [
                    ...files,
                    ...(await this.getFileList(`${dirName}/${item.name}`)),
                ];
            } else {
                files.push(`${dirName}/${item.name}`);
            }
        }
    
        return files;
    };
}
