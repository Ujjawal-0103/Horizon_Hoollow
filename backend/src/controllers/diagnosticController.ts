import { Request, Response, NextFunction } from 'express';
import { DiagnosticService } from '../services/diagnosticService';
import { z } from 'zod';

const diagnosticService = new DiagnosticService();

const CreateSessionSchema = z.object({
  userId: z.string().optional(),
  topicSlug: z.string().default('quadratic-equations'),
  mode: z.enum(['TEST_WHAT_I_KNOW', 'LEARN_FROM_SCRATCH']),
  selfAssessment: z.record(z.enum(['KNOW', 'PARTIAL', 'DONT_KNOW'])).default({})
});

const SubmitAttemptSchema = z.object({
  questionId: z.string(),
  studentAnswer: z.string(),
  studentExplanation: z.string().optional(),
  confidenceRating: z.number().int().min(1).max(5).default(3)
});

export async function createSessionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required to start a diagnostic session.' }
      });
    }

    const validated = CreateSessionSchema.parse(req.body);
    // Backend strictly derives identity from authenticated session
    const result = await diagnosticService.createSession({
      ...validated,
      userId: req.user.id
    });
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

export async function getSessionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { sessionId } = req.params;
    const session = await diagnosticService.getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: { message: `Session ${sessionId} not found` }
      });
    }

    // Enforce ownership: student can only access their own session
    if (req.user && req.user.role !== 'ADMIN' && session.userId && session.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: { message: 'Access forbidden. You cannot view another student’s diagnostic session.' }
      });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (err) {
    next(err);
  }
}

export async function submitAttemptHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { sessionId } = req.params;
    const session = await diagnosticService.getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: { message: `Session ${sessionId} not found` }
      });
    }

    // Enforce ownership: student can only submit to their own session
    if (req.user && req.user.role !== 'ADMIN' && session.userId && session.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: { message: 'Access forbidden. You cannot submit attempts to another student’s diagnostic session.' }
      });
    }

    const validated = SubmitAttemptSchema.parse(req.body);
    const result = await diagnosticService.submitAttempt({
      sessionId,
      ...validated
    });
    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}
