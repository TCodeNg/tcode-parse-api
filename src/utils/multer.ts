import * as Multer from 'multer';
import { Request }                                   from "express";

const _storage = Multer.diskStorage({});
export const multer = (storage: Multer.StorageEngine = _storage, fileFilter?: (req: Request, file: Express.Multer.File, callback: Multer.FileFilterCallback) => void) => {
    return Multer({
        storage,
        fileFilter
    })
};
