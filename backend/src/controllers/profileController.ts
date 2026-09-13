import { Request, Response, NextFunction } from 'express';
import { profileService } from '../services/profileService';
import { z } from 'zod';

const CreateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional(),
  grade: z.union([z.number(), z.string()]).transform(v => Number(v) || 10).default(10),
  board: z.string().default('CBSE'),
  subject: z.string().default('Mathematics'),
  targetTopic: z.string().default('Quadratic Equations'),
  selfRating: z.string().optional(),
  learningGoal: z.string().optional()
});

const UpdateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  grade: z.union([z.number(), z.string()]).transform(v => Number(v)).optional(),
  board: z.string().optional()
});

export async function createProfileHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = CreateProfileSchema.parse(req.body);
    const profile = await profileService.createProfile(validated);
    res.status(201).json({
      success: true,
      data: profile
    });
  } catch (err) {
    next(err);
  }
}

export async function getProfileHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const rawId = req.params.userId || req.params.id;
    const id = rawId === 'me' ? req.user?.id : (rawId || req.user?.id);

    if (!id) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required to view profile.' }
      });
    }

    const profile = await profileService.getProfile(id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: { message: 'Profile not found' }
      });
    }
    res.json({
      success: true,
      data: profile
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProfileHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const rawId = req.params.userId || req.params.id;
    const id = rawId === 'me' ? req.user?.id : (rawId || req.user?.id);

    if (!id) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required to update profile.' }
      });
    }

    const validated = UpdateProfileSchema.parse(req.body);
    const updated = await profileService.updateProfile(id, validated);
    res.json({
      success: true,
      data: updated
    });
  } catch (err) {
    next(err);
  }
}
