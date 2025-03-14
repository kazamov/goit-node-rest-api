import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

import { createUser, deleteUser } from '../utils.js';

import { Subscription } from '@/constants/auth.js';

test.describe('Current User endpoint', () => {
    const USER_EMAIL = faker.internet.email();
    const USER_PASSWORD = faker.internet.password();
    const USER_SUBSCRIPTION = Subscription.STARTER;
    const USER_AVATAR_URL = faker.image.avatar();

    let authToken: string;

    test.beforeAll(async ({ request }) => {
        await createUser({
            email: USER_EMAIL,
            password: USER_PASSWORD,
            subscription: USER_SUBSCRIPTION,
            avatarURL: USER_AVATAR_URL,
            verify: true,
            verificationToken: null,
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

    test('retrieves current user data', async ({ request }) => {
        const response = await request.get(`/api/auth/current`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);

        const jsonBody = await response.json();
        expect(jsonBody).toEqual(
            expect.objectContaining({
                id: expect.any(String),
                email: USER_EMAIL,
                subscription: USER_SUBSCRIPTION,
                avatarURL: USER_AVATAR_URL,
            }),
        );

        // Ensure sensitive data is not present
        expect(jsonBody).not.toHaveProperty('password');
        expect(jsonBody).not.toHaveProperty('token');
    });

    test('fails without authentication', async ({ request }) => {
        const response = await request.get(`/api/auth/current`, {
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
});
