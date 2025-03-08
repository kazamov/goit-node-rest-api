import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

test.describe('SignUp endpoint', () => {
    test.describe('with valid data', () => {
        const USER_EMAIL = faker.internet.email();
        const USER_PASSWORD = faker.internet.password();

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

            expect(jsonBody).toHaveProperty('token', expect.any(String));
            expect(jsonBody).toHaveProperty('user');
            expect(jsonBody.user).toHaveProperty('id', expect.any(String));
            expect(jsonBody.user).toHaveProperty('email', USER_EMAIL);
            expect(jsonBody.user).toHaveProperty('subscription', 'starter');
            expect(jsonBody.user).toHaveProperty('avatarURL', expect.any(String));
            expect(jsonBody.user).not.toHaveProperty('token');
            expect(jsonBody.user).not.toHaveProperty('password');
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

                expect(jsonBody).toHaveProperty('message', 'Validation failed');
                expect(jsonBody).toHaveProperty('errors');
                expect(jsonBody.errors).toEqual(errors);
            });
        });
    });
});
