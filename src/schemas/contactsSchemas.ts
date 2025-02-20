import { z } from 'zod';

export const contactSchema = z.object({
    id: z.string().uuid(),
    name: z.string().nonempty(),
    email: z.string().email(),
    phone: z.string().nonempty(),
    favorite: z.boolean().optional(),
});

export type ContactAttributes = z.infer<typeof contactSchema>;

export const createContactSchema = contactSchema.omit({ id: true });

export const updateContactSchema = contactSchema
    .omit({ id: true })
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
        message: 'Body must have at least one field',
        path: [],
    });

export const updateStatusContactSchema = contactSchema.pick({ favorite: true });
