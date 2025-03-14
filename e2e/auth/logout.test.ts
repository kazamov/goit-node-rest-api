import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

import { createUser, deleteUser } from '../utils.js';

import { Subscription } from '@/constants/auth.js';
import { User } from '@/db/models/User.js';

test.describe('Logout endpoint', () => {
    const USER_EMAIL = faker.internet.email();
    const USER_PASSWORD = faker.internet.password();

    let authToken: string;

    test.beforeAll(async ({ request }) => {
        await createUser({
            email: USER_EMAIL,
            password: USER_PASSWORD,
            subscription: Subscription.STARTER,
            verify: true,
            verificationToken: null,
            avatarURL: faker.image.avatar(),
        });

        // Sign in to get a token
        const response = await request.post(`/api/auth/login`, {
            headers: { 'Content-Type': 'application/json' },
            data: { email: USER_EMAIL, password: USER_PASSWORD },
        });

        expect(response.ok()).toBeTruthy();
        const jsonBody = await response.json();
        authToken = jsonBody.token;
    });

    test.afterAll(async () => {
        await deleteUser(USER_EMAIL);
    });

    test('logs out successfully', async ({ request }) => {
        const response = await request.post(`/api/auth/logout`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);

        const jsonBody = await response.json();
        expect(jsonBody).toEqual({
            success: true,
        });

        const user = await User.findOne({
            where: { email: USER_EMAIL },
        });

        expect(user).toEqual(
            expect.objectContaining({
                token: null,
            }),
        );
    });

    test('fails without authentication', async ({ request }) => {
        const response = await request.post(`/api/auth/logout`, {
            headers: { 'Content-Type': 'application/json' },
        });

        expect(response.ok()).toBeFalsy();
        expect(response.status()).toBe(401);
        expect(response.statusText()).toBe('Unauthorized');

        const jsonBody = await response.json();
        expect(jsonBody).toEqual({
            message: 'Authorization header was missed',
        });
    });

    test('fails with an invalid authentication token', async ({ request }) => {
        const response = await request.post(`/api/auth/logout`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer invalid_token`,
            },
        });

        expect(response.ok()).toBeFalsy();
        expect(response.status()).toBe(401);
        expect(response.statusText()).toBe('Unauthorized');

        const jsonBody = await response.json();
        expect(jsonBody).toEqual({
            message: 'jwt malformed',
        });
    });
});
