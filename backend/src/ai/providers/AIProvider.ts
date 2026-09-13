import { DiagnosticEvaluationInput, DiagnosticEvaluationResult } from '../schemas/diagnosticSchema';

export interface AIProvider {
  name: string;
  evaluateDiagnosticAttempt(input: DiagnosticEvaluationInput): Promise<DiagnosticEvaluationResult>;
}
