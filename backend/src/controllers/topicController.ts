import { Request, Response, NextFunction } from 'express';
import { topicService } from '../services/topicService';

export async function getAllTopicsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const subject = req.query.subject as string | undefined;
    const topics = await topicService.getAllTopics(subject);
    res.json({
      success: true,
      data: topics
    });
  } catch (err) {
    next(err);
  }
}

export async function getTopicBySlugHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;
    const topic = await topicService.getTopicBySlug(slug);
    if (!topic) {
      return res.status(404).json({
        success: false,
        error: { message: `Topic '${slug}' not found.` }
      });
    }
    res.json({
      success: true,
      data: topic
    });
  } catch (err) {
    next(err);
  }
}

export async function getSubtopicsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { topicId } = req.params;
    const subtopics = await topicService.getSubtopics(topicId);
    res.json({
      success: true,
      data: subtopics
    });
  } catch (err) {
    next(err);
  }
}
