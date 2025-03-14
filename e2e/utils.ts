import bcrypt from 'bcrypt';

import { User } from '@/db/models/User.js';
import { UserAttributes } from '@/types/user.js';

export async function createUser({
    email,
    password,
    subscription,
    avatarURL,
    verify,
    verificationToken,
}: Omit<UserAttributes, 'id' | 'token'>) {
    const passwordHash = await bcrypt.hash(password, 10);

    await User.create({
        email,
        password: passwordHash,
        subscription,
        avatarURL,
        verify,
        verificationToken,
    });
}

export async function deleteUser(email: string) {
    await User.destroy({
        where: {
            email: email,
        },
    });
}
