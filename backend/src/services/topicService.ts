import { prisma } from '../repositories/prisma';

export const FALLBACK_QUADRATIC_TOPIC = {
  id: 'topic_quadratic_equations',
  slug: 'quadratic-equations',
  name: 'Quadratic Equations',
  subject: 'Mathematics',
  grade: 10,
  board: 'CBSE',
  description: 'Second-degree equations, factoring, quadratic formula, discriminant, and parabolic modeling.',
  subtopics: [
    {
      id: 'sub_1',
      slug: 'standard-form',
      title: 'Standard Form of Quadratic Equations',
      orderIndex: 1,
      description: 'Recognizing ax² + bx + c = 0 with condition a ≠ 0.'
    },
    {
      id: 'sub_2',
      slug: 'solving-factorization',
      title: 'Solving by Factorization',
      orderIndex: 2,
      description: 'Splitting the middle term and zero product property.'
    },
    {
      id: 'sub_3',
      slug: 'quadratic-formula',
      title: 'Quadratic Formula',
      orderIndex: 3,
      description: 'Systematic application of x = (-b ± √(b² - 4ac)) / (2a).'
    },
    {
      id: 'sub_4',
      slug: 'discriminant',
      title: 'Discriminant (D = b² - 4ac)',
      orderIndex: 4,
      description: 'Computing the discriminant and evaluating sign consequences.'
    },
    {
      id: 'sub_5',
      slug: 'nature-of-roots',
      title: 'Nature of Roots',
      orderIndex: 5,
      description: 'Evaluating D > 0 (two distinct real roots), D = 0 (equal real roots), and D < 0 (no real roots).'
    },
    {
      id: 'sub_6',
      slug: 'word-problems',
      title: 'Word Problems & Equation Modeling',
      orderIndex: 6,
      description: 'Translating real-world geometry, speed-time, and integer problems into quadratic equations.'
    },
    {
      id: 'sub_7',
      slug: 'graph-interpretation',
      title: 'Graph Interpretation & Vertex Properties',
      orderIndex: 7,
      description: 'Parabolic trajectories, x-intercepts as real roots, and vertex extremum.'
    }
  ]
};

export class TopicService {
  async getTopicBySlug(slug: string) {
    try {
      const topic = await prisma.topic.findUnique({
        where: { slug },
        include: {
          subtopics: {
            orderBy: { orderIndex: 'asc' }
          }
        }
      });
      if (topic) return topic;
    } catch (err) {
      console.warn(`[TopicService] DB lookup for '${slug}' failed, using fallback domain:`, err);
    }

    if (slug === 'quadratic-equations') {
      return FALLBACK_QUADRATIC_TOPIC;
    }
    return null;
  }

  async getAllTopics(subject?: string) {
    try {
      const where = subject ? { subject: { equals: subject, mode: 'insensitive' as const } } : {};
      const topics = await prisma.topic.findMany({
        where,
        include: {
          subtopics: {
            orderBy: { orderIndex: 'asc' }
          }
        }
      });
      if (topics && topics.length > 0) return topics;
    } catch (err) {
      console.warn('[TopicService] DB lookup for all topics failed, returning fallback domain:', err);
    }
    if (!subject || subject.toLowerCase() === 'mathematics') {
      return [FALLBACK_QUADRATIC_TOPIC];
    }
    return [];
  }

  async getSubtopics(topicIdOrSlug: string) {
    try {
      const topic = await prisma.topic.findFirst({
        where: {
          OR: [{ id: topicIdOrSlug }, { slug: topicIdOrSlug }]
        },
        include: {
          subtopics: {
            orderBy: { orderIndex: 'asc' }
          }
        }
      });
      if (topic && topic.subtopics && topic.subtopics.length > 0) return topic.subtopics;
    } catch (err) {
      console.warn(`[TopicService] DB lookup for subtopics of '${topicIdOrSlug}' failed, using fallback:`, err);
    }

    return FALLBACK_QUADRATIC_TOPIC.subtopics;
  }
}

export const topicService = new TopicService();
