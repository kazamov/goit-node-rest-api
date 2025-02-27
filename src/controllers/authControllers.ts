import { Request, Response } from 'express';

import { PublicUserAttributes } from '@/schemas/authSchemas.js';
import * as authService from '@/services/authServices.js';

export async function signUp(req: Request, res: Response) {
    const { email, password } = req.body;

    const user = await authService.signUp({ email, password });

    res.json(user);
}

export async function signIn(req: Request, res: Response) {
    const { email, password } = req.body;

    const token = await authService.signIn(email, password);

    res.json(token);
}

export async function signOut(req: Request, res: Response) {
    const { id } = req.user as PublicUserAttributes;

    await authService.signOut(id);

    res.json({ success: true });
}

export async function getCurrent(req: Request, res: Response) {
    res.json(req.user);
}

export async function updateSubscription(req: Request, res: Response) {
    const { id } = req.user as PublicUserAttributes;
    const { subscription } = req.body;

    const user = await authService.updateSubscription(id, subscription);

    res.json(user);
}
