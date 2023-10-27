import { Request } from "express";

interface FileMapper {
    file: Express.Multer.File,
    req: Request,
}

interface FilesMapper {
    files: Array<Express.Multer.File>,
    req: Request,
}

export function fileMapper({file, req}: FileMapper) {
    const url = `${req.protocol}://${req.headers.host}/${file.path}`;
    return {
        originalName: file.originalname,
        filename: file.filename,
        url,
    };
}

export function filesMapper({files, req}: FilesMapper) {
    return files.map((file) => fileMapper({file, req}));
}