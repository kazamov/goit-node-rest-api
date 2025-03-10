import fs from 'fs/promises';
import path from 'path';

import { Request, Response } from 'express';

import HttpError from '@/helpers/HttpError.js';
import { UserSchemaAttributes } from '@/schemas/authSchemas.js';
import * as authService from '@/services/authServices.js';

export async function signUp(req: Request, res: Response) {
    const { email, password } = req.body;

    const user = await authService.signUp({ email, password });

    res.status(201).json(user);
}

export async function signIn(req: Request, res: Response) {
    const { email, password } = req.body;

    const user = await authService.signIn(email, password);

    res.json(user);
}

export async function signOut(req: Request, res: Response) {
    const { id } = req.user as UserSchemaAttributes;

    await authService.signOut(id);

    res.json({ success: true });
}

export async function getCurrent(req: Request, res: Response) {
    res.json(authService.getCurrentUser(req.user as UserSchemaAttributes));
}

export async function updateSubscription(req: Request, res: Response) {
    const { id } = req.user as UserSchemaAttributes;
    const { subscription } = req.body;

    const user = await authService.updateSubscription(id, subscription);

    res.json(user);
}

const avatarsDir = path.resolve('public', 'avatars');

export async function updateAvatar(req: Request, res: Response) {
    const { id } = req.user as UserSchemaAttributes;
    if (!req.file) {
        throw new HttpError('No file uploaded', 400);
    }

    const { path: tempPath, filename } = req.file;

    try {
        await fs.rename(tempPath, path.join(avatarsDir, filename));
    } catch {
        await fs.unlink(tempPath);
        throw new HttpError('Failed to process file', 500);
    }

    const avatarURL = path.join('avatars', filename);

    const user = await authService.updateAvatar(id, avatarURL);

    res.json(user);
}
