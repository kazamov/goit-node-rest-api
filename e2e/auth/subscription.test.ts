import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

import { createUser, deleteUser } from '../utils.js';

import { Subscription } from '@/constants/auth.js';

test.describe('Subscription endpoint', () => {
    const USER_EMAIL = faker.internet.email();
    const USER_PASSWORD = faker.internet.password();
    const INITIAL_SUBSCRIPTION = Subscription.STARTER;
    const NEW_SUBSCRIPTION = Subscription.PRO;

    let authToken: string;

    test.beforeAll(async ({ request }) => {
        await createUser({
            email: USER_EMAIL,
            password: USER_PASSWORD,
            subscription: INITIAL_SUBSCRIPTION,
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

    test('updates user subscription', async ({ request }) => {
        const response = await request.patch(`/api/auth/subscription`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            data: {
                subscription: NEW_SUBSCRIPTION,
            },
        });

        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);

        const jsonBody = await response.json();
        expect(jsonBody).toEqual(
            expect.objectContaining({
                id: expect.any(String),
                email: USER_EMAIL,
                subscription: NEW_SUBSCRIPTION,
            }),
        );
    });

    test('fails without authentication', async ({ request }) => {
        const response = await request.patch(`/api/auth/subscription`, {
            headers: { 'Content-Type': 'application/json' },
            data: {
                subscription: NEW_SUBSCRIPTION,
            },
        });

        expect(response.ok()).toBeFalsy();
        expect(response.status()).toBe(401);

        const jsonBody = await response.json();
        expect(jsonBody).toEqual({
            message: 'Authorization header was missed',
        });
    });

    test('fails with invalid authentication token', async ({ request }) => {
        const response = await request.patch(`/api/auth/subscription`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer invalid_token`,
            },
            data: {
                subscription: NEW_SUBSCRIPTION,
            },
        });

        expect(response.ok()).toBeFalsy();
        expect(response.status()).toBe(401);

        const jsonBody = await response.json();
        expect(jsonBody).toEqual({
            message: 'jwt malformed',
        });
    });

    test('fails with invalid subscription value', async ({ request }) => {
        const response = await request.patch(`/api/auth/subscription`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            data: {
                subscription: 'INVALID_SUBSCRIPTION',
            },
        });

        expect(response.ok()).toBeFalsy();
        expect(response.status()).toBe(400);

        const jsonBody = await response.json();
        expect(jsonBody).toHaveProperty('message');
    });
});
