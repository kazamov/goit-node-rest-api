import { z } from 'zod';

export const contactSchema = z.object({
    id: z.string().uuid(),
    name: z.string().nonempty(),
    email: z.string().email(),
    phone: z.string().nonempty(),
    favorite: z.boolean().optional(),
    owner: z.string().uuid(),
});

export type ContactSchemaAttributes = z.infer<typeof contactSchema>;

export const createContactSchema = contactSchema.omit({ id: true, owner: true });

export const updateContactSchema = contactSchema
    .omit({ id: true, owner: true })
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
        message: 'Body must have at least one field',
        path: [],
    });

export const updateStatusContactSchema = contactSchema.pick({ favorite: true });

export const contactsQuerySchema = z.object({
    favorite: z
        .string()
        .optional()
        .transform((val) => {
            if (val === undefined) return undefined;
            return val === 'true';
        }),
    page: z
        .string()
        .optional()
        .transform((val) => (val ? Number(val) : undefined))
        .refine((val) => !val || (val > 0 && Number.isInteger(val)), {
            message: 'Page must be a positive integer',
        }),
    limit: z
        .string()
        .optional()
        .transform((val) => (val ? Number(val) : undefined))
        .refine((val) => !val || (val > 0 && Number.isInteger(val)), {
            message: 'Limit must be a positive integer',
        }),
});

export type ContactsQueryParams = z.infer<typeof contactsQuerySchema>;
