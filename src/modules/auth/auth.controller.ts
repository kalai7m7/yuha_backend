import { Request, Response } from 'express';
import { z } from 'zod';
import { login, getProfile } from './auth.service';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function loginController(req: Request, res: Response) {
  const body = loginSchema.parse(req.body);
  const result = await login(body.email, body.password);

  res.json({
    success: true,
    data: result
  });
}

export async function meController(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
    });
    return;
  }

  const profile = await getProfile(req.user.id);

  res.json({
    success: true,
    data: {
      user: req.user,
      profile
    }
  });
}
