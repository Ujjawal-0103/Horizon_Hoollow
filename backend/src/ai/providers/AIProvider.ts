import { 
  DiagnosticEvaluationInput, 
  DiagnosticEvaluationResult,
  SessionDiagnosisInput,
  FullSessionDiagnosis
} from '../schemas/diagnosticSchema';

export interface AIProvider {
  name: string;
  evaluateDiagnosticAttempt(input: DiagnosticEvaluationInput): Promise<DiagnosticEvaluationResult>;
  generateSessionDiagnosis(input: SessionDiagnosisInput): Promise<FullSessionDiagnosis>;
}
