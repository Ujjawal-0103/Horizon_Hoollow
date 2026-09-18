import { prisma } from '../repositories/prisma';
import { getAIProvider } from '../ai/providers';
import { FullSessionDiagnosis, SessionDiagnosisInput } from '../ai/schemas/diagnosticSchema';

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
    prompt: 'Why does the quadratic equation x² + 2x + 5 = 0 have no real roots?',
    options: [
      'Because the discriminant D = -16, which is less than 0',
      'Because the coefficient a = 1 is positive',
      'Because b² = 4 is less than c = 5',
      'Because x cannot be negative'
    ],
    correctAnswer: 'Because the discriminant D = -16, which is less than 0',
    explanation: 'D = 2² - 4(1)(5) = 4 - 20 = -16. Since D < 0, the square root of D is not a real number, so there are no real roots.',
    prerequisites: ['Discriminant formula', 'Square root of negative numbers'],
    expectedSignals: ['Evaluates D < 0 condition', 'Connects negative discriminant to non-real roots']
  },
  {
    id: 'q_explain_back_1',
    subtopicId: 'sub_2',
    subtopicTitle: 'Solving by Factorization',
    type: 'EXPLAIN_BACK',
    difficulty: 'MEDIUM',
    prompt: 'In your own words, explain why setting (x - 3)(x + 5) = 0 allows us to conclude that x = 3 or x = -5.',
    options: [
      'Zero Product Property: If the product of two real numbers is 0, at least one of the factors must be 0',
      'Combining like terms requires setting x to positive and negative values',
      'Quadratic equations always have opposite signs for their roots',
      'The discriminant D is equal to 0 for factored polynomials'
    ],
    correctAnswer: 'Zero Product Property: If the product of two real numbers is 0, at least one of the factors must be 0',
    explanation: 'If A * B = 0, then either A = 0 or B = 0. So x - 3 = 0 => x = 3, or x + 5 = 0 => x = -5.',
    prerequisites: ['Zero product property', 'Linear equation solving'],
    expectedSignals: ['Identifies Zero Product Property', 'Explains factor breakdown']
  },
  {
    id: 'q_transfer_k_1',
    subtopicId: 'sub_5',
    subtopicTitle: 'Nature of Roots',
    type: 'TRANSFER',
    difficulty: 'HARD',
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

export interface AnalyzeDiagnosisDto {
  sessionId?: string;
  topicSlug?: string;
  selfAssessment?: Record<string, 'KNOW' | 'PARTIAL' | 'DONT_KNOW'>;
  attempts?: Array<{
    questionId: string;
    subtopicTitle?: string;
    type?: string;
    prompt?: string;
    expectedAnswer?: string;
    studentAnswer: string;
    studentExplanation?: string;
    confidenceRating: number;
    isCorrect?: boolean;
  }>;
}

export class DiagnosticService {
  private aiProvider = getAIProvider();

  async createSession(dto: CreateSessionDto) {
    const sessionId = `diag_${Date.now()}`;
    const questions = FALLBACK_QUESTIONS;

    let topicId = 'topic_quadratic_equations';
    try {
      const dbTopic = await prisma.topic.findFirst({
        where: { slug: dto.topicSlug || 'quadratic-equations' }
      });
      if (dbTopic) {
        topicId = dbTopic.id;
      }
    } catch (err) {
      console.warn('[DiagnosticService] Topic query fallback:', err);
    }

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
      if (dto.userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: dto.userId }
        });

        if (dbUser) {
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
        const fullSession = {
          ...session,
          questions: FALLBACK_QUESTIONS
        };
        inMemorySessions.set(sessionId, fullSession);
        return fullSession;
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

    // 1. Single attempt AI evaluation
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
      subtopicId: question.subtopicId,
      subtopicTitle: question.subtopicTitle || 'Quadratic Equations',
      type: question.type || 'CONCEPT',
      prompt: question.prompt,
      expectedAnswer: question.correctAnswer,
      studentAnswer: dto.studentAnswer,
      studentExplanation: dto.studentExplanation || null,
      confidenceRating: dto.confidenceRating,
      isCorrect: evaluation.isCorrect,
      evaluation,
      createdAt: new Date()
    };

    // Update in-memory session attempts
    if (!session.attempts) session.attempts = [];
    session.attempts.push(attempt);

    // 2. Mark session COMPLETED if all questions in the set have been answered
    const isCompleted = session.attempts.length >= (session.questions?.length || 5);
    if (isCompleted) {
      session.status = 'COMPLETED';
    }

    // 3. Synthesize Full Session Diagnosis via AI Diagnosis Engine
    const diagnosisInput: SessionDiagnosisInput = {
      topicSlug: 'quadratic-equations',
      topicName: 'Quadratic Equations',
      grade: 10,
      board: 'CBSE',
      selfAssessment: session.selfAssessment || {},
      attempts: session.attempts.map((a: any) => ({
        id: a.id,
        questionId: a.questionId,
        subtopicId: a.subtopicId,
        subtopicTitle: a.subtopicTitle || 'Quadratic Equations',
        type: a.type || 'CONCEPT',
        prompt: a.prompt || '',
        expectedAnswer: a.expectedAnswer || '',
        studentAnswer: a.studentAnswer,
        studentExplanation: a.studentExplanation || undefined,
        confidenceRating: a.confidenceRating,
        isCorrect: a.isCorrect,
        stepAnalysis: a.evaluation?.stepAnalysis,
        misconceptionSignals: a.evaluation?.misconceptionSignals,
        reasoningSignals: a.evaluation?.reasoningSignals
      }))
    };

    const diagnosisSummary: FullSessionDiagnosis = await this.aiProvider.generateSessionDiagnosis(diagnosisInput);

    session.overallScore = diagnosisSummary.overallScore;
    session.diagnosisSummary = diagnosisSummary;
    inMemorySessions.set(dto.sessionId, session);

    // Persist attempt and updated diagnosis to PostgreSQL via Prisma
    try {
      const dbSession = await prisma.diagnosticSession.findUnique({
        where: { id: dto.sessionId }
      });

      if (dbSession) {
        let subtopicId = question.subtopicId;
        const subtopicInDb = subtopicId ? await prisma.subtopic.findUnique({ where: { id: subtopicId } }) : null;
        if (!subtopicInDb) {
          const fallbackSubtopic = await prisma.subtopic.findFirst({ where: { topicId: dbSession.topicId } });
          if (fallbackSubtopic) {
            subtopicId = fallbackSubtopic.id;
          }
        }

        let questionInDb = await prisma.question.findUnique({ where: { id: question.id } });
        if (!questionInDb && subtopicId) {
          questionInDb = await prisma.question.create({
            data: {
              id: question.id,
              subtopicId,
              type: question.type,
              difficulty: question.difficulty || 'MEDIUM',
              prompt: question.prompt,
              options: question.options || [],
              correctAnswer: question.correctAnswer,
              explanation: question.explanation || '',
              prerequisites: question.prerequisites || [],
              expectedSignals: question.expectedSignals || []
            }
          });
        }

        const misconceptionAlert = evaluation.misconceptionSignals && evaluation.misconceptionSignals.length > 0
          ? evaluation.misconceptionSignals.join('; ')
          : null;

        if (questionInDb) {
          await prisma.questionAttempt.create({
            data: {
              id: attempt.id,
              sessionId: dto.sessionId,
              questionId: questionInDb.id,
              studentAnswer: dto.studentAnswer,
              studentExplanation: dto.studentExplanation || null,
              confidenceRating: dto.confidenceRating,
              isCorrect: evaluation.isCorrect,
              stepAnalysis: evaluation.stepAnalysis as any,
              misconceptionAlert
            }
          });
        }

        await prisma.diagnosticSession.update({
          where: { id: dto.sessionId },
          data: {
            status: session.status,
            overallScore: diagnosisSummary.overallScore,
            diagnosisSummary: diagnosisSummary as any
          }
        });
      }
    } catch (dbErr) {
      console.warn('[DiagnosticService] DB persist attempt fallback warning:', dbErr);
    }

    return {
      attempt,
      evaluation,
      diagnosisSummary,
      sessionStatus: session.status
    };
  }

  /**
   * Dedicated Analyze Endpoint implementation for Sprint 5
   * POST /api/diagnostic/analyze
   */
  async analyzeDiagnosis(dto: AnalyzeDiagnosisDto): Promise<FullSessionDiagnosis> {
    let session: any = null;
    if (dto.sessionId) {
      session = await this.getSession(dto.sessionId);
    }

    const selfAssessment = dto.selfAssessment || session?.selfAssessment || {};
    let attemptsToAnalyze: any[] = [];

    if (session && session.attempts && session.attempts.length > 0) {
      attemptsToAnalyze = session.attempts.map((a: any) => {
        const matchingQ = (session.questions || FALLBACK_QUESTIONS).find((q: any) => q.id === a.questionId) || FALLBACK_QUESTIONS[0];
        return {
          questionId: a.questionId,
          subtopicId: matchingQ.subtopicId,
          subtopicTitle: matchingQ.subtopicTitle || 'Quadratic Equations',
          type: matchingQ.type || 'CONCEPT',
          prompt: matchingQ.prompt || '',
          expectedAnswer: matchingQ.correctAnswer || '',
          studentAnswer: a.studentAnswer,
          studentExplanation: a.studentExplanation || undefined,
          confidenceRating: a.confidenceRating || 3,
          isCorrect: a.isCorrect !== undefined ? a.isCorrect : (a.studentAnswer === matchingQ.correctAnswer)
        };
      });
    } else if (dto.attempts && dto.attempts.length > 0) {
      attemptsToAnalyze = dto.attempts.map(a => {
        const matchingQ = FALLBACK_QUESTIONS.find(q => q.id === a.questionId) || FALLBACK_QUESTIONS[0];
        return {
          questionId: a.questionId,
          subtopicId: matchingQ.subtopicId,
          subtopicTitle: a.subtopicTitle || matchingQ.subtopicTitle,
          type: a.type || matchingQ.type,
          prompt: a.prompt || matchingQ.prompt,
          expectedAnswer: a.expectedAnswer || matchingQ.correctAnswer,
          studentAnswer: a.studentAnswer,
          studentExplanation: a.studentExplanation,
          confidenceRating: a.confidenceRating,
          isCorrect: a.isCorrect !== undefined ? a.isCorrect : (a.studentAnswer === matchingQ.correctAnswer)
        };
      });
    } else {
      // Demo fallback default
      attemptsToAnalyze = FALLBACK_QUESTIONS.map((q, idx) => ({
        questionId: q.id,
        subtopicId: q.subtopicId,
        subtopicTitle: q.subtopicTitle,
        type: q.type,
        prompt: q.prompt,
        expectedAnswer: q.correctAnswer,
        studentAnswer: q.correctAnswer,
        confidenceRating: 4,
        isCorrect: idx !== 4 // 1 failure on transfer for realistic demo
      }));
    }

    const diagnosisInput: SessionDiagnosisInput = {
      topicSlug: dto.topicSlug || 'quadratic-equations',
      topicName: 'Quadratic Equations',
      grade: 10,
      board: 'CBSE',
      selfAssessment,
      attempts: attemptsToAnalyze
    };

    const diagnosis = await this.aiProvider.generateSessionDiagnosis(diagnosisInput);

    // If session exists, persist diagnosis
    if (session && dto.sessionId) {
      session.diagnosisSummary = diagnosis;
      session.overallScore = diagnosis.overallScore;
      inMemorySessions.set(dto.sessionId, session);

      try {
        await prisma.diagnosticSession.update({
          where: { id: dto.sessionId },
          data: {
            overallScore: diagnosis.overallScore,
            diagnosisSummary: diagnosis as any
          }
        });
      } catch (err) {
        console.warn('[DiagnosticService] DB update diagnosisSummary fallback:', err);
      }
    }

    return diagnosis;
  }
}

export const diagnosticService = new DiagnosticService();
