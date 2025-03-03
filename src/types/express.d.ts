import { UserAttributes } from '@/schemas/authSchemas.ts';

declare global {
    namespace Express {
        interface Request {
            user?: UserAttributes;
        }
    }
}

export {};
