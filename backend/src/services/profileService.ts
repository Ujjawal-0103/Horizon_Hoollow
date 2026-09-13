import { prisma } from '../repositories/prisma';
import { inMemoryUsers } from './authService';

// Resilient memory cache fallback if database connection is pending local setup
const inMemoryProfiles = new Map<string, any>();

export interface CreateProfileDto {
  name: string;
  email?: string;
  grade: number;
  board: string;
  subject: string;
  targetTopic: string;
  selfRating?: string;
  learningGoal?: string;
}

export interface UpdateProfileDto {
  name?: string;
  email?: string;
  grade?: number;
  board?: string;
}

export class ProfileService {
  async createProfile(dto: CreateProfileDto) {
    try {
      const user = await prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email || `student_${Date.now()}@mindtrace.local`,
          grade: Number(dto.grade) || 10,
          board: dto.board,
          learningContexts: {
            create: {
              classGrade: String(dto.grade || '10'),
              board: dto.board || 'CBSE',
              subject: dto.subject || 'Mathematics',
              topicId: 'topic_quadratic_equations',
              learningGoal: dto.learningGoal || 'Preparing for a test',
              active: true
            }
          }
        },
        include: {
          learningContexts: true
        }
      });

      inMemoryProfiles.set(user.id, user);
      return user;
    } catch (err) {
      console.warn('[ProfileService] DB unavailable, creating profile in memory store:', err);
      const simulatedId = `usr_${Date.now()}`;
      const fallbackUser = {
        id: simulatedId,
        name: dto.name,
        email: dto.email || `${simulatedId}@mindtrace.local`,
        grade: Number(dto.grade) || 10,
        board: dto.board || 'CBSE',
        createdAt: new Date(),
        updatedAt: new Date(),
        learningContexts: [
          {
            id: `ctx_${Date.now()}`,
            userId: simulatedId,
            classGrade: String(dto.grade || '10'),
            board: dto.board || 'CBSE',
            subject: dto.subject || 'Mathematics',
            topicId: 'topic_quadratic_equations',
            learningGoal: dto.learningGoal || 'Preparing for a test',
            active: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      };
      inMemoryProfiles.set(simulatedId, fallbackUser);
      return fallbackUser;
    }
  }

  async getProfile(id: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          learningContexts: {
            where: { active: true },
            include: {
              selfAssessments: {
                include: { subtopicRatings: true },
                orderBy: { createdAt: 'desc' },
                take: 1
              }
            }
          },
          diagnosticSessions: true
        }
      });
      if (user) return user;
    } catch (err) {
      console.warn('[ProfileService] DB read error, checking memory store:', err);
    }
    return inMemoryProfiles.get(id) || inMemoryUsers.get(id) || null;
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: {
          ...(dto.name && { name: dto.name }),
          ...(dto.email && { email: dto.email }),
          ...(dto.grade && { grade: Number(dto.grade) }),
          ...(dto.board && { board: dto.board })
        },
        include: {
          learningContexts: true
        }
      });
      inMemoryProfiles.set(id, user);
      return user;
    } catch (err) {
      console.warn('[ProfileService] DB update error, updating memory store:', err);
      const existing = inMemoryProfiles.get(id) || {
        id,
        name: dto.name || 'Aarav Sharma',
        grade: Number(dto.grade) || 10,
        board: dto.board || 'CBSE',
        createdAt: new Date(),
        updatedAt: new Date(),
        learningContexts: []
      };

      if (dto.name) existing.name = dto.name;
      if (dto.email) existing.email = dto.email;
      if (dto.grade) existing.grade = Number(dto.grade);
      if (dto.board) existing.board = dto.board;
      existing.updatedAt = new Date();

      inMemoryProfiles.set(id, existing);
      return existing;
    }
  }
}

export const profileService = new ProfileService();
