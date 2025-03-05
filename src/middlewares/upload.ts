import multer from 'multer';
import path from 'node:path';

import HttpError from '@/helpers/HttpError.js';

const destination = path.resolve('tmp');

const storage: multer.Options['storage'] = multer.diskStorage({
    destination,
    filename: (req, file, cb) => {
        const uniquePrefix = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
        cb(null, `${uniquePrefix}_${file.originalname}`);
    },
});

const limits: multer.Options['limits'] = {
    fileSize: 1024 * 1024 * 5, // 5 MB
};

const fileFilter: multer.Options['fileFilter'] = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new HttpError('Invalid file type. Only JPEG, PNG, and GIF are allowed.', 400));
    }
    cb(null, true);
};

export const upload = multer({ storage, limits, fileFilter });
