import { 
  Topic, 
  Subtopic, 
  DiagnosticSession, 
  HealthStatus, 
  LearningContext, 
  SelfAssessment, 
  SubtopicConfidence, 
  LearningMode,
  User,
  AuthResponse
} from '../types';

const API_BASE = '/api';

export class ApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const token = localStorage.getItem('mindtrace_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      credentials: 'include',
      headers,
      ...options
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new ApiError(errBody?.error?.message || `Request failed with status ${res.status}`, res.status);
    }

    return await res.json();
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(err.message || 'Network connection error', 0);
  }
}

export const api = {
  async getHealth(): Promise<HealthStatus> {
    return request<HealthStatus>('/health');
  },

  // Authentication & Session (Sprint 3)
  async register(payload: {
    name: string;
    email: string;
    password: string;
    grade?: number | string;
    board?: string;
  }): Promise<{ success: boolean; data: AuthResponse }> {
    return request<{ success: boolean; data: AuthResponse }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async login(payload: {
    email: string;
    password: string;
  }): Promise<{ success: boolean; data: AuthResponse }> {
    return request<{ success: boolean; data: AuthResponse }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async logout(): Promise<{ success: boolean; data: { message: string } }> {
    try {
      const res = await request<{ success: boolean; data: { message: string } }>('/auth/logout', {
        method: 'POST'
      });
      return res;
    } finally {
      localStorage.removeItem('mindtrace_token');
      localStorage.removeItem('mindtrace_user');
      localStorage.removeItem('mindtrace_user_id');
      localStorage.removeItem('mindtrace_user_name');
    }
  },

  async getMe(): Promise<{ success: boolean; data: User }> {
    return request<{ success: boolean; data: User }>('/auth/me');
  },

  async deleteAccount(): Promise<{ success: boolean; data: { success: boolean; message: string } }> {
    try {
      return await request<{ success: boolean; data: { success: boolean; message: string } }>('/account', {
        method: 'DELETE'
      });
    } finally {
      localStorage.removeItem('mindtrace_token');
      localStorage.removeItem('mindtrace_user');
      localStorage.removeItem('mindtrace_user_id');
      localStorage.removeItem('mindtrace_user_name');
    }
  },

  // Profile
  async createProfile(payload: {
    name: string;
    email?: string;
    grade: number | string;
    board: string;
    subject: string;
    targetTopic: string;
    selfRating?: string;
    learningGoal?: string;
  }) {
    return request<{ success: boolean; data: any }>('/profile', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getProfile(userId: string = 'me') {
    return request<{ success: boolean; data: any }>(`/profile/${userId}`);
  },

  async updateProfile(userId: string = 'me', payload: {
    name?: string;
    email?: string;
    grade?: number | string;
    board?: string;
  }) {
    return request<{ success: boolean; data: any }>(`/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  // Learning Context
  async saveLearningContext(payload: {
    userId?: string;
    classGrade?: string;
    board?: string;
    subject?: string;
    topicId?: string;
    learningGoal?: string;
    active?: boolean;
  }): Promise<{ success: boolean; data: LearningContext }> {
    return request<{ success: boolean; data: LearningContext }>('/learning-context', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getActiveLearningContext(userId: string = 'me'): Promise<{ success: boolean; data: LearningContext }> {
    return request<{ success: boolean; data: LearningContext }>(`/learning-context/${userId}/active`);
  },

  // Topics & Subtopics
  async getAllTopics(): Promise<Topic[]> {
    const res = await request<{ success: boolean; data: Topic[] }>('/topics');
    return res.data;
  },

  async getTopic(slug: string = 'quadratic-equations'): Promise<Topic> {
    const res = await request<{ success: boolean; data: Topic }>(`/topics/${slug}`);
    return res.data;
  },

  async getSubtopics(topicIdOrSlug: string): Promise<Subtopic[]> {
    const res = await request<{ success: boolean; data: Subtopic[] }>(`/topics/${topicIdOrSlug}/subtopics`);
    return res.data;
  },

  // Self Assessment
  async saveSelfAssessment(payload: {
    userId?: string;
    learningContextId: string;
    overallConfidence: number;
    selectedMode?: LearningMode;
    subtopicRatings: Record<string, SubtopicConfidence>;
  }): Promise<{ success: boolean; data: SelfAssessment }> {
    return request<{ success: boolean; data: SelfAssessment }>('/self-assessment', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getSelfAssessment(id: string): Promise<{ success: boolean; data: SelfAssessment }> {
    return request<{ success: boolean; data: SelfAssessment }>(`/self-assessment/${id}`);
  },

  async updateSelfAssessment(id: string, payload: {
    overallConfidence?: number;
    selectedMode?: LearningMode;
    subtopicRatings?: Record<string, SubtopicConfidence>;
  }): Promise<{ success: boolean; data: SelfAssessment }> {
    return request<{ success: boolean; data: SelfAssessment }>(`/self-assessment/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  // Diagnostic Session
  async createDiagnosticSession(payload: {
    userId?: string;
    topicSlug?: string;
    mode: 'TEST_WHAT_I_KNOW' | 'LEARN_FROM_SCRATCH';
    selfAssessment: Record<string, SubtopicConfidence>;
  }): Promise<{ session: DiagnosticSession; questions: any[] }> {
    const res = await request<{ success: boolean; data: { session: DiagnosticSession; questions: any[] } }>(
      '/diagnostic/session',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );
    return res.data;
  },

  async getDiagnosticSession(sessionId: string): Promise<DiagnosticSession> {
    const res = await request<{ success: boolean; data: DiagnosticSession }>(`/diagnostic/session/${sessionId}`);
    return res.data;
  },

  async submitAttempt(sessionId: string, payload: {
    questionId: string;
    studentAnswer: string;
    studentExplanation?: string;
    confidenceRating: number;
  }) {
    return request<{
      success: boolean;
      data: {
        attempt: any;
        evaluation: any;
        diagnosisSummary: any;
      };
    }>(`/diagnostic/session/${sessionId}/submit`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};
