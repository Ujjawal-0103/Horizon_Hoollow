import { Request, Response } from 'express';
import { z } from 'zod';
import { authService, UserExistsError } from '../services/authService';

const RegisterSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  grade: z.union([z.number(), z.string()]).refine(v => {
    const num = Number(v);
    return !isNaN(num) && num >= 1 && num <= 12;
  }, { message: 'Grade must be a valid number between 1 and 12' }).transform(v => Number(v)),
  board: z.string().trim().min(1, 'Board is required')
});

const LoginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

export const registerHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const validated = RegisterSchema.parse(req.body);
    const { user, token } = await authService.register(validated);

    res.cookie('mindtrace_token', token, COOKIE_OPTIONS);
    res.status(201).json({
      success: true,
      data: { user, token }
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: { message: err.errors[0]?.message || 'Invalid input data' }
      });
      return;
    }

    if (err instanceof UserExistsError || err?.isDuplicate) {
      res.status(409).json({
        success: false,
        error: { message: 'An account with this email already exists.' }
      });
      return;
    }

    console.error('[RegisterHandler error]:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Registration failed. Please try again.' }
    });
  }
};

export const loginHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const validated = LoginSchema.parse(req.body);
    const { user, token } = await authService.login(validated);

    res.cookie('mindtrace_token', token, COOKIE_OPTIONS);
    res.json({
      success: true,
      data: { user, token }
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: { message: err.errors[0]?.message || 'Invalid input credentials' }
      });
      return;
    }

    res.status(401).json({
      success: false,
      error: { message: err.message || 'Invalid email or password.' }
    });
  }
};

export const logoutHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie('mindtrace_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    res.json({
      success: true,
      data: { message: 'Logged out successfully.' }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to complete logout.' }
    });
  }
};

export const getMeHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { message: 'Authentication required.' }
      });
      return;
    }

    const user = await authService.getMe(req.user.id);
    if (!user) {
      res.status(404).json({
        success: false,
        error: { message: 'User profile not found.' }
      });
      return;
    }

    res.json({
      success: true,
      data: user
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to retrieve current user session.' }
    });
  }
};

export const deleteAccountHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { message: 'Authentication required.' }
      });
      return;
    }

    const result = await authService.deleteAccount(req.user.id);
    res.clearCookie('mindtrace_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    res.json({
      success: true,
      data: result
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete account.' }
    });
  }
};
