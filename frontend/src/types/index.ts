export interface User {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  grade: number;
  board: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type AcademicContext = {
  grade: string;
  board: string;
  subject: string;
  topic: string;
};

export type LearningGoal = 
  | 'Preparing for a test'
  | 'Homework'
  | 'Strengthen weak concepts'
  | 'Learn the topic'
  | 'General practice'
  | 'Other';

export type SubtopicConfidence = 'KNOW' | 'PARTIAL' | 'DONT_KNOW';

export type LearningMode = 'TEST' | 'LEARN_FROM_SCRATCH';

export interface Subtopic {
  id: string;
  slug: string;
  title: string;
  orderIndex: number;
  description?: string;
}

export interface Topic {
  id: string;
  slug: string;
  name: string;
  subject: string;
  grade: number;
  board: string;
  description?: string;
  subtopics: Subtopic[];
}

export interface SubtopicSelfAssessment {
  id?: string;
  selfAssessmentId?: string;
  subtopicId: string;
  rating: SubtopicConfidence;
  createdAt?: string;
}

export interface SelfAssessment {
  id: string;
  userId: string;
  learningContextId: string;
  overallConfidence: number;
  selectedMode: LearningMode;
  createdAt: string;
  updatedAt?: string;
  subtopicRatings?: SubtopicSelfAssessment[] | Record<string, SubtopicConfidence>;
}

export interface LearningContext {
  id: string;
  userId: string;
  classGrade: string;
  board: string;
  subject: string;
  topicId: string;
  learningGoal: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  selfAssessments?: SelfAssessment[];
}

export interface LearningSetup {
  grade: string;
  board: string;
  subject: string;
  topicId: string;
  topicSlug: string;
  learningGoal: LearningGoal;
  overallConfidence: number;
  subtopics: Record<string, SubtopicConfidence>;
  mode: LearningMode;
}

export interface Question {
  id: string;
  subtopicId: string;
  subtopicTitle?: string;
  type: 'CONCEPT' | 'PROCEDURAL' | 'REASONING' | 'TRANSFER' | 'CONFIDENCE' | 'EXPLAIN_BACK';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  prompt: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  prerequisites?: string[];
  expectedSignals?: string[];
}

export interface StepAnalysis {
  step: number;
  status: 'correct' | 'partially_correct' | 'incorrect' | 'unclear';
  evidence: string;
}

export interface DiagnosticEvaluation {
  isCorrect: boolean;
  score: number;
  stepAnalysis: StepAnalysis[];
  reasoningSignals: string[];
  misconceptionSignals: string[];
  confidenceCalibration: 'well_calibrated' | 'overconfident' | 'underconfident' | 'uncertain';
  rootCause?: string;
  recommendedAction: 'test_transfer' | 'targeted_intervention' | 'prerequisite_repair' | 'reassess' | 'advance';
}

export interface DiagnosisSummary {
  overallScore: number;
  evaluatedAttempts: number;
  conceptMastery: 'SOLID' | 'EMERGING' | 'CRITICAL_GAP';
  proceduralSkill: 'STABLE' | 'NEEDS_REINFORCEMENT' | 'UNTESTED';
  reasoning: string[];
  misconceptions: string[];
  confidenceCalibration: 'well_calibrated' | 'overconfident' | 'underconfident' | 'uncertain';
  primaryRootCause: string;
  recommendedAction: string;
}

export interface DiagnosticSession {
  id: string;
  userId: string;
  topicId: string;
  mode: 'TEST_WHAT_I_KNOW' | 'LEARN_FROM_SCRATCH';
  status: string;
  selfAssessment: Record<string, SubtopicConfidence>;
  overallScore?: number | null;
  diagnosisSummary?: DiagnosisSummary | null;
  questions?: Question[];
  attempts?: Array<{
    id: string;
    questionId: string;
    studentAnswer: string;
    studentExplanation?: string;
    confidenceRating: number;
    isCorrect: boolean;
    evaluation?: DiagnosticEvaluation;
  }>;
}

export interface HealthStatus {
  status: string;
  system: string;
  version: string;
  timestamp: string;
  uptime: number;
}
