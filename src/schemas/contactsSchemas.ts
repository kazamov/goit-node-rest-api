import { z } from 'zod';

export const contactSchema = z.object({
    id: z.string(),
    name: z.string().nonempty(),
    email: z.string().email(),
    phone: z.string().nonempty(),
});

export type Contact = z.infer<typeof contactSchema>;

export const createContactSchema = contactSchema.omit({ id: true });

export const updateContactSchema = contactSchema
    .omit({ id: true })
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
        message: 'At least one field must be provided',
        path: [],
    });
