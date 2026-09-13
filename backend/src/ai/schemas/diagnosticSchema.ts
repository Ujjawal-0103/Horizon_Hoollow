import { z } from 'zod';

export const StepAnalysisSchema = z.object({
  step: z.number(),
  status: z.enum(['correct', 'partially_correct', 'incorrect', 'unclear']),
  evidence: z.string()
});

export const DiagnosticEvaluationSchema = z.object({
  isCorrect: z.boolean(),
  score: z.number().min(0).max(100),
  stepAnalysis: z.array(StepAnalysisSchema),
  reasoningSignals: z.array(z.string()),
  misconceptionSignals: z.array(z.string()),
  confidenceCalibration: z.enum(['well_calibrated', 'overconfident', 'underconfident', 'uncertain']),
  rootCause: z.string().optional(),
  recommendedAction: z.enum(['test_transfer', 'targeted_intervention', 'prerequisite_repair', 'reassess', 'advance'])
});

export type StepAnalysis = z.infer<typeof StepAnalysisSchema>;
export type DiagnosticEvaluationResult = z.infer<typeof DiagnosticEvaluationSchema>;

export interface DiagnosticEvaluationInput {
  questionPrompt: string;
  expectedAnswer: string;
  expectedSignals: string[];
  prerequisites: string[];
  studentAnswer: string;
  studentExplanation?: string;
  confidenceRating: number; // 1 to 5
  subtopicTitle: string;
}
