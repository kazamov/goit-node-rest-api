import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

import { createUser, deleteUser } from './utils.js';

import { Subscription } from '@/constants/auth.js';
import { User } from '@/db/models/User.js';

test.describe('Resend verification email endpoint', () => {
    test.describe('with invalid data', () => {
        [
            {
                email: '',
                errors: ['email: Invalid email'],
            },
            {
                email: undefined,
                errors: ['email: Required'],
            },
            {
                email: 'wrongemail',
                errors: ['email: Invalid email'],
            },
        ].forEach(({ email, errors }) => {
            test(`cannot resend verification email with invalid data: email - '${email}'`, async ({
                request,
            }) => {
                const response = await request.post(`/api/auth/verify`, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    data: {
                        email,
                    },
                });

                expect(response.ok()).toBeFalsy();
                expect(response.status()).toBe(400);

                const jsonBody = await response.json();

                expect(jsonBody).toEqual({
                    message: 'Validation failed',
                    errors,
                });
            });
        });
    });

    test('cannot resend verification email if user not found', async ({ request }) => {
        const response = await request.post(`/api/auth/verify`, {
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                email: faker.internet.email(),
            },
        });

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

        test.beforeAll(async () => {
            await createUser({
                email: USER_EMAIL,
                password: USER_PASSWORD,
                subscription: USER_SUBSCRIPTION,
                avatarURL: USER_AVATAR_URL,
                verify: true,
                verificationToken: null,
            });
        });

        test.afterAll(async () => {
            await deleteUser(USER_EMAIL);
        });

        test('cannot resend verification email', async ({ request }) => {
            const response = await request.post(`/api/auth/verify`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    email: USER_EMAIL,
                },
            });

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
                    verificationToken: null,
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

        test.beforeAll(async () => {
            await createUser({
                email: USER_EMAIL,
                password: USER_PASSWORD,
                subscription: USER_SUBSCRIPTION,
                avatarURL: USER_AVATAR_URL,
                verify: false,
                verificationToken: null,
            });
        });

        test.afterAll(async () => {
            await deleteUser(USER_EMAIL);
        });

        test('can resend verification email', async ({ request }) => {
            const response = await request.post(`/api/auth/verify`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    email: USER_EMAIL,
                },
            });

            expect(response.ok()).toBeTruthy();
            expect(response.status()).toBe(200);
            expect(response.statusText()).toBe('OK');

            const jsonBody = await response.json();
            expect(jsonBody).toEqual({
                message: 'Verification email sent',
            });

            const user = await User.findOne({
                where: {
                    email: USER_EMAIL,
                },
            });

            expect(user).toEqual(
                expect.objectContaining({
                    verificationToken: expect.any(String),
                    verify: false,
                }),
            );
        });
    });
});
