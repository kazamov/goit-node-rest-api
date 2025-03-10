import bcrypt from 'bcrypt';
import gravatar from 'gravatar';

import { Subscription } from '@/constants/auth.js';
import { User } from '@/db/models/User.js';
import HttpError from '@/helpers/HttpError.js';
import { createToken } from '@/helpers/jwt.js';
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

    let newUser = await User.create(
        { email, password: passwordHash, avatarURL, subscription: Subscription.STARTER },
        { returning: true },
    );

    const userPayload = jwtUserSchema.parse(newUser.toJSON());
    const token = createToken(userPayload);

    newUser = await newUser.update({ token }, { returning: true });

    return { user: publicUserSchema.parse(newUser.toJSON()), token };
}

export async function signIn(email: string, password: string): Promise<SignInResponse> {
    const user = await User.findOne({
        where: { email },
    });

    if (!user) {
        throw new HttpError('Email or password is incorrect', 401);
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
