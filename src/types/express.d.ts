import { UserSchemaAttributes } from '@/schemas/authSchemas.ts';

declare global {
    namespace Express {
        interface Request {
            user?: UserSchemaAttributes;
        }
    }
}

export {};
