import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';
import bcrypt from 'bcrypt';

import { Subscription } from '@/constants/auth.js';
import { User } from '@/db/models/User.js';

test.describe('SignIn endpoint', () => {
    const USER_EMAIL = faker.internet.email();
    const USER_PASSWORD = faker.internet.password();
    const USER_SUBSCRIPTION = Subscription.STARTER;
    const USER_AVATAR_URL = faker.image.avatar();

    test.beforeAll(async () => {
        const passwordHash = await bcrypt.hash(USER_PASSWORD, 10);

        await User.create({
            email: USER_EMAIL,
            password: passwordHash,
            subscription: USER_SUBSCRIPTION,
            avatarURL: USER_AVATAR_URL,
        });
    });

    test.afterAll(async () => {
        await User.destroy({
            where: {
                email: USER_EMAIL,
            },
        });
    });

    test.describe('with valid data', () => {
        test('can sign in', async ({ request }) => {
            const response = await request.post(`/api/auth/login`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    email: USER_EMAIL,
                    password: USER_PASSWORD,
                },
            });

            expect(response.ok()).toBeTruthy();
            expect(response.status()).toBe(200);
            expect(response.statusText()).toBe('OK');

            const jsonBody = await response.json();

            expect(jsonBody).toEqual(
                expect.objectContaining({
                    token: expect.any(String),
                    user: expect.objectContaining({
                        id: expect.any(String),
                        email: USER_EMAIL,
                        subscription: USER_SUBSCRIPTION,
                        avatarURL: USER_AVATAR_URL,
                    }),
                }),
            );

            // Ensure sensitive data is not present
            expect(jsonBody.user).not.toHaveProperty('token');
            expect(jsonBody.user).not.toHaveProperty('password');
        });
    });

    test.describe('with invalid data', () => {
        [
            {
                email: '',
                password: '',
                errors: [
                    'email: Invalid email',
                    'password: String must contain at least 1 character(s)',
                ],
            },
            {
                email: undefined,
                password: undefined,
                errors: ['email: Required', 'password: Required'],
            },
            {
                email: 'wrongemail',
                password: 'Qwerty123',
                errors: ['email: Invalid email'],
            },
        ].forEach(({ email, password, errors }) => {
            test(`cannot login with invalid data: email - '${email}', password - '${password}'`, async ({
                request,
            }) => {
                const response = await request.post(`/api/auth/login`, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    data: {
                        email,
                        password,
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

        test('cannot sign in with non-existing email', async ({ request }) => {
            const response = await request.post(`/api/auth/login`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    email: faker.internet.email(),
                    password: USER_PASSWORD,
                },
            });
            expect(response.ok()).toBeFalsy();
            expect(response.status()).toBe(401);
            expect(response.statusText()).toBe('Unauthorized');

            const jsonBody = await response.json();
            expect(jsonBody).toEqual({
                message: 'Email or password is incorrect',
            });
        });

        test('cannot sign in with incorrect password', async ({ request }) => {
            const response = await request.post(`/api/auth/login`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    email: USER_EMAIL,
                    password: 'incorrect_password',
                },
            });

            expect(response.ok()).toBeFalsy();
            expect(response.status()).toBe(401);
            expect(response.statusText()).toBe('Unauthorized');

            const jsonBody = await response.json();

            expect(jsonBody).toEqual(
                expect.objectContaining({
                    message: 'Email or password is incorrect',
                }),
            );
        });
    });
});
