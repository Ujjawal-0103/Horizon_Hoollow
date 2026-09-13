import { Request, Response } from 'express';
import { learningContextService } from '../services/learningContextService';

export const saveLearningContextHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { classGrade, board, subject, topicId, learningGoal, active } = req.body;
    // Backend strictly derives student identity from authenticated session (Sections 1 & 2)
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Authentication required to persist learning context.' }
      });
      return;
    }

    const context = await learningContextService.createOrUpdateContext({
      userId,
      classGrade: classGrade ? String(classGrade) : '10',
      board: board || 'CBSE',
      subject: subject || 'Mathematics',
      topicId: topicId || 'topic_quadratic_equations',
      learningGoal: learningGoal || 'Preparing for a test',
      active: active !== undefined ? active : true
    });

    res.status(201).json({
      success: true,
      data: context
    });
  } catch (err: any) {
    console.error('Error saving learning context:', err);
    res.status(500).json({
      success: false,
      error: { message: err.message || 'We could not save your learning setup.' }
    });
  }
};

export const getActiveLearningContextHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawUserId = req.params.userId;
    
    // Check ownership
    if (rawUserId && rawUserId !== 'me' && rawUserId !== req.user?.id && req.user?.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        error: { message: 'Access forbidden. You cannot view another student’s learning context.' }
      });
      return;
    }

    const userId = (rawUserId === 'me' || !rawUserId) ? req.user?.id : rawUserId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Authentication required to view active learning context.' }
      });
      return;
    }

    const context = await learningContextService.getActiveContext(userId);

    if (!context) {
      res.status(404).json({
        success: false,
        error: { message: 'No active learning context found for student' }
      });
      return;
    }

    res.json({
      success: true,
      data: context
    });
  } catch (err: any) {
    console.error('Error fetching active learning context:', err);
    res.status(500).json({
      success: false,
      error: { message: err.message || 'Failed to retrieve active learning context' }
    });
  }
};
