import { Router } from 'express';
import { loginController, meController } from './auth.controller';
import { requireAuth } from '../../middleware/auth.middleware';

export const authRouter = Router();

authRouter.post('/login', loginController);
authRouter.get('/me', requireAuth, meController);
