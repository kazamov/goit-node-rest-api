import { Router } from 'express';

import {
    getCurrent,
    signIn,
    signOut,
    signUp,
    updateAvatar,
    updateSubscription,
} from '@/controllers/authControllers.js';
import { catchErrors } from '@/decorators/catchErrors.js';
import { validateBody } from '@/decorators/validateBody.js';
import { authenticate } from '@/middlewares/authenticate.js';
import { upload } from '@/middlewares/upload.js';
import {
    signInPayloadSchema,
    signUpPayloadSchema,
    updateSubscriptionPayloadSchema,
} from '@/schemas/authSchemas.js';

const authRouter = Router();

authRouter.post('/register', validateBody(signUpPayloadSchema), catchErrors(signUp));

authRouter.post('/login', validateBody(signInPayloadSchema), catchErrors(signIn));

authRouter.post('/logout', authenticate, catchErrors(signOut));

authRouter.get('/current', authenticate, catchErrors(getCurrent));

authRouter.patch(
    '/subscription',
    validateBody(updateSubscriptionPayloadSchema),
    authenticate,
    catchErrors(updateSubscription),
);

authRouter.patch('/avatars', authenticate, upload.single('avatar'), catchErrors(updateAvatar));

export default authRouter;
