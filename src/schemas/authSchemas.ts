import { z } from 'zod';

import { Subscription, subscriptionList } from '@/constants/auth.js';

export const userSchema = z.object({
    id: z.string().uuid(),
    password: z.string().nonempty(),
    email: z.string().email(),
    subscription: z.enum(subscriptionList as [Subscription, ...Subscription[]]),
    token: z.string().nullable(),
});

export type UserAttributes = z.infer<typeof userSchema>;

export const signUpPayloadSchema = userSchema.pick({ email: true, password: true });

export type SignUpResponse = { user: PublicUserAttributes; token: string };

export const signInPayloadSchema = userSchema.pick({ email: true, password: true });

export type SignInResponse = { token: string };

export const jwtUserSchema = userSchema.pick({ email: true, id: true });

export type JwtUserPayload = z.infer<typeof jwtUserSchema>;

export const publicUserSchema = userSchema.omit({ password: true, token: true });

export type PublicUserAttributes = z.infer<typeof publicUserSchema>;

export const updateSubscriptionPayloadSchema = userSchema.pick({ subscription: true });
