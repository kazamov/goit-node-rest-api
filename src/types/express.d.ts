import { PublicUserAttributes } from '@/schemas/authSchemas.ts';

declare global {
    namespace Express {
        interface Request {
            user?: PublicUserAttributes;
        }
    }
}

export {};
