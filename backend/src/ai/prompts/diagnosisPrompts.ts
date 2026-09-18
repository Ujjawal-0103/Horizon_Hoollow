export const DIAGNOSIS_ENGINE_SYSTEM_PROMPT = `You are MindTrace's Diagnostic Synthesis Engine for secondary mathematics (Class 10 CBSE Quadratic Equations).
Your role is to analyze multi-signal student assessment evidence (answers, step explanations, confidence ratings, and self-assessment perceptions) and produce a structured, interpretable cognitive learning diagnosis.

CRITICAL INSTRUCTIONS:
1. You MUST output strictly valid JSON matching the exact schema requested.
2. ZERO Chain-of-Thought (CoT) / Zero Internal Scratchpad: Do NOT output conversational prose, reasoning scratchpads, markdown preambles, or conversational prefixes. Output ONLY the JSON object.
3. Concise Pedagogical Evidence: Provide safe, constructive, student-friendly diagnostic summaries for every field.
4. Misconception Rule: Do NOT classify an isolated arithmetic slip as a definite misconception. Flag misconceptions ONLY when the student makes a conceptual error with moderate/high confidence or demonstrates a flawed reasoning pattern.
5. Dimension Range: All scores (overallScore, conceptMastery, proceduralSkill, reasoningSkill, transferSkill, confidenceCalibration) must be integers between 0 and 100.
6. Recommended Path values must be strictly one of: "review_wrong_answers" | "learn_from_scratch" | "prerequisite_first".
7. Contradictions: Compare perceived self-ratings (KNOW, PARTIAL, DONT_KNOW) with actual performance. If the student rated a subtopic as KNOW but failed questions in it, identify it as OVERESTIMATION. If they rated DONT_KNOW but answered correctly, identify it as UNDERESTIMATION.`;

export interface DiagnosisPromptInput {
  topicName: string;
  grade: number;
  board: string;
  selfAssessment: Record<string, 'KNOW' | 'PARTIAL' | 'DONT_KNOW'>;
  attempts: Array<{
    questionId: string;
    subtopicTitle: string;
    type: string;
    prompt: string;
    expectedAnswer: string;
    studentAnswer: string;
    studentExplanation?: string;
    confidenceRating: number;
    isCorrect: boolean;
    stepAnalysis?: any;
    misconceptionSignals?: string[];
    reasoningSignals?: string[];
  }>;
}

export function buildDiagnosisUserPrompt(input: DiagnosisPromptInput): string {
  return `
Academic Context: Class ${input.grade} ${input.board} - ${input.topicName}

Self-Assessment Ratings (Perceived Confidence):
${JSON.stringify(input.selfAssessment, null, 2)}

Diagnostic Attempts & Multi-Signal Evidence (${input.attempts.length} items):
${JSON.stringify(input.attempts, null, 2)}

Produce a comprehensive multi-dimensional diagnosis in the required JSON format.
Ensure all numerical fields are integers 0-100, and all enums match the required types exactly.
`;
}
