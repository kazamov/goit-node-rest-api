import bcrypt from 'bcrypt';
import gravatar from 'gravatar';
import { v4 as uuidv4 } from 'uuid';

import { getConfig } from '@/config.js';
import { Subscription } from '@/constants/auth.js';
import { User } from '@/db/models/User.js';
import HttpError from '@/helpers/HttpError.js';
import { createToken } from '@/helpers/jwt.js';
import { sendEmail } from '@/helpers/sendEmail.js';
import {
    jwtUserSchema,
    PublicUserAttributes,
    publicUserSchema,
    SignInResponse,
    SignUpResponse,
    userSchema,
    UserSchemaAttributes,
} from '@/schemas/authSchemas.js';
import { UserAttributes } from '@/types/user.js';

type UserQuery =
    | Pick<UserSchemaAttributes, 'email'>
    | Pick<UserSchemaAttributes, 'id'>
    | Pick<UserSchemaAttributes, 'email' | 'id'>;

export async function findUser(query: UserQuery): Promise<UserSchemaAttributes | null> {
    const user = await User.findOne({
        where: query,
    });
    return user ? userSchema.parse(user.toJSON()) : null;
}

async function sendVerificationEmail(email: string, verificationToken: string): Promise<void> {
    const config = getConfig();

    await sendEmail(
        email,
        'Contacts API - Verification Email',
        `
        Please verify your email by clicking the link:
        <a href="${config.apiDomain}/api/auth/verify/${verificationToken}">Verify Email</a>
    `,
    );
}

export async function signUp(
    payload: Pick<UserSchemaAttributes, 'email' | 'password'>,
): Promise<SignUpResponse> {
    const { email, password } = payload;
    const user = await User.findOne({
        where: { email },
    });

    if (user) {
        throw new HttpError(`User with email '${email}' already exists`, 409);
    }

    const avatarURL = gravatar.url(email, {}, true);

    const passwordHash = await bcrypt.hash(password, 10);

    const verificationToken = uuidv4();

    const newUser = await User.create(
        {
            email,
            password: passwordHash,
            avatarURL,
            subscription: Subscription.STARTER,
            verificationToken,
        },
        { returning: true },
    );

    await sendVerificationEmail(email, verificationToken);

    return { user: publicUserSchema.parse(newUser.toJSON()), token: null };
}

export async function signIn(email: string, password: string): Promise<SignInResponse> {
    const user = await User.findOne({
        where: { email },
    });

    if (!user) {
        throw new HttpError('Email or password is incorrect', 401);
    }

    if (!(user as unknown as UserAttributes).verify) {
        throw new HttpError('Email not verified', 401);
    }

    const passwordMatch = await bcrypt.compare(
        password,
        (user as unknown as UserAttributes).password,
    );
    if (!passwordMatch) {
        throw new HttpError('Email or password is incorrect', 401);
    }

    const userPayload = jwtUserSchema.parse(user.toJSON());
    const token = createToken(userPayload);

    await user.update({ token }, { returning: true });

    return { user: publicUserSchema.parse(user.toJSON()), token };
}

export async function signOut(id: string): Promise<void> {
    const user = await User.findByPk(id);
    if (!user) {
        throw new HttpError('Not authorized', 401);
    }
    await user.update({ token: null }, { returning: true });
}

export function getCurrentUser(user: UserSchemaAttributes): PublicUserAttributes {
    return publicUserSchema.parse(user);
}

export async function updateSubscription(
    id: string,
    subscription: Subscription,
): Promise<PublicUserAttributes> {
    const user = await User.findByPk(id);

    if (!user) {
        throw new HttpError('Not authorized', 401);
    }

    await user.update({ subscription }, { returning: true });

    return publicUserSchema.parse(user.toJSON());
}

export async function updateAvatar(id: string, avatarURL: string): Promise<PublicUserAttributes> {
    const user = await User.findByPk(id);

    if (!user) {
        throw new HttpError('Not authorized', 401);
    }

    await user.update({ avatarURL }, { returning: true });

    return publicUserSchema.parse(user.toJSON());
}

export async function verifyEmail(verificationToken: string): Promise<void> {
    const user = await User.findOne({
        where: { verificationToken },
    });

    if (!user) {
        throw new HttpError('User not found', 404);
    }

    if ((user as unknown as UserAttributes).verify) {
        throw new HttpError('Verification has already been passed', 400);
    }

    await user.update({ verify: true, verificationToken: null }, { returning: true });
}

export async function resendVerifyEmail(email: string): Promise<void> {
    const user = await User.findOne({
        where: { email },
    });

    if (!user) {
        throw new HttpError('User not found', 404);
    }

    if ((user as unknown as UserAttributes).verify) {
        throw new HttpError('Verification has already been passed', 400);
    }

    const verificationToken = uuidv4();
    await user.update({ verificationToken }, { returning: true });

    await sendVerificationEmail(email, verificationToken);
}
