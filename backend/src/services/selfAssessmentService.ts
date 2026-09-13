import { prisma } from '../repositories/prisma';
import { inMemoryContexts } from './learningContextService';

export interface SaveSelfAssessmentDto {
  userId: string;
  learningContextId: string;
  overallConfidence: number;
  selectedMode?: string; // "TEST" | "LEARN_FROM_SCRATCH"
  subtopicRatings: Record<string, 'KNOW' | 'PARTIAL' | 'DONT_KNOW'>;
}

export interface UpdateSelfAssessmentDto {
  overallConfidence?: number;
  selectedMode?: string;
  subtopicRatings?: Record<string, 'KNOW' | 'PARTIAL' | 'DONT_KNOW'>;
}

const inMemorySelfAssessments = new Map<string, any>();

export class SelfAssessmentService {
  async saveSelfAssessment(dto: SaveSelfAssessmentDto) {
    const overallConfidence = dto.overallConfidence || 3;
    const selectedMode = dto.selectedMode || 'TEST';

    try {
      // Create self assessment row
      const assessment = await prisma.selfAssessment.create({
        data: {
          userId: dto.userId,
          learningContextId: dto.learningContextId,
          overallConfidence,
          selectedMode
        }
      });

      // Batch create subtopic self assessment rows
      const ratingEntries = Object.entries(dto.subtopicRatings || {});
      if (ratingEntries.length > 0) {
        await prisma.subtopicSelfAssessment.createMany({
          data: ratingEntries.map(([subtopicId, rating]) => ({
            selfAssessmentId: assessment.id,
            subtopicId,
            rating
          })),
          skipDuplicates: true
        });
      }

      const completeAssessment = await prisma.selfAssessment.findUnique({
        where: { id: assessment.id },
        include: {
          subtopicRatings: true
        }
      });

      inMemorySelfAssessments.set(assessment.id, completeAssessment);
      const parentCtx = inMemoryContexts.get(dto.learningContextId);
      if (parentCtx) {
        parentCtx.selfAssessments = [completeAssessment];
      }
      return completeAssessment;
    } catch (err) {
      console.warn('[SelfAssessmentService] DB write error, using memory fallback:', err);
      const simulatedId = `sa_${Date.now()}`;
      const fallbackRatings = Object.entries(dto.subtopicRatings || {}).map(([subtopicId, rating]) => ({
        id: `sub_sa_${Date.now()}_${subtopicId}`,
        selfAssessmentId: simulatedId,
        subtopicId,
        rating,
        createdAt: new Date()
      }));

      const fallbackAssessment = {
        id: simulatedId,
        userId: dto.userId,
        learningContextId: dto.learningContextId,
        overallConfidence,
        selectedMode,
        createdAt: new Date(),
        updatedAt: new Date(),
        subtopicRatings: fallbackRatings
      };

      inMemorySelfAssessments.set(simulatedId, fallbackAssessment);
      const parentCtx = inMemoryContexts.get(dto.learningContextId);
      if (parentCtx) {
        parentCtx.selfAssessments = [fallbackAssessment];
      }
      return fallbackAssessment;
    }
  }

  async getSelfAssessment(id: string) {
    try {
      const assessment = await prisma.selfAssessment.findUnique({
        where: { id },
        include: {
          subtopicRatings: true
        }
      });
      if (assessment) return assessment;
    } catch (err) {
      console.warn('[SelfAssessmentService] DB read error, checking memory fallback:', err);
    }
    return inMemorySelfAssessments.get(id) || null;
  }

  async updateSelfAssessment(id: string, dto: UpdateSelfAssessmentDto) {
    try {
      const dataToUpdate: any = {};
      if (dto.overallConfidence !== undefined) dataToUpdate.overallConfidence = dto.overallConfidence;
      if (dto.selectedMode !== undefined) dataToUpdate.selectedMode = dto.selectedMode;

      const assessment = await prisma.selfAssessment.update({
        where: { id },
        data: dataToUpdate,
        include: {
          subtopicRatings: true
        }
      });

      // Update ratings if provided
      if (dto.subtopicRatings) {
        for (const [subtopicId, rating] of Object.entries(dto.subtopicRatings)) {
          await prisma.subtopicSelfAssessment.upsert({
            where: {
              selfAssessmentId_subtopicId: {
                selfAssessmentId: id,
                subtopicId
              }
            },
            update: { rating },
            create: {
              selfAssessmentId: id,
              subtopicId,
              rating
            }
          });
        }
      }

      const updated = await prisma.selfAssessment.findUnique({
        where: { id },
        include: { subtopicRatings: true }
      });

      if (updated) {
        inMemorySelfAssessments.set(id, updated);
        return updated;
      }
      return assessment;
    } catch (err) {
      console.warn('[SelfAssessmentService] DB update error, updating memory fallback:', err);
      const existing = inMemorySelfAssessments.get(id) || {
        id,
        userId: 'guest_student',
        learningContextId: 'default_ctx',
        overallConfidence: 3,
        selectedMode: 'TEST',
        createdAt: new Date(),
        updatedAt: new Date(),
        subtopicRatings: []
      };

      if (dto.overallConfidence !== undefined) existing.overallConfidence = dto.overallConfidence;
      if (dto.selectedMode !== undefined) existing.selectedMode = dto.selectedMode;
      if (dto.subtopicRatings) {
        const ratingMap = new Map(existing.subtopicRatings.map((r: any) => [r.subtopicId, r]));
        for (const [subtopicId, rating] of Object.entries(dto.subtopicRatings)) {
          ratingMap.set(subtopicId, {
            id: `sub_sa_${subtopicId}`,
            selfAssessmentId: id,
            subtopicId,
            rating,
            createdAt: new Date()
          });
        }
        existing.subtopicRatings = Array.from(ratingMap.values());
      }
      existing.updatedAt = new Date();
      inMemorySelfAssessments.set(id, existing);
      const parentCtx = inMemoryContexts.get(existing.learningContextId);
      if (parentCtx) {
        parentCtx.selfAssessments = [existing];
      }
      return existing;
    }
  }
}

export const selfAssessmentService = new SelfAssessmentService();
