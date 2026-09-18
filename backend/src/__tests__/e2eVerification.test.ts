import { diagnosisEngineService } from '../services/diagnosisEngine';
import { diagnosticService } from '../services/diagnosticService';
import { 
  FullSessionDiagnosisSchema, 
  SessionDiagnosisInput 
} from '../ai/schemas/diagnosticSchema';
import { MockAIProvider } from '../ai/providers/MockAIProvider';
import { OpenAIProvider } from '../ai/providers/OpenAIProvider';

async function runE2EVerification() {
  console.log('=================================================================');
  console.log('🚀 MINDTRACE SPRINT 5: COMPREHENSIVE END-TO-END VERIFICATION');
  console.log('=================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      if (detail) console.error(`     Detail: ${detail}`);
      failed++;
    }
  }

  // =================================================================
  // 1. Evidence Normalization Test
  // =================================================================
  console.log('--- 1. Evidence Normalization Verification ---');
  const rawUnnormalized: SessionDiagnosisInput = {
    topicSlug: 'quadratic-equations',
    topicName: 'Quadratic Equations',
    grade: 10,
    board: 'cbse',
    selfAssessment: { 'nature-of-roots': 'KNOW' },
    attempts: [
      {
        questionId: 'q_1',
        subtopicTitle: 'Standard Form of Quadratic Equations',
        type: 'concept', // lowercase
        prompt: 'Which equation is quadratic?',
        expectedAnswer: 'B',
        studentAnswer: '  B  ', // unpadded
        studentExplanation: '  Because degree is 2  ',
        confidenceRating: 8, // out of bounds (> 5)
        isCorrect: true
      }
    ]
  };

  const normalized = diagnosisEngineService.normalizeEvidence(rawUnnormalized);
  assert(normalized.attempts[0].studentAnswer === 'B', 'Student answer whitespace trimmed');
  assert(normalized.attempts[0].studentExplanation === 'Because degree is 2', 'Student explanation whitespace trimmed');
  assert(normalized.attempts[0].confidenceRating === 5, 'Out-of-bounds confidence rating bounded to 5');
  assert(normalized.attempts[0].type === 'CONCEPT', 'Cognitive tag normalized to uppercase');

  // =================================================================
  // 2. Scenario A: Correct Routine + Wrong Transfer
  // =================================================================
  console.log('\n--- 2. Scenario A: Correct Routine + Wrong Transfer ---');
  const scenarioA: SessionDiagnosisInput = {
    topicSlug: 'quadratic-equations',
    topicName: 'Quadratic Equations',
    grade: 10,
    board: 'CBSE',
    selfAssessment: {
      'standard-form': 'KNOW',
      'nature-of-roots': 'KNOW'
    },
    attempts: [
      {
        questionId: 'q_std',
        subtopicTitle: 'Standard Form of Quadratic Equations',
        type: 'CONCEPT',
        prompt: 'Identify standard form',
        expectedAnswer: 'A',
        studentAnswer: 'A',
        confidenceRating: 4,
        isCorrect: true
      },
      {
        questionId: 'q_disc',
        subtopicTitle: 'Discriminant (D = b² - 4ac)',
        type: 'PROCEDURAL',
        prompt: 'Calculate D',
        expectedAnswer: 'D = -8',
        studentAnswer: 'D = -8',
        confidenceRating: 4,
        isCorrect: true
      },
      {
        questionId: 'q_transfer',
        subtopicTitle: 'Nature of Roots',
        type: 'TRANSFER',
        prompt: 'Find condition for k in kx² - 6x + 1 = 0',
        expectedAnswer: 'k < 9 and k ≠ 0',
        studentAnswer: 'k < 9', // Missed a != 0
        confidenceRating: 4,
        isCorrect: false
      }
    ]
  };

  const resultA = diagnosisEngineService.synthesizeDeterministicDiagnosis(scenarioA);
  assert(resultA.proceduralSkill >= 75, 'Procedural skill is high/stable (100% on calculations)');
  assert(resultA.transferSkill < 50, 'Transfer skill correctly diagnosed as low (< 50%)');
  assert(resultA.misconceptions.some(m => m.id === 'misc_param_coeff_boundary'), 'Flagged parameter boundary condition misconception');
  assert(FullSessionDiagnosisSchema.safeParse(resultA).success, 'Scenario A output is 100% valid schema');

  // =================================================================
  // 3. Scenario B: Wrong Answer + Sound Reasoning (Arithmetic/Execution Error)
  // =================================================================
  console.log('\n--- 3. Scenario B: Arithmetic/Execution Error with Sound Reasoning ---');
  const scenarioB: SessionDiagnosisInput = {
    topicSlug: 'quadratic-equations',
    topicName: 'Quadratic Equations',
    grade: 10,
    board: 'CBSE',
    selfAssessment: {},
    attempts: [
      {
        questionId: 'q_proc',
        subtopicTitle: 'Discriminant (D = b² - 4ac)',
        type: 'PROCEDURAL',
        prompt: 'Compute D for 2x² - 4x + 3 = 0',
        expectedAnswer: 'D = -8',
        studentAnswer: 'D = -40', // Calculation slip
        studentExplanation: 'Applied D = b^2 - 4ac, but calculated (-4)^2 as -16 instead of +16',
        confidenceRating: 3,
        isCorrect: false
      }
    ]
  };
  const resultB = diagnosisEngineService.synthesizeDeterministicDiagnosis(scenarioB);
  assert(resultB.proceduralSkill === 0, 'Procedural skill reflects calculation slip');
  assert(resultB.misconceptions.length > 0, 'Detected discriminant sign error');

  // =================================================================
  // 4. Scenario C: Impostor Phenomenon (Low Confidence + Correct Answers)
  // =================================================================
  console.log('\n--- 4. Scenario C: Impostor Syndrome (Low Confidence + Correct Answers) ---');
  const scenarioC: SessionDiagnosisInput = {
    topicSlug: 'quadratic-equations',
    topicName: 'Quadratic Equations',
    grade: 10,
    board: 'CBSE',
    selfAssessment: { 'nature-of-roots': 'DONT_KNOW' },
    attempts: [
      {
        questionId: 'q_1',
        subtopicTitle: 'Standard Form of Quadratic Equations',
        type: 'CONCEPT',
        prompt: 'Q1',
        expectedAnswer: 'A',
        studentAnswer: 'A',
        confidenceRating: 1, // Pure guess
        isCorrect: true
      },
      {
        questionId: 'q_2',
        subtopicTitle: 'Nature of Roots',
        type: 'CONCEPT',
        prompt: 'Q2',
        expectedAnswer: 'B',
        studentAnswer: 'B',
        confidenceRating: 1, // Pure guess
        isCorrect: true
      }
    ]
  };
  const resultC = diagnosisEngineService.synthesizeDeterministicDiagnosis(scenarioC);
  assert(resultC.dimensions.calibrationStatus === 'underconfident', 'Calibration correctly diagnosed as underconfident');
  assert(resultC.contradictions.some(c => c.nature === 'UNDERESTIMATION'), 'Underestimation contradiction detected');

  // =================================================================
  // 5. Scenario D: High Confidence + Repeated Incorrect Answers
  // =================================================================
  console.log('\n--- 5. Scenario D: High Confidence + Repeated Incorrect Answers ---');
  const scenarioD: SessionDiagnosisInput = {
    topicSlug: 'quadratic-equations',
    topicName: 'Quadratic Equations',
    grade: 10,
    board: 'CBSE',
    selfAssessment: { 'nature-of-roots': 'KNOW' },
    attempts: [
      {
        questionId: 'q_1',
        subtopicTitle: 'Nature of Roots',
        type: 'TRANSFER',
        prompt: 'Q1',
        expectedAnswer: 'A',
        studentAnswer: 'B',
        confidenceRating: 5, // High confidence wrong
        isCorrect: false
      },
      {
        questionId: 'q_2',
        subtopicTitle: 'Nature of Roots',
        type: 'TRANSFER',
        prompt: 'Q2',
        expectedAnswer: 'A',
        studentAnswer: 'B',
        confidenceRating: 5, // High confidence wrong
        isCorrect: false
      }
    ]
  };
  const resultD = diagnosisEngineService.synthesizeDeterministicDiagnosis(scenarioD);
  assert(resultD.dimensions.calibrationStatus === 'overconfident', 'Calibration correctly diagnosed as overconfident');
  assert(resultD.contradictions.some(c => c.nature === 'OVERESTIMATION'), 'Overestimation contradiction detected');

  // =================================================================
  // 6. Scenario E: Weak Advanced Topic + Weak Prerequisite
  // =================================================================
  console.log('\n--- 6. Scenario E: Weak Advanced Topic + Prerequisite Gaps ---');
  const scenarioE: SessionDiagnosisInput = {
    topicSlug: 'quadratic-equations',
    topicName: 'Quadratic Equations',
    grade: 10,
    board: 'CBSE',
    selfAssessment: {},
    attempts: [
      {
        questionId: 'q_1',
        subtopicTitle: 'Standard Form of Quadratic Equations',
        type: 'CONCEPT',
        prompt: 'Q1',
        expectedAnswer: 'A',
        studentAnswer: 'B',
        confidenceRating: 2,
        isCorrect: false
      },
      {
        questionId: 'q_2',
        subtopicTitle: 'Solving by Factorization',
        type: 'PROCEDURAL',
        prompt: 'Q2',
        expectedAnswer: 'A',
        studentAnswer: 'B',
        confidenceRating: 2,
        isCorrect: false
      },
      {
        questionId: 'q_3',
        subtopicTitle: 'Nature of Roots',
        type: 'TRANSFER',
        prompt: 'Q3',
        expectedAnswer: 'A',
        studentAnswer: 'B',
        confidenceRating: 2,
        isCorrect: false
      }
    ]
  };
  const resultE = diagnosisEngineService.synthesizeDeterministicDiagnosis(scenarioE);
  assert(resultE.recommendedPath === 'prerequisite_first', 'Recommended path correctly prioritizes prerequisite_first');
  assert(resultE.prerequisiteGaps.length >= 2, 'Multiple upstream Grade 8/9 prerequisite gaps identified');

  // =================================================================
  // 7. Zero Chain-of-Thought (CoT) Leak Check
  // =================================================================
  console.log('\n--- 7. Zero Chain-of-Thought (CoT) Leak Verification ---');
  const stringifiedOutput = JSON.stringify(resultA);
  assert(!stringifiedOutput.includes('"thought":'), 'No "thought" key found in output');
  assert(!stringifiedOutput.includes('"chain_of_thought":'), 'No "chain_of_thought" key found in output');
  assert(!stringifiedOutput.includes('"scratchpad":'), 'No "scratchpad" key found in output');
  assert(!stringifiedOutput.includes('<think>'), 'No <think> tags found in output');

  // =================================================================
  // 8. Fallback on Malformed/Empty Input
  // =================================================================
  console.log('\n--- 8. Fallback on Insufficient Evidence ---');
  const emptyInput: SessionDiagnosisInput = {
    topicSlug: 'quadratic-equations',
    topicName: 'Quadratic Equations',
    grade: 10,
    board: 'CBSE',
    selfAssessment: {},
    attempts: []
  };
  const resultEmpty = diagnosisEngineService.synthesizeDeterministicDiagnosis(emptyInput);
  assert(FullSessionDiagnosisSchema.safeParse(resultEmpty).success, 'Empty input safely handled and produces schema-valid diagnosis');

  // =================================================================
  // 9. Full DiagnosticService.analyzeDiagnosis Integration
  // =================================================================
  console.log('\n--- 9. Full DiagnosticService.analyzeDiagnosis Service ---');
  const serviceDiagnosis = await diagnosticService.analyzeDiagnosis({
    topicSlug: 'quadratic-equations',
    selfAssessment: { 'nature-of-roots': 'KNOW' as const },
    attempts: scenarioA.attempts
  });
  assert(FullSessionDiagnosisSchema.safeParse(serviceDiagnosis).success, 'analyzeDiagnosis returns 100% valid FullSessionDiagnosis payload');
  assert(serviceDiagnosis.evaluatedAttempts === 3, 'Evaluated attempt count is accurate (3)');
  assert(serviceDiagnosis.transferSkill < 50, 'Transfer gap accurately reflected in service output');

  // =================================================================
  // Summary
  // =================================================================
  console.log('\n=================================================================');
  console.log(`🏁 E2E VERIFICATION RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log('=================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runE2EVerification().catch(err => {
  console.error('Fatal verification error:', err);
  process.exit(1);
});
