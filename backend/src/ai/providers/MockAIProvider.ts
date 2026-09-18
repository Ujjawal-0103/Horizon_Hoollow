import { AIProvider } from './AIProvider';
import { 
  DiagnosticEvaluationInput, 
  DiagnosticEvaluationResult,
  SessionDiagnosisInput,
  FullSessionDiagnosis
} from '../schemas/diagnosticSchema';
import { diagnosisEngineService } from '../../services/diagnosisEngine';

export class MockAIProvider implements AIProvider {
  name = 'MockAIProvider';

  async evaluateDiagnosticAttempt(input: DiagnosticEvaluationInput): Promise<DiagnosticEvaluationResult> {
    const cleanStudent = input.studentAnswer.trim().toLowerCase();
    const cleanExpected = input.expectedAnswer.trim().toLowerCase();

    // Check correctness
    const isExactMatch = cleanStudent === cleanExpected;
    const containsCore = cleanStudent.includes(cleanExpected) || cleanExpected.includes(cleanStudent);
    const isCorrect = isExactMatch || (cleanStudent.length > 0 && containsCore);

    // Confidence calibration analysis
    let calibration: 'well_calibrated' | 'overconfident' | 'underconfident' | 'uncertain' = 'well_calibrated';
    if (!isCorrect && input.confidenceRating >= 4) {
      calibration = 'overconfident';
    } else if (isCorrect && input.confidenceRating <= 2) {
      calibration = 'underconfident';
    } else if (input.confidenceRating === 3) {
      calibration = 'uncertain';
    }

    // Step analysis simulation
    const steps = [
      {
        step: 1,
        status: isCorrect ? ('correct' as const) : ('incorrect' as const),
        evidence: isCorrect
          ? `Correctly identified standard form coefficients and algebraic structure.`
          : `Discrepancy in handling coefficients or algebraic simplification in step 1.`
      },
      {
        step: 2,
        status: isCorrect ? ('correct' as const) : ('partially_correct' as const),
        evidence: input.studentExplanation
          ? `Explanation supplied: "${input.studentExplanation.slice(0, 100)}..." evaluated for conceptual coherence.`
          : `No explicit step breakdown provided; assessed based on final mathematical selection.`
      }
    ];

    const misconceptionSignals: string[] = [];
    const reasoningSignals: string[] = [];

    if (isCorrect) {
      reasoningSignals.push(`Demonstrated solid grasp of ${input.subtopicTitle}.`);
      reasoningSignals.push(`Applied constraints correctly.`);
    } else {
      misconceptionSignals.push(`Sign or coefficient misapplication in ${input.subtopicTitle}.`);
      if (input.subtopicTitle.toLowerCase().includes('discriminant')) {
        misconceptionSignals.push(`Potential confusion between D = 0 vs D < 0 real root conditions.`);
      } else if (input.subtopicTitle.toLowerCase().includes('standard form')) {
        misconceptionSignals.push(`Failing to reduce polynomial completely before judging degree.`);
      }
    }

    return {
      isCorrect,
      score: isCorrect ? 100 : 35,
      stepAnalysis: steps,
      reasoningSignals,
      misconceptionSignals,
      confidenceCalibration: calibration,
      rootCause: isCorrect
        ? undefined
        : `Procedural gap during algebraic reduction or sign management under ${input.subtopicTitle}.`,
      recommendedAction: isCorrect ? 'test_transfer' : 'targeted_intervention'
    };
  }

  async generateSessionDiagnosis(input: SessionDiagnosisInput): Promise<FullSessionDiagnosis> {
    return diagnosisEngineService.synthesizeDeterministicDiagnosis(input);
  }
}
