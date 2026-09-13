import { Request, Response } from 'express';
import { selfAssessmentService } from '../services/selfAssessmentService';

export const saveSelfAssessmentHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { learningContextId, overallConfidence, selectedMode, subtopicRatings } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Authentication required to save self-assessment.' }
      });
      return;
    }

    if (!learningContextId) {
      res.status(400).json({
        success: false,
        error: { message: 'learningContextId is required.' }
      });
      return;
    }

    const assessment = await selfAssessmentService.saveSelfAssessment({
      userId,
      learningContextId,
      overallConfidence: Number(overallConfidence) || 3,
      selectedMode: selectedMode || 'TEST',
      subtopicRatings: subtopicRatings || {}
    });

    res.status(201).json({
      success: true,
      data: assessment
    });
  } catch (err: any) {
    console.error('Error saving self assessment:', err);
    res.status(500).json({
      success: false,
      error: { message: err.message || 'We could not save your self-assessment.' }
    });
  }
};

export const getSelfAssessmentHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: { message: 'Assessment id is required' }
      });
      return;
    }

    const assessment = await selfAssessmentService.getSelfAssessment(id);

    if (!assessment) {
      res.status(404).json({
        success: false,
        error: { message: 'Self-assessment not found' }
      });
      return;
    }

    // Ownership check if authenticated user exists
    if (req.user && req.user.role !== 'ADMIN' && assessment.userId && assessment.userId !== req.user.id) {
      res.status(403).json({
        success: false,
        error: { message: 'Access forbidden. You cannot view another student’s self-assessment.' }
      });
      return;
    }

    res.json({
      success: true,
      data: assessment
    });
  } catch (err: any) {
    console.error('Error fetching self assessment:', err);
    res.status(500).json({
      success: false,
      error: { message: err.message || 'Failed to retrieve self-assessment' }
    });
  }
};

export const updateSelfAssessmentHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { overallConfidence, selectedMode, subtopicRatings } = req.body;

    const existing = await selfAssessmentService.getSelfAssessment(id);
    if (!existing) {
      res.status(404).json({
        success: false,
        error: { message: 'Self-assessment not found' }
      });
      return;
    }

    // Ownership check if authenticated user exists
    if (req.user && req.user.role !== 'ADMIN' && existing.userId && existing.userId !== req.user.id) {
      res.status(403).json({
        success: false,
        error: { message: 'Access forbidden. You cannot update another student’s self-assessment.' }
      });
      return;
    }

    const assessment = await selfAssessmentService.updateSelfAssessment(id, {
      overallConfidence: overallConfidence !== undefined ? Number(overallConfidence) : undefined,
      selectedMode,
      subtopicRatings
    });

    res.json({
      success: true,
      data: assessment
    });
  } catch (err: any) {
    console.error('Error updating self assessment:', err);
    res.status(500).json({
      success: false,
      error: { message: err.message || 'Failed to update self-assessment' }
    });
  }
};
