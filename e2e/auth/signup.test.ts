import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';
import mailhog from 'mailhog';

import { getConfig } from '@/config.js';
import { User } from '@/db/models/User.js';

test.describe('SignUp endpoint', () => {
    test.describe('with valid data', () => {
        const USER_EMAIL = faker.internet.email();
        const USER_PASSWORD = faker.internet.password();
        const smtpServer = mailhog();
        const config = getConfig();

        test.afterAll(async () => {
            await User.destroy({
                where: {
                    email: USER_EMAIL,
                },
            });
        });

        test.afterAll(async () => {
            const message = await smtpServer.latestTo(USER_EMAIL);
            if (message) {
                await smtpServer.deleteMessage(message.ID);
            }
        });

        test.describe.configure({ mode: 'serial' });

        test('can create an account', async ({ request }) => {
            const response = await request.post(`/api/auth/register`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    email: USER_EMAIL,
                    password: USER_PASSWORD,
                },
            });

            expect(response.ok()).toBeTruthy();
            expect(response.status()).toBe(201);
            expect(response.statusText()).toBe('Created');

            const jsonBody = await response.json();

            expect(jsonBody).toMatchObject({
                token: null,
                user: {
                    id: expect.any(String),
                    email: USER_EMAIL,
                    subscription: 'starter',
                    avatarURL: expect.any(String),
                    verify: false,
                },
            });
            expect(jsonBody.user).not.toHaveProperty('token');
            expect(jsonBody.user).not.toHaveProperty('verificationToken');
            expect(jsonBody.user).not.toHaveProperty('password');

            const user = await User.findOne({
                where: {
                    email: USER_EMAIL,
                },
            });

            expect(user).not.toBeNull();
            const verificationToken = user?.getDataValue('verificationToken');
            expect(verificationToken).toEqual(expect.any(String));

            const message = await smtpServer.latestTo(USER_EMAIL);

            expect(message).not.toBeNull();
            expect(message?.to).toEqual(USER_EMAIL);
            expect(message?.from).toEqual(config.smtp.email);
            expect(message?.subject).toEqual('Contacts API - Verification Email');
            expect(message?.html).toContain(
                `${config.apiDomain}/api/auth/verify/${verificationToken}`,
            );
        });

        test('cannot create an account with existing email', async ({ request }) => {
            const response = await request.post(`/api/auth/register`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    email: USER_EMAIL,
                    password: USER_PASSWORD,
                },
            });

            expect(response.ok()).toBeFalsy();
            expect(response.status()).toBe(409);
            expect(response.statusText()).toBe('Conflict');

            const jsonBody = await response.json();

            expect(jsonBody).toHaveProperty(
                'message',
                `User with email '${USER_EMAIL}' already exists`,
            );

            const users = await User.findAll({
                where: {
                    email: USER_EMAIL,
                },
            });

            expect(users).toHaveLength(1);
        });
    });

    test.describe('with invalid data', () => {
        test.describe.configure({ mode: 'parallel' });

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
            test(`cannot create user with invalid data: email - '${email}', password - '${password}'`, async ({
                request,
            }) => {
                const response = await request.post(`/api/auth/register`, {
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
    });
});
