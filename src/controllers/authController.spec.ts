import { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Subscription } from '@/constants/auth.js';
import { signIn } from '@/controllers/authControllers.js';
import HttpError from '@/helpers/HttpError.js';
import { SignInResponse } from '@/schemas/authSchemas.js';
import * as authService from '@/services/authServices.js';

vi.mock('@/services/authServices.js', () => ({
    signIn: vi.fn(),
}));

describe('Auth Controller', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;

    beforeEach(() => {
        mockRequest = {
            body: {
                email: 'test@example.com',
                password: 'password123',
            },
        };
        mockResponse = {
            json: vi.fn(),
        };
        vi.clearAllMocks();
    });

    describe('Sign In', () => {
        it('should login and return token when credentials are valid', async () => {
            // Arrange
            const mockUser = {
                token: 'valid-token-123',
                user: {
                    avatarURL: 'avatar',
                    email: 'email',
                    id: 'id',
                    subscription: Subscription.STARTER,
                },
            } as SignInResponse;
            vi.mocked(authService.signIn).mockResolvedValue(mockUser);

            // Act
            await signIn(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(authService.signIn).toHaveBeenCalledWith('test@example.com', 'password123');
            expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
        });

        it('should handle invalid credentials by letting HttpError propagate', async () => {
            // Arrange
            const authError = new HttpError('Email or password is wrong', 401);
            vi.mocked(authService.signIn).mockRejectedValue(authError);

            // Act & Assert
            await expect(signIn(mockRequest as Request, mockResponse as Response)).rejects.toThrow(
                authError,
            );
            expect(authService.signIn).toHaveBeenCalledWith('test@example.com', 'password123');
            expect(mockResponse.json).not.toHaveBeenCalled();
        });
    });
});
