import { z } from 'zod';

// ==========================================
// 1. Single Question Attempt Schemas (Sprint 1-4)
// ==========================================

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

// ==========================================
// 2. Sprint 5 Full Session Diagnosis Schemas
// ==========================================

export const RecommendedPathEnum = z.enum([
  'review_wrong_answers',
  'learn_from_scratch',
  'prerequisite_first'
]);

export const MasteryLevelEnum = z.enum(['SOLID', 'EMERGING', 'CRITICAL_GAP']);
export const ProceduralLevelEnum = z.enum(['STABLE', 'NEEDS_REINFORCEMENT', 'UNTESTED']);
export const TransferLevelEnum = z.enum(['HIGH', 'MODERATE', 'LOW']);
export const CalibrationLevelEnum = z.enum([
  'well_calibrated',
  'overconfident',
  'underconfident',
  'uncertain'
]);
export const MisconceptionSeverityEnum = z.enum(['HIGH', 'MEDIUM', 'LOW']);
export const MisconceptionStatusEnum = z.enum(['ACTIVE_GAP', 'IMPROVING', 'RESOLVED']);

// Cognitive Dimensions Breakdown
export const CognitiveDimensionsSchema = z.object({
  conceptMastery: z.number().min(0).max(100),
  conceptStatus: MasteryLevelEnum,
  proceduralSkill: z.number().min(0).max(100),
  proceduralStatus: ProceduralLevelEnum,
  reasoningSkill: z.number().min(0).max(100),
  reasoningStatus: z.enum(['STRONG', 'DEVELOPING', 'NEEDS_WORK']),
  transferSkill: z.number().min(0).max(100),
  transferStatus: TransferLevelEnum,
  confidenceCalibration: z.number().min(0).max(100),
  calibrationStatus: CalibrationLevelEnum
});

// Misconception Structure
export const MisconceptionDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  subtopic: z.string(),
  severity: MisconceptionSeverityEnum,
  status: MisconceptionStatusEnum,
  description: z.string(),
  evidence: z.string() // Safe concise diagnostic observation (zero CoT)
});

// Contradiction Structure (Self-Assessment vs Reality)
export const ContradictionSchema = z.object({
  subtopicId: z.string(),
  subtopicTitle: z.string(),
  perceivedConfidence: z.enum(['KNOW', 'PARTIAL', 'DONT_KNOW']),
  actualPerformance: z.enum(['HIGH', 'MODERATE', 'LOW']),
  nature: z.enum(['OVERESTIMATION', 'UNDERESTIMATION', 'CONSISTENT']),
  explanation: z.string()
});

// Prerequisite Gap Structure
export const PrerequisiteGapSchema = z.object({
  prerequisite: z.string(),
  gradeLevel: z.string().default('Grade 9'),
  relatedSubtopic: z.string(),
  observableSignal: z.string(),
  remediationSuggestion: z.string()
});

// Recommended Intervention Micro-Target
export const RecommendedInterventionSchema = z.object({
  targetSubtopicId: z.string(),
  targetSubtopicTitle: z.string(),
  focusConcept: z.string(),
  headline: z.string(),
  reason: z.string(),
  suggestedAction: z.string()
});

// Complete Session Diagnosis Schema (Output Contract)
export const FullSessionDiagnosisSchema = z.object({
  overallScore: z.number().min(0).max(100),
  evaluatedAttempts: z.number().int().min(1),
  conceptMastery: z.number().min(0).max(100),
  proceduralSkill: z.number().min(0).max(100),
  reasoningSkill: z.number().min(0).max(100),
  transferSkill: z.number().min(0).max(100),
  confidenceCalibration: z.number().min(0).max(100),
  dimensions: CognitiveDimensionsSchema,
  misconceptions: z.array(MisconceptionDetailSchema),
  contradictions: z.array(ContradictionSchema),
  prerequisiteGaps: z.array(PrerequisiteGapSchema),
  recommendedPath: RecommendedPathEnum,
  recommendedIntervention: RecommendedInterventionSchema,
  biggestLearningSignal: z.object({
    headline: z.string(),
    detail: z.string()
  }),
  rootCauseAnalysis: z.object({
    visibleResult: z.string(),
    learningPattern: z.string(),
    likelyRootCause: z.string(),
    prerequisiteGap: z.string()
  })
});

export type CognitiveDimensions = z.infer<typeof CognitiveDimensionsSchema>;
export type MisconceptionDetail = z.infer<typeof MisconceptionDetailSchema>;
export type Contradiction = z.infer<typeof ContradictionSchema>;
export type PrerequisiteGap = z.infer<typeof PrerequisiteGapSchema>;
export type RecommendedIntervention = z.infer<typeof RecommendedInterventionSchema>;
export type FullSessionDiagnosis = z.infer<typeof FullSessionDiagnosisSchema>;

export interface SessionDiagnosisInput {
  topicSlug: string;
  topicName: string;
  grade: number;
  board: string;
  selfAssessment: Record<string, 'KNOW' | 'PARTIAL' | 'DONT_KNOW'>;
  attempts: Array<{
    id?: string;
    questionId: string;
    subtopicId?: string;
    subtopicTitle: string;
    type: string;
    prompt: string;
    expectedAnswer: string;
    studentAnswer: string;
    studentExplanation?: string;
    confidenceRating: number;
    isCorrect: boolean;
    stepAnalysis?: any;
    misconceptionSignals?: string[];
    reasoningSignals?: string[];
  }>;
}
