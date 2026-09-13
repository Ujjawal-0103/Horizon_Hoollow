import { prisma } from '../repositories/prisma';
import { getAIProvider } from '../ai/providers';

const inMemorySessions = new Map<string, any>();

// Seed questions fallback for resilient demo execution
export const FALLBACK_QUESTIONS = [
  {
    id: 'q_standard_form_1',
    subtopicId: 'sub_1',
    subtopicTitle: 'Standard Form of Quadratic Equations',
    type: 'CONCEPT',
    difficulty: 'EASY',
    prompt: 'Which of the following equations is NOT a quadratic equation?',
    options: [
      '(x - 2)² + 1 = 2x - 3',
      'x(x + 1) + 8 = (x + 2)(x - 2)',
      'x(2x + 3) = x² + 1',
      '(x + 2)³ = x³ - 4'
    ],
    correctAnswer: 'x(x + 1) + 8 = (x + 2)(x - 2)',
    explanation: 'Expanding both sides: x² + x + 8 = x² - 4. Subtracting x² leaves x + 12 = 0, which has degree 1 (linear), not 2.',
    prerequisites: ['Polynomial expansion', 'Degree of polynomial'],
    expectedSignals: ['Identifies x² cancellation', 'Expands products before judging degree']
  },
  {
    id: 'q_discriminant_1',
    subtopicId: 'sub_4',
    subtopicTitle: 'Discriminant (D = b² - 4ac)',
    type: 'PROCEDURAL',
    difficulty: 'MEDIUM',
    prompt: 'Calculate the discriminant (D) of the equation 2x² - 4x + 3 = 0.',
    options: [
      'D = -8',
      'D = 8',
      'D = -40',
      'D = 40'
    ],
    correctAnswer: 'D = -8',
    explanation: 'a = 2, b = -4, c = 3. D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8.',
    prerequisites: ['Order of operations', 'Identification of coefficients'],
    expectedSignals: ['Squares negative term correctly to positive 16', 'Computes 4ac as 24']
  },
  {
    id: 'q_nature_roots_1',
    subtopicId: 'sub_5',
    subtopicTitle: 'Nature of Roots',
    type: 'REASONING',
    difficulty: 'MEDIUM',
    prompt: 'If kx² - 6x + 1 = 0 has two distinct real roots, what is the complete condition for k?',
    options: [
      'k < 9 and k ≠ 0',
      'k > 9',
      'k ≤ 9 and k ≠ 0',
      'k < 36'
    ],
    correctAnswer: 'k < 9 and k ≠ 0',
    explanation: 'For distinct real roots, D = (-6)² - 4(k)(1) = 36 - 4k > 0 => 4k < 36 => k < 9. Additionally, for the equation to be quadratic, the leading coefficient a = k must not be 0.',
    prerequisites: ['Inequalities', 'Quadratic coefficient condition a ≠ 0'],
    expectedSignals: ['Applies D > 0', 'Does not forget k ≠ 0 condition']
  }
];

export interface CreateSessionDto {
  userId?: string;
  topicSlug?: string;
  mode: 'TEST_WHAT_I_KNOW' | 'LEARN_FROM_SCRATCH';
  selfAssessment: Record<string, 'KNOW' | 'PARTIAL' | 'DONT_KNOW'>;
}

export interface SubmitAttemptDto {
  sessionId: string;
  questionId: string;
  studentAnswer: string;
  studentExplanation?: string;
  confidenceRating: number;
}

export class DiagnosticService {
  private aiProvider = getAIProvider();

