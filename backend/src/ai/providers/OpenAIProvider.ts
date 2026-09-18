import { AIProvider } from './AIProvider';
import { 
  DiagnosticEvaluationInput, 
  DiagnosticEvaluationResult, 
  DiagnosticEvaluationSchema,
  SessionDiagnosisInput,
  FullSessionDiagnosis,
  FullSessionDiagnosisSchema
} from '../schemas/diagnosticSchema';
import { MockAIProvider } from './MockAIProvider';
import { DIAGNOSIS_ENGINE_SYSTEM_PROMPT, buildDiagnosisUserPrompt } from '../prompts/diagnosisPrompts';

export class OpenAIProvider implements AIProvider {
  name = 'OpenAIProvider';
  private apiKey: string;
  private model: string;
  private fallback: MockAIProvider;

  constructor(apiKey: string, model: string = 'gpt-4o-mini') {
    this.apiKey = apiKey;
    this.model = model;
    this.fallback = new MockAIProvider();
  }

  async evaluateDiagnosticAttempt(input: DiagnosticEvaluationInput): Promise<DiagnosticEvaluationResult> {
    if (!this.apiKey) {
      return this.fallback.evaluateDiagnosticAttempt(input);
    }

    const systemPrompt = `You are MindTrace's Diagnostic Reasoning Engine for secondary mathematics (CBSE Class 10).
Analyze the student's attempt on this question.
You MUST output ONLY valid JSON matching this schema:
{
  "isCorrect": boolean,
  "score": number (0-100),
  "stepAnalysis": [
    { "step": number, "status": "correct" | "partially_correct" | "incorrect" | "unclear", "evidence": string }
  ],
  "reasoningSignals": string[],
  "misconceptionSignals": string[],
  "confidenceCalibration": "well_calibrated" | "overconfident" | "underconfident" | "uncertain",
  "rootCause": string | null,
  "recommendedAction": "test_transfer" | "targeted_intervention" | "prerequisite_repair" | "reassess" | "advance"
}
Do NOT expose internal thinking or chain-of-thought. Provide concise, constructive diagnostic evidence suitable for learning profile synthesis.`;

    const userPrompt = `
Topic Subtopic: ${input.subtopicTitle}
Question: ${input.questionPrompt}
Expected Answer: ${input.expectedAnswer}
Prerequisites: ${JSON.stringify(input.prerequisites)}
Expected Signals: ${JSON.stringify(input.expectedSignals)}

Student Answer: ${input.studentAnswer}
Student Step/Explanation: ${input.studentExplanation || 'None provided'}
Student Confidence (1=guessing, 5=certain): ${input.confidenceRating}
`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          temperature: 0.1,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ]
        })
      });

      if (!response.ok) {
        console.warn(`[OpenAIProvider] API returned ${response.status}, falling back to MockAIProvider.`);
        return this.fallback.evaluateDiagnosticAttempt(input);
      }

      const data = (await response.json()) as any;
      const rawJson = JSON.parse(data.choices?.[0]?.message?.content || '{}');
      const validated = DiagnosticEvaluationSchema.safeParse(rawJson);

      if (validated.success) {
        return validated.data;
      } else {
        console.warn('[OpenAIProvider] Schema validation error:', validated.error);
        return this.fallback.evaluateDiagnosticAttempt(input);
      }
    } catch (err) {
      console.warn('[OpenAIProvider] Network/API error, falling back:', err);
      return this.fallback.evaluateDiagnosticAttempt(input);
    }
  }

  async generateSessionDiagnosis(input: SessionDiagnosisInput): Promise<FullSessionDiagnosis> {
    if (!this.apiKey) {
      return this.fallback.generateSessionDiagnosis(input);
    }

    const userPrompt = buildDiagnosisUserPrompt({
      topicName: input.topicName,
      grade: input.grade,
      board: input.board,
      selfAssessment: input.selfAssessment,
      attempts: input.attempts
    });

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          temperature: 0.1,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: DIAGNOSIS_ENGINE_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt }
          ]
        })
      });

      if (!response.ok) {
        console.warn(`[OpenAIProvider.generateSessionDiagnosis] API returned ${response.status}, falling back to MockAIProvider.`);
        return this.fallback.generateSessionDiagnosis(input);
      }

      const data = (await response.json()) as any;
      const rawJson = JSON.parse(data.choices?.[0]?.message?.content || '{}');
      const validated = FullSessionDiagnosisSchema.safeParse(rawJson);

      if (validated.success) {
        return validated.data;
      } else {
        console.warn('[OpenAIProvider.generateSessionDiagnosis] Schema validation error, using fallback:', validated.error);
        return this.fallback.generateSessionDiagnosis(input);
      }
    } catch (err) {
      console.warn('[OpenAIProvider.generateSessionDiagnosis] Network/API error, falling back:', err);
      return this.fallback.generateSessionDiagnosis(input);
    }
  }
}
