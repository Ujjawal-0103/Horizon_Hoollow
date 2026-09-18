import { Request, Response, NextFunction } from 'express';
import { diagnosticService } from '../services/diagnosticService';
import { z } from 'zod';

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

const AnalyzeDiagnosisSchema = z.object({
  sessionId: z.string().optional(),
  topicSlug: z.string().default('quadratic-equations'),
  selfAssessment: z.record(z.enum(['KNOW', 'PARTIAL', 'DONT_KNOW'])).optional(),
  attempts: z.array(z.object({
    questionId: z.string(),
    subtopicTitle: z.string().optional(),
    type: z.string().optional(),
    prompt: z.string().optional(),
    expectedAnswer: z.string().optional(),
    studentAnswer: z.string(),
    studentExplanation: z.string().optional(),
    confidenceRating: z.number().int().min(1).max(5).default(3),
    isCorrect: z.boolean().optional()
  })).optional()
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

    if (req.user && req.user.role !== 'ADMIN' && session.userId && session.userId !== req.user.id && session.userId !== 'guest_student') {
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

    if (req.user && req.user.role !== 'ADMIN' && session.userId && session.userId !== req.user.id && session.userId !== 'guest_student') {
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

export async function analyzeDiagnosisHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = AnalyzeDiagnosisSchema.parse(req.body);

    if (validated.sessionId) {
      const session = await diagnosticService.getSession(validated.sessionId);
      if (session && req.user && req.user.role !== 'ADMIN' && session.userId && session.userId !== req.user.id && session.userId !== 'guest_student') {
        return res.status(403).json({
          success: false,
          error: { message: 'Access forbidden. You cannot analyze another student’s diagnostic session.' }
        });
      }
    }

    const diagnosis = await diagnosticService.analyzeDiagnosis(validated);
    res.json({
      success: true,
      data: diagnosis
    });
  } catch (err) {
    next(err);
  }
}
