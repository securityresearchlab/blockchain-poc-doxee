import { Logger } from "@nestjs/common";
import { exec, execFile } from "child_process";
import { readdir } from "fs/promises";

export async function getFileList(dirName: string): Promise<string[]> {
    let files: string[] = [];
    const items = await readdir(dirName, { withFileTypes: true });

    for (const item of items) {
        if (item.isDirectory()) {
            files = [
                ...files,
                ...(await getFileList(`${dirName}/${item.name}`)),
            ];
        } else {
            files.push(`${dirName}/${item.name}`);
        }
    }

    return files;
};

export async function executeBashSript(command: string, args: Array<string>, logger: Logger) {
    return new Promise((resolve, reject) => {
        execFile(command, args, (err, stdout, stderr) => {
            if (err)
                logger.error(err);
            if (stdout) {
                logger.log(stdout);
                resolve(stdout);
            }
            if (stderr)
                logger.warn(stderr);
            resolve(undefined);
        });
    });
}