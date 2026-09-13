import { Router } from 'express';
import { 
  registerHandler, 
  loginHandler, 
  logoutHandler, 
  getMeHandler, 
  deleteAccountHandler 
} from '../controllers/authController';
import { 
  createProfileHandler, 
  getProfileHandler, 
  updateProfileHandler 
} from '../controllers/profileController';
import { 
  getAllTopicsHandler, 
  getTopicBySlugHandler, 
  getSubtopicsHandler 
} from '../controllers/topicController';
import { 
  createSessionHandler, 
  getSessionHandler, 
  submitAttemptHandler 
} from '../controllers/diagnosticController';
import { 
  saveLearningContextHandler, 
  getActiveLearningContextHandler 
} from '../controllers/learningContextController';
import { 
  saveSelfAssessmentHandler, 
  getSelfAssessmentHandler, 
  updateSelfAssessmentHandler 
} from '../controllers/selfAssessmentController';
import { requireAuth, requireOwnership } from '../middleware/authMiddleware';
import { authRateLimiter } from '../middleware/securityMiddleware';

const apiRouter = Router();

// Health Check (Public)
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'MindTrace AI Learning Diagnostic Engine',
    version: '0.3.0',
    sprint: 3,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Authentication Routes (Sections 3, 4, 6, 21, 29)
apiRouter.post('/auth/register', authRateLimiter(), registerHandler);
apiRouter.post('/auth/login', authRateLimiter(), loginHandler);
apiRouter.post('/auth/logout', logoutHandler);
apiRouter.get('/auth/me', requireAuth, getMeHandler);

// Account Privacy & Deletion Foundation (Section 26)
apiRouter.delete('/account', requireAuth, deleteAccountHandler);

// Profile Endpoints with strict Ownership (Sections 8, 11)
apiRouter.post('/profile', createProfileHandler); // Initial profile or signup
apiRouter.get('/profile/me', requireAuth, getProfileHandler);
apiRouter.put('/profile/me', requireAuth, updateProfileHandler);
apiRouter.get('/profile/:userId', requireAuth, requireOwnership('userId'), getProfileHandler);
apiRouter.put('/profile/:userId', requireAuth, requireOwnership('userId'), updateProfileHandler);

// Learning Context Endpoints (Protected by Ownership)
apiRouter.post('/learning-context', requireAuth, saveLearningContextHandler);
apiRouter.get('/learning-context/me/active', requireAuth, getActiveLearningContextHandler);
apiRouter.get('/learning-context/:userId/active', requireAuth, requireOwnership('userId'), getActiveLearningContextHandler);

// Topics & Subtopics (Public Curriculum Metadata)
apiRouter.get('/topics', getAllTopicsHandler);
apiRouter.get('/topics/:slug', getTopicBySlugHandler);
apiRouter.get('/topics/:topicId/subtopics', getSubtopicsHandler);

// Self Assessment Endpoints (Protected)
apiRouter.post('/self-assessment', requireAuth, saveSelfAssessmentHandler);
apiRouter.get('/self-assessment/:id', requireAuth, getSelfAssessmentHandler);
apiRouter.put('/self-assessment/:id', requireAuth, updateSelfAssessmentHandler);

// Diagnostic Sessions (Protected)
apiRouter.post('/diagnostic/session', requireAuth, createSessionHandler);
apiRouter.get('/diagnostic/session/:sessionId', requireAuth, getSessionHandler);
apiRouter.post('/diagnostic/session/:sessionId/submit', requireAuth, submitAttemptHandler);

export { apiRouter };
