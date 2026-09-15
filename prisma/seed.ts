import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding MindTrace initial domain (Class 10 CBSE Mathematics: Quadratic Equations)...');

  // 1. Create or upsert Topic
  const topic = await prisma.topic.upsert({
    where: { slug: 'quadratic-equations' },
    update: {},
    create: {
      slug: 'quadratic-equations',
      name: 'Quadratic Equations',
      subject: 'Mathematics',
      grade: 10,
      board: 'CBSE',
      description: 'Foundations of second-degree polynomial equations, factoring, discriminant analysis, and parabolic modeling.'
    }
  });

  console.log(`✅ Upserted Topic: ${topic.name} (${topic.id})`);

  // 2. Seed 7 Subtopics
  const subtopicData = [
    {
      slug: 'standard-form',
      title: 'Standard Form of Quadratic Equations',
      orderIndex: 1,
      description: 'Recognizing ax² + bx + c = 0 with condition a ≠ 0.'
    },
    {
      slug: 'solving-factorization',
      title: 'Solving by Factorization',
      orderIndex: 2,
      description: 'Splitting the middle term and zero product property.'
    },
    {
      slug: 'quadratic-formula',
      title: 'Quadratic Formula',
      orderIndex: 3,
      description: 'Applying x = (-b ± √(b² - 4ac)) / (2a) systematically.'
    },
    {
      slug: 'discriminant',
      title: 'Discriminant (D = b² - 4ac)',
      orderIndex: 4,
      description: 'Computing the discriminant and understanding sign implications.'
    },
    {
      slug: 'nature-of-roots',
      title: 'Nature of Roots',
      orderIndex: 5,
      description: 'Interpreting D > 0 (two distinct real roots), D = 0 (equal real roots), and D < 0 (no real roots).'
    },
    {
      slug: 'word-problems',
      title: 'Word Problems & Equation Modeling',
      orderIndex: 6,
      description: 'Translating real-world geometry, speed-time, and integer problems into quadratic equations.'
    },
    {
      slug: 'graph-interpretation',
      title: 'Graph Interpretation & Vertex Properties',
      orderIndex: 7,
      description: 'Parabolic trajectories, x-intercepts as real roots, and vertex extremum.'
    }
  ];

  const subtopics = [];
  for (const item of subtopicData) {
    const subtopic = await prisma.subtopic.upsert({
      where: {
        topicId_slug: {
          topicId: topic.id,
          slug: item.slug
        }
      },
      update: {
        title: item.title,
        orderIndex: item.orderIndex,
        description: item.description
      },
      create: {
        topicId: topic.id,
        slug: item.slug,
        title: item.title,
        orderIndex: item.orderIndex,
        description: item.description
      }
    });
    subtopics.push(subtopic);
  }
  console.log(`✅ Seeded ${subtopics.length} subtopics.`);

  // 3. Seed Initial Diagnostic Questions (Multi-Signal)
  const standardFormSubtopic = subtopics.find(s => s.slug === 'standard-form')!;
  const factorizationSubtopic = subtopics.find(s => s.slug === 'solving-factorization')!;
  const discriminantSubtopic = subtopics.find(s => s.slug === 'discriminant')!;
  const natureRootsSubtopic = subtopics.find(s => s.slug === 'nature-of-roots')!;

  const sampleQuestions = [
    {
      id: 'q_standard_form_1',
      subtopicId: standardFormSubtopic.id,
      type: 'CONCEPT',
      difficulty: 'EASY',
      prompt: 'Which of the following equations is NOT a quadratic equation?',
      options: [
        '(x - 2)² + 1 = 2x - 3',
        'x(x + 1) + 8 = (x + 2)(x - 2)',
        'x(2x + 3) = x² + 1',
        '(x + 2)³ = x³ - 4'
      ],
      correctAnswer: 'x(x + 1) + 8 = (x + 2)(x - 2)',
      explanation: 'Expanding x(x + 1) + 8 gives x² + x + 8, and (x + 2)(x - 2) gives x² - 4. Subtracting x² from both sides cancels out the degree-2 term, leaving x + 12 = 0 (linear, not quadratic).',
      prerequisites: ['Polynomial expansion', 'Degree of polynomial'],
      expectedSignals: ['Identifies cancellation of x² term', 'Checks degree after full expansion']
    },
    {
      id: 'q_discriminant_1',
      subtopicId: discriminantSubtopic.id,
      type: 'PROCEDURAL',
      difficulty: 'MEDIUM',
      prompt: 'What is the discriminant of the quadratic equation 2x² - 4x + 3 = 0?',
      options: [
        'D = -8',
        'D = 8',
        'D = -40',
        'D = 40'
      ],
      correctAnswer: 'D = -8',
      explanation: 'Here a = 2, b = -4, c = 3. Discriminant D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8.',
      prerequisites: ['Order of operations', 'Identification of coefficients a, b, c'],
      expectedSignals: ['Handles negative sign squaring correctly', 'Correct multiplication of 4ac']
    },
    {
      id: 'q_nature_roots_1',
      subtopicId: natureRootsSubtopic.id,
      type: 'REASONING',
      difficulty: 'MEDIUM',
      prompt: 'Why does the quadratic equation x² + 2x + 5 = 0 have no real roots?',
      options: [
        'Because the discriminant D = -16, which is less than 0',
        'Because the coefficient a = 1 is positive',
        'Because b² = 4 is less than c = 5',
        'Because x cannot be negative'
      ],
      correctAnswer: 'Because the discriminant D = -16, which is less than 0',
      explanation: 'D = 2² - 4(1)(5) = 4 - 20 = -16. Since D < 0, the square root of D is not a real number, so there are no real roots.',
      prerequisites: ['Discriminant formula', 'Square root of negative numbers'],
      expectedSignals: ['Evaluates D < 0 condition', 'Connects negative discriminant to non-real roots']
    },
    {
      id: 'q_explain_back_1',
      subtopicId: factorizationSubtopic.id,
      type: 'EXPLAIN_BACK',
      difficulty: 'MEDIUM',
      prompt: 'In your own words, explain why setting (x - 3)(x + 5) = 0 allows us to conclude that x = 3 or x = -5.',
      options: [
        'Zero Product Property: If the product of two real numbers is 0, at least one of the factors must be 0',
        'Combining like terms requires setting x to positive and negative values',
        'Quadratic equations always have opposite signs for their roots',
        'The discriminant D is equal to 0 for factored polynomials'
      ],
      correctAnswer: 'Zero Product Property: If the product of two real numbers is 0, at least one of the factors must be 0',
      explanation: 'If A * B = 0, then either A = 0 or B = 0. So x - 3 = 0 => x = 3, or x + 5 = 0 => x = -5.',
      prerequisites: ['Zero product property', 'Linear equation solving'],
      expectedSignals: ['Identifies Zero Product Property', 'Explains factor breakdown']
    },
    {
      id: 'q_transfer_k_1',
      subtopicId: natureRootsSubtopic.id,
      type: 'TRANSFER',
      difficulty: 'HARD',
      prompt: 'If the quadratic equation kx² - 6x + 1 = 0 has two distinct real roots, what is the exact condition for k?',
      options: [
        'k < 9 and k ≠ 0',
        'k > 9',
        'k ≤ 9 and k ≠ 0',
        'k < 36'
      ],
      correctAnswer: 'k < 9 and k ≠ 0',
      explanation: 'For two distinct real roots, D > 0 and the equation must remain quadratic (a ≠ 0). Here D = (-6)² - 4(k)(1) = 36 - 4k > 0 => 4k < 36 => k < 9. Since the coefficient of x² is k, k cannot be 0.',
      prerequisites: ['Inequalities', 'Definition of quadratic coefficient a ≠ 0'],
      expectedSignals: ['Remembers a ≠ 0 constraint', 'Reverses inequality sign correctly if dividing by negative']
    }
  ];

  for (const q of sampleQuestions) {
    const existing = await prisma.question.findFirst({
      where: { prompt: q.prompt }
    });

    if (!existing) {
      await prisma.question.create({
        data: {
          id: q.id,
          subtopicId: q.subtopicId,
          type: q.type,
          difficulty: q.difficulty,
          prompt: q.prompt,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          prerequisites: q.prerequisites,
          expectedSignals: q.expectedSignals
        }
      });
    }
  }

  console.log('✅ Seeded initial diagnostic questions.');
  console.log('✨ Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
