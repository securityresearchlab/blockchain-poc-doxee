import { HttpException, HttpStatus, Logger } from "@nestjs/common";
import { execFile } from "child_process";

export async function executeBashSript(command: string, args: Array<string>, logger: Logger): Promise<string> {
    return new Promise((resolve, reject) => {
        execFile(command, args, (err, stdout, stderr) => {
            if (err) {
                logger.error(err);
                reject(err);
            }
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