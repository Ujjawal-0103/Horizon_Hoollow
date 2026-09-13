import { prisma } from '../repositories/prisma';

export interface SaveLearningContextDto {
  userId: string;
  classGrade?: string;
  board?: string;
  subject?: string;
  topicId?: string;
  learningGoal?: string;
  active?: boolean;
}

// Resilient memory cache fallback
export const inMemoryContexts = new Map<string, any>();

export class LearningContextService {
  async createOrUpdateContext(dto: SaveLearningContextDto) {
    const classGrade = dto.classGrade || '10';
    const board = dto.board || 'CBSE';
    const subject = dto.subject || 'Mathematics';
    const topicId = dto.topicId || 'topic_quadratic_equations';
    const learningGoal = dto.learningGoal || 'Preparing for a test';
    const active = dto.active !== undefined ? dto.active : true;

    try {
      if (active) {
        // Deactivate previous contexts for this user
        await prisma.learningContext.updateMany({
          where: { userId: dto.userId, active: true },
          data: { active: false }
        });
      }

      const context = await prisma.learningContext.create({
        data: {
          userId: dto.userId,
          classGrade,
          board,
          subject,
          topicId,
          learningGoal,
          active
        },
        include: {
          selfAssessments: {
            include: {
              subtopicRatings: true
            },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      inMemoryContexts.set(context.id, context);
      return context;
    } catch (err) {
      console.warn('[LearningContextService] DB write error, using memory fallback:', err);
      // In-memory fallback
      for (const [id, ctx] of inMemoryContexts.entries()) {
        if (ctx.userId === dto.userId && ctx.active) {
          ctx.active = false;
        }
      }

      const fallbackContext = {
        id: `ctx_${Date.now()}`,
        userId: dto.userId,
        classGrade,
        board,
        subject,
        topicId,
        learningGoal,
        active,
        createdAt: new Date(),
        updatedAt: new Date(),
        selfAssessments: []
      };

      inMemoryContexts.set(fallbackContext.id, fallbackContext);
      return fallbackContext;
    }
  }

  async getActiveContext(userId: string) {
    try {
      const context = await prisma.learningContext.findFirst({
        where: {
          userId,
          active: true
        },
        orderBy: { updatedAt: 'desc' },
        include: {
          selfAssessments: {
            include: {
              subtopicRatings: true
            },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      if (context) return context;
    } catch (err) {
      console.warn('[LearningContextService] DB read error, checking memory fallback:', err);
    }

    // Check in-memory store
    for (const ctx of inMemoryContexts.values()) {
      if (ctx.userId === userId && ctx.active) {
        return ctx;
      }
    }

    // Return the latest user context even if active wasn't explicitly set
    for (const ctx of Array.from(inMemoryContexts.values()).reverse()) {
      if (ctx.userId === userId) {
        return ctx;
      }
    }

    return null;
  }
}

export const learningContextService = new LearningContextService();
