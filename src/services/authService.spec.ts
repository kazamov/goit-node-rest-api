import bcrypt from 'bcrypt';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Subscription } from '@/constants/auth.js';
import { User } from '@/db/models/User.js';
import HttpError from '@/helpers/HttpError.js';
import { createToken } from '@/helpers/jwt.js';
import { signIn } from '@/services/authServices.js';
import { UserAttributes } from '@/types/user.js';

vi.mock('bcrypt', () => ({
    default: {
        compare: vi.fn(),
    },
}));

vi.mock('@/helpers/jwt.js', () => ({
    createToken: vi.fn(),
}));

vi.mock('@/db/models/User.js', () => ({
    User: {
        findOne: vi.fn(),
    },
}));

interface MockUserModel extends UserAttributes {
    toJSON: () => UserAttributes;
    update: (
        data: Partial<UserAttributes>,
        options: { returning: boolean },
    ) => Promise<MockUserModel>;
}

describe('authServices.signIn', () => {
    const mockUser: MockUserModel = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        password: 'hashed-password',
        avatarURL: 'avatar-url',
        subscription: Subscription.STARTER,
        token: null,
        verify: true,
        verificationToken: null,
        toJSON: function () {
            return {
                id: this.id,
                email: this.email,
                password: this.password,
                avatarURL: this.avatarURL,
                subscription: this.subscription,
                token: this.token,
                verify: this.verify,
                verificationToken: this.verificationToken,
            };
        },
        update: vi.fn().mockImplementation(function (this: MockUserModel, data) {
            Object.assign(this, data);
            return Promise.resolve(this);
        }),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should successfully sign in with valid credentials', async () => {
        // Arrange
        vi.mocked(User.findOne).mockResolvedValue(mockUser as unknown as User);
        vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
        vi.mocked(createToken).mockReturnValue('new-token');

        // Act
        const result = await signIn('test@example.com', 'correct-password');

        // Assert
        expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
        expect(bcrypt.compare).toHaveBeenCalledWith('correct-password', 'hashed-password');
        expect(createToken).toHaveBeenCalled();
        expect(mockUser.update).toHaveBeenCalledWith({ token: 'new-token' }, { returning: true });

        expect(result).toEqual({
            user: {
                id: '550e8400-e29b-41d4-a716-446655440000',
                email: 'test@example.com',
                avatarURL: 'avatar-url',
                subscription: Subscription.STARTER,
                verify: true,
            },
            token: 'new-token',
        });
    });

    it('should throw error when email is incorrect', async () => {
        // Arrange
        vi.mocked(User.findOne).mockResolvedValue(null);

        // Act & Assert
        await expect(signIn('wrong@example.com', 'password')).rejects.toThrow(
            new HttpError('Email or password is incorrect', 401),
        );
        expect(bcrypt.compare).not.toHaveBeenCalled();
        expect(createToken).not.toHaveBeenCalled();
    });

    it('should throw error when password is incorrect', async () => {
        // Arrange
        vi.mocked(User.findOne).mockResolvedValue(mockUser as unknown as User);
        vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

        // Act & Assert
        await expect(signIn('test@example.com', 'wrong-password')).rejects.toThrow(
            new HttpError('Email or password is incorrect', 401),
        );
        expect(bcrypt.compare).toHaveBeenCalledWith('wrong-password', 'hashed-password');
        expect(createToken).not.toHaveBeenCalled();
        expect(mockUser.update).not.toHaveBeenCalled();
    });
});
