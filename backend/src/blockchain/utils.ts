import { Logger } from "@nestjs/common";
import { execFile, spawn } from "child_process";

export async function executeBashSript(command: string, args: Array<string>, logger: Logger): Promise<string> {
    return new Promise((resolve, reject) => {
        execFile(command, args, (err, stdout, stderr) => {
            if (err) 
                handleReject(reject, err, logger);
            if (stdout) 
                handleResolve(resolve, err, logger);
            if (stderr)
                logger.warn(stderr);
            resolve(undefined);
        });
    });
};

export async function executeBashScriptSpawn(command: string, args: Array<string>, logger: Logger) {
    return new Promise((resolve, reject) => {
        const process = spawn(command, args, {shell: true});
        process.on('close', (close) => handleResolve(resolve, close, logger));
        process.on('disconnect', (disconnect) => handleResolve(resolve, disconnect, logger));
        process.on('exit', (exit) => handleResolve(resolve, exit, logger));
        process.on('message', (message) => handleResolve(resolve, message, logger));
        process.on('error', (err) => handleReject(reject, err, logger));
    });
}

function handleResolve(callback: (arg: any) => any, arg: any, logger: Logger) {
    logger.log(arg);
    return callback(arg);
}

function handleReject(callback: (arg: any) => any, arg: any, logger: Logger) {
    logger.warn(arg);
    return callback(arg);
}