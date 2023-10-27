import { Request } from "express";
import { extname } from "path";

export function editFileName(req: Request, file: Express.Multer.File, callback) {
    const fileExtName = extname(file.originalname);
    const name = file.originalname.split(fileExtName)[0];

    callback(null, `${name}${fileExtName}`);
};

export function fileFilter(req: Request, file: Express.Multer.File, callback) {
    if(file.size > 10000)
        return callback(new Error('File size must be less than 10KB'), false);
    callback(null, true);
};