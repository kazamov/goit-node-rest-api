import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import { createUser, deleteUser } from './utils.js';

import { Subscription } from '@/constants/auth.js';
import { User } from '@/db/models/User.js';

test.describe('Verify token endpoint', () => {
    test('fail with invalid token', async ({ request }) => {
        const response = await request.get(`/api/auth/verify/invalid-token`);

        expect(response.ok()).toBeFalsy();
        expect(response.status()).toBe(404);

        const jsonBody = await response.json();
        expect(jsonBody).toEqual({
            message: 'User not found',
        });
    });

    test.describe('with verified user', () => {
        const USER_EMAIL = faker.internet.email();
        const USER_PASSWORD = faker.internet.password();
        const USER_SUBSCRIPTION = Subscription.STARTER;
        const USER_AVATAR_URL = faker.image.avatar();
        const USER_VERIFICATION_TOKEN = uuidv4();

        test.beforeAll(async () => {
            await createUser({
                email: USER_EMAIL,
                password: USER_PASSWORD,
                subscription: USER_SUBSCRIPTION,
                avatarURL: USER_AVATAR_URL,
                verify: true,
                verificationToken: USER_VERIFICATION_TOKEN,
            });
        });

        test.afterAll(async () => {
            await deleteUser(USER_EMAIL);
        });

        test('cannot verify again', async ({ request }) => {
            const response = await request.get(`/api/auth/verify/${USER_VERIFICATION_TOKEN}`);

            expect(response.ok()).toBeFalsy();
            expect(response.status()).toBe(400);
            expect(response.statusText()).toBe('Bad Request');

            const jsonBody = await response.json();
            expect(jsonBody).toEqual({
                message: 'Verification has already been passed',
            });

            const user = await User.findOne({
                where: {
                    email: USER_EMAIL,
                },
            });

            expect(user).toEqual(
                expect.objectContaining({
                    verificationToken: USER_VERIFICATION_TOKEN,
                    verify: true,
                }),
            );
        });
    });

    test.describe('with unverified user', () => {
        const USER_EMAIL = faker.internet.email();
        const USER_PASSWORD = faker.internet.password();
        const USER_SUBSCRIPTION = Subscription.STARTER;
        const USER_AVATAR_URL = faker.image.avatar();
        const USER_VERIFICATION_TOKEN = uuidv4();

        test.beforeAll(async () => {
            await createUser({
                email: USER_EMAIL,
                password: USER_PASSWORD,
                subscription: USER_SUBSCRIPTION,
                avatarURL: USER_AVATAR_URL,
                verify: false,
                verificationToken: USER_VERIFICATION_TOKEN,
            });
        });

        test.afterAll(async () => {
            await deleteUser(USER_EMAIL);
        });

        test('can resend verification email', async ({ request }) => {
            const response = await request.get(`/api/auth/verify/${USER_VERIFICATION_TOKEN}`);

            expect(response.ok()).toBeTruthy();
            expect(response.status()).toBe(200);
            expect(response.statusText()).toBe('OK');

            const jsonBody = await response.json();
            expect(jsonBody).toEqual({
                message: 'Verification successful',
            });

            const user = await User.findOne({
                where: {
                    email: USER_EMAIL,
                },
            });

            expect(user).toEqual(
                expect.objectContaining({
                    verificationToken: null,
                    verify: true,
                }),
            );
        });
    });
});
