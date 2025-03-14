import { z } from 'zod';

import { Subscription, subscriptionList } from '@/constants/auth.js';

export const userSchema = z.object({
    id: z.string().uuid(),
    password: z.string().nonempty(),
    email: z.string().email(),
    subscription: z.enum(subscriptionList as [Subscription, ...Subscription[]]),
    token: z.string().nullable(),
    avatarURL: z.string().nullable(),
    verify: z.boolean(),
    verificationToken: z.string().nullable(),
});

export type UserSchemaAttributes = z.infer<typeof userSchema>;

export const signUpPayloadSchema = userSchema.pick({ email: true, password: true });

export type SignUpResponse = { user: PublicUserAttributes; token: null };

export const signInPayloadSchema = userSchema.pick({ email: true, password: true });

export type SignInResponse = { user: PublicUserAttributes; token: string };

export const jwtUserSchema = userSchema.pick({ email: true, id: true });

export type JwtUserPayload = z.infer<typeof jwtUserSchema>;

export const publicUserSchema = userSchema.omit({
    password: true,
    token: true,
    verificationToken: true,
});

export type PublicUserAttributes = z.infer<typeof publicUserSchema>;

export const updateSubscriptionPayloadSchema = userSchema.pick({ subscription: true });

export const resendVerifyEmailPayloadSchema = userSchema.pick({
    email: true,
});

export type ResendVerifyEmailPayload = z.infer<typeof resendVerifyEmailPayloadSchema>;
