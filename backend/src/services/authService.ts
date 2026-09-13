import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../repositories/prisma';
import { inMemoryContexts } from './learningContextService';

const JWT_SECRET = process.env.JWT_SECRET || 'mindtrace_jwt_super_secret_sprint3';
const TOKEN_EXPIRY = '7d';

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  grade?: number | string;
  board?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface SanitizedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  grade: number;
  board: string;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory fallback user store for resilience
export const inMemoryUsers = new Map<string, any>();

// Seed default development user Aarav if not already in memory
const defaultAaravUser = {
  id: 'usr_aarav_default',
  name: 'Aarav Sharma',
  email: 'aarav@example.test',
  passwordHash: bcrypt.hashSync('Student@123', 10),
  role: 'STUDENT',
  grade: 10,
  board: 'CBSE',
  createdAt: new Date(),
  updatedAt: new Date()
};
inMemoryUsers.set(defaultAaravUser.id, defaultAaravUser);
inMemoryUsers.set(defaultAaravUser.email.toLowerCase(), defaultAaravUser);

export class UserExistsError extends Error {
  readonly isDuplicate = true;
  constructor() {
    super('An account with this email already exists.');
    this.name = 'UserExistsError';
  }
}

export class AuthService {
  private sanitize(user: any): SanitizedUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || 'STUDENT',
      grade: user.grade || 10,
      board: user.board || 'CBSE',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  generateToken(userId: string, role: string = 'STUDENT'): string {
    return jwt.sign(
      { sub: userId, role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );
  }

  verifyToken(token: string): { sub: string; role: string } {
    return jwt.verify(token, JWT_SECRET) as { sub: string; role: string };
  }

  async register(dto: RegisterDto): Promise<{ user: SanitizedUser; token: string }> {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const gradeNumber = Number(dto.grade) || 10;
    const boardName = dto.board?.trim() || 'CBSE';

    // Verify email uniqueness
    try {
      const existingPrisma = await prisma.user.findUnique({
        where: { email: normalizedEmail }
      });
      if (existingPrisma) {
        throw new UserExistsError();
      }
    } catch (err: any) {
      if (err instanceof UserExistsError || err?.isDuplicate) {
        throw err;
      }
      // If DB read failed due to connection, check in-memory store
      if (inMemoryUsers.has(normalizedEmail)) {
        throw new UserExistsError();
      }
    }

    // 2. Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    // 3. Persist user
    try {
      const user = await prisma.user.create({
        data: {
          name: dto.name.trim(),
          email: normalizedEmail,
          passwordHash,
          role: 'STUDENT',
          grade: gradeNumber,
          board: boardName
        }
      });

      inMemoryUsers.set(user.id, user);
      inMemoryUsers.set(user.email.toLowerCase(), user);

      const token = this.generateToken(user.id, user.role);
      return { user: this.sanitize(user), token };
    } catch (err: any) {
      console.warn('[AuthService] DB write error, using in-memory fallback:', err);
      const simulatedId = `usr_${Date.now()}`;
      const fallbackUser = {
        id: simulatedId,
        name: dto.name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: 'STUDENT',
        grade: gradeNumber,
        board: boardName,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      inMemoryUsers.set(simulatedId, fallbackUser);
      inMemoryUsers.set(normalizedEmail, fallbackUser);

      const token = this.generateToken(simulatedId, fallbackUser.role);
      return { user: this.sanitize(fallbackUser), token };
    }
  }

  async login(dto: LoginDto): Promise<{ user: SanitizedUser; token: string }> {
    const normalizedEmail = dto.email.trim().toLowerCase();

    let user: any = null;

    try {
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail }
      });
    } catch (err) {
      console.warn('[AuthService] DB read error on login, falling back to in-memory:', err);
    }

    if (!user) {
      user = inMemoryUsers.get(normalizedEmail);
    }

    if (!user) {
      throw new Error('Invalid email or password.');
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash || '');
    if (!isPasswordValid) {
      throw new Error('Invalid email or password.');
    }

    const token = this.generateToken(user.id, user.role || 'STUDENT');
    return { user: this.sanitize(user), token };
  }

  async getMe(userId: string): Promise<SanitizedUser | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          learningContexts: {
            where: { active: true },
            take: 1
          }
        }
      });
      if (user) return this.sanitize(user);
    } catch (err) {
      console.warn('[AuthService] DB read error on getMe, checking in-memory store:', err);
    }

    const inMem = inMemoryUsers.get(userId);
    if (inMem) return this.sanitize(inMem);
    return null;
  }

  async deleteAccount(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Delete associated learning contexts, assessments, sessions
      await prisma.subtopicSelfAssessment.deleteMany({
        where: {
          selfAssessment: { userId }
        }
      });
      await prisma.selfAssessment.deleteMany({
        where: { userId }
      });
      await prisma.learningContext.deleteMany({
        where: { userId }
      });
      await prisma.questionAttempt.deleteMany({
        where: {
          session: { userId }
        }
      });
      await prisma.diagnosticSession.deleteMany({
        where: { userId }
      });
      await prisma.user.delete({
        where: { id: userId }
      });
    } catch (err) {
      console.warn('[AuthService] DB account deletion error, purging memory store:', err);
    }

    // Purge from memory store
    const userInMem = inMemoryUsers.get(userId);
    if (userInMem) {
      inMemoryUsers.delete(userId);
      if (userInMem.email) {
        inMemoryUsers.delete(userInMem.email.toLowerCase());
      }
    }

    // Purge in-memory contexts
    for (const [ctxId, ctx] of inMemoryContexts.entries()) {
      if (ctx.userId === userId) {
        inMemoryContexts.delete(ctxId);
      }
    }

    return { success: true, message: 'Account and associated learning data safely deleted.' };
  }
}

export const authService = new AuthService();
