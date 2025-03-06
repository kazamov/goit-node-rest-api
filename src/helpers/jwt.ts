import jwt, { type SignOptions } from 'jsonwebtoken';

import { JwtUserPayload } from '@/schemas/authSchemas.js';

const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;

export function createToken(payload: JwtUserPayload): string {
    return jwt.sign(payload, JWT_SECRET as string, {
        expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'],
    });
}

type VerifyTokenResult = { data: JwtUserPayload; error: null } | { data: null; error: Error };

export function verifyToken(token: string): VerifyTokenResult {
    try {
        const data = jwt.verify(token, JWT_SECRET as string) as JwtUserPayload;
        return { data, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}
