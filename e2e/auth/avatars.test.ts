import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

import { createUser, deleteUser } from '../utils.js';

import { Subscription } from '@/constants/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..', '..');
const avatarsDir = path.resolve(rootDir, 'public', 'avatars');

test.describe('Avatars endpoint', () => {
    const USER_EMAIL = faker.internet.email();
    const USER_PASSWORD = faker.internet.password();
    const USER_SUBSCRIPTION = Subscription.STARTER;
    const AVATAR_URL = faker.image.avatar();

    let authToken: string;

    test.beforeAll(async ({ request }) => {
        await createUser({
            email: USER_EMAIL,
            password: USER_PASSWORD,
            subscription: USER_SUBSCRIPTION,
            verify: true,
            verificationToken: null,
            avatarURL: AVATAR_URL,
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

        // Clean up the avatars directory
        const files = fs.readdirSync(avatarsDir);
        for (const file of files) {
            const filePath = path.join(avatarsDir, file);

            // skip the .gitkeep file
            if (file === '.gitkeep') {
                continue;
            }

            fs.unlinkSync(filePath);
        }
    });

    test('uploads a new avatar successfully', async ({ request }) => {
        const imagePath = path.resolve(__dirname, 'test-avatar.png');
        const imageBuffer = fs.readFileSync(imagePath);

        const response = await request.patch(`/api/auth/avatars`, {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
            multipart: {
                avatar: {
                    name: 'avatar.png',
                    mimeType: 'image/png',
                    buffer: imageBuffer,
                },
            },
        });

        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);

        const jsonBody = await response.json();
        expect(jsonBody).toEqual(
            expect.objectContaining({
                avatarURL: expect.any(String),
            }),
        );
        expect(jsonBody.avatarURL).not.toEqual(AVATAR_URL);

        // Check if the file exists in the avatars directory
        const files = fs.readdirSync(avatarsDir);
        const fileExists = files.some((file) => jsonBody.avatarURL.endsWith(file));
        expect(fileExists).toBeTruthy();
    });

    test('fails without authentication', async ({ request }) => {
        const imagePath = path.resolve(__dirname, 'test-avatar.png');
        const imageBuffer = fs.readFileSync(imagePath);

        const response = await request.patch(`/api/auth/avatars`, {
            multipart: {
                avatar: {
                    name: 'avatar.png',
                    mimeType: 'image/png',
                    buffer: imageBuffer,
                },
            },
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
        const imagePath = path.resolve(__dirname, 'test-avatar.png');
        const imageBuffer = fs.readFileSync(imagePath);

        const response = await request.patch(`/api/auth/avatars`, {
            headers: {
                Authorization: `Bearer invalid_token`,
            },
            multipart: {
                avatar: {
                    name: 'avatar.png',
                    mimeType: 'image/png',
                    buffer: imageBuffer,
                },
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

    test('fails when no file is uploaded', async ({ request }) => {
        const response = await request.patch(`/api/auth/avatars`, {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });

        expect(response.ok()).toBeFalsy();
        expect(response.status()).toBe(400);

        const jsonBody = await response.json();
        expect(jsonBody).toEqual({
            message: 'No file uploaded',
        });
    });
});