  async createSession(dto: CreateSessionDto) {
    const sessionId = `diag_${Date.now()}`;
    const topicId = 'topic_quadratic_equations';

    // Prioritize questions matching known or partially known subtopics
    const questions = FALLBACK_QUESTIONS;

    const sessionData = {
      id: sessionId,
      userId: dto.userId || 'guest_student',
      topicId,
      mode: dto.mode,
      status: 'ACTIVE',
      selfAssessment: dto.selfAssessment,
      overallScore: null,
      diagnosisSummary: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      questions,
      attempts: []
    };

    try {
      if (dto.userId && !dto.userId.startsWith('usr_')) {
        const dbSession = await prisma.diagnosticSession.create({
          data: {
            id: sessionId,
            userId: dto.userId,
            topicId,
            mode: dto.mode,
            status: 'ACTIVE',
            selfAssessment: dto.selfAssessment
          }
        });
        inMemorySessions.set(sessionId, { ...dbSession, questions, attempts: [] });
        return { session: dbSession, questions };
      }
    } catch (err) {
      console.warn('[DiagnosticService] DB createSession fallback to in-memory:', err);
    }

    inMemorySessions.set(sessionId, sessionData);
    return { session: sessionData, questions };
  }

  async getSession(sessionId: string) {
    if (inMemorySessions.has(sessionId)) {
      return inMemorySessions.get(sessionId);
    }

    try {
      const session = await prisma.diagnosticSession.findUnique({
        where: { id: sessionId },
        include: { attempts: true }
      });
      if (session) {
        return {
          ...session,
          questions: FALLBACK_QUESTIONS
        };
      }
    } catch (err) {
      console.warn(`[DiagnosticService] DB getSession error for ${sessionId}:`, err);
    }

    return null;
  }

  async submitAttempt(dto: SubmitAttemptDto) {
    const session = await this.getSession(dto.sessionId);
    if (!session) {
      throw new Error(`Diagnostic session ${dto.sessionId} not found`);
    }

    const question = session.questions?.find((q: any) => q.id === dto.questionId) ||
      FALLBACK_QUESTIONS.find(q => q.id === dto.questionId) ||
      FALLBACK_QUESTIONS[0];

    // Delegate diagnostic reasoning to AI Provider
    const evaluation = await this.aiProvider.evaluateDiagnosticAttempt({
      questionPrompt: question.prompt,
      expectedAnswer: question.correctAnswer,
      expectedSignals: question.expectedSignals || [],
      prerequisites: question.prerequisites || [],
      studentAnswer: dto.studentAnswer,
      studentExplanation: dto.studentExplanation,
      confidenceRating: dto.confidenceRating,
      subtopicTitle: question.subtopicTitle || 'Quadratic Equations'
    });

    const attempt = {
      id: `att_${Date.now()}`,
      sessionId: dto.sessionId,
      questionId: dto.questionId,
      studentAnswer: dto.studentAnswer,
      studentExplanation: dto.studentExplanation,
      confidenceRating: dto.confidenceRating,
      isCorrect: evaluation.isCorrect,
      evaluation,
      createdAt: new Date()
    };

    // Update in-memory session
    if (!session.attempts) session.attempts = [];
    session.attempts.push(attempt);

    // Calculate updated diagnostic summary
    const total = session.attempts.length;
    const correctCount = session.attempts.filter((a: any) => a.isCorrect).length;
    const score = Math.round((correctCount / total) * 100);

    const diagnosisSummary = {
      overallScore: score,
      evaluatedAttempts: total,
      conceptMastery: evaluation.isCorrect ? 'SOLID' : 'EMERGING',
      proceduralSkill: score >= 60 ? 'STABLE' : 'NEEDS_REINFORCEMENT',
      reasoning: evaluation.reasoningSignals,
      misconceptions: evaluation.misconceptionSignals,
      confidenceCalibration: evaluation.confidenceCalibration,
      primaryRootCause: evaluation.rootCause || 'Conceptual foundations verified.',
      recommendedAction: evaluation.recommendedAction
    };

    session.diagnosisSummary = diagnosisSummary;
    inMemorySessions.set(dto.sessionId, session);

    return {
      attempt,
      evaluation,
      diagnosisSummary
    };
  }
}
