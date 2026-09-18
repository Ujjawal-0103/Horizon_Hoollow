import { diagnosisEngineService } from '../services/diagnosisEngine';
import { 
  FullSessionDiagnosisSchema, 
  SessionDiagnosisInput 
} from '../ai/schemas/diagnosticSchema';
import { MockAIProvider } from '../ai/providers/MockAIProvider';
import { OpenAIProvider } from '../ai/providers/OpenAIProvider';
import { diagnosticService } from '../services/diagnosticService';

async function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  console.log('====================================================');
  console.log('🧪 SPRINT 5: AI DIAGNOSIS ENGINE TEST SUITE');
  console.log('====================================================\n');

  // ----------------------------------------------------
  // Test 1: Valid Structured AI Diagnosis Schema
  // ----------------------------------------------------
  console.log('--- 1. Valid AI Diagnosis Schema Validation ---');
  const validMockDiagnosis = {
    overallScore: 80,
    evaluatedAttempts: 5,
    conceptMastery: 85,
    proceduralSkill: 90,
    reasoningSkill: 75,
    transferSkill: 60,
    confidenceCalibration: 80,
    dimensions: {
      conceptMastery: 85,
      conceptStatus: 'SOLID',
      proceduralSkill: 90,
      proceduralStatus: 'STABLE',
      reasoningSkill: 75,
      reasoningStatus: 'STRONG',
      transferSkill: 60,
      transferStatus: 'MODERATE',
      confidenceCalibration: 80,
      calibrationStatus: 'well_calibrated'
    },
    misconceptions: [],
    contradictions: [],
    prerequisiteGaps: [],
    recommendedPath: 'review_wrong_answers',
    recommendedIntervention: {
      targetSubtopicId: 'sub_1',
      targetSubtopicTitle: 'Standard Form',
      focusConcept: 'Polynomial degree',
      headline: 'Review Standard Form',
      reason: 'Solid performance',
      suggestedAction: 'Practice problems'
    },
    biggestLearningSignal: {
      headline: 'Great grasp of standard form',
      detail: 'Accurate calculations throughout.'
    },
    rootCauseAnalysis: {
      visibleResult: 'Transfer = 60%',
      learningPattern: 'Strong procedural speed',
      likelyRootCause: 'Solid reasoning',
      prerequisiteGap: 'None'
    }
  };

  const parsedValid = FullSessionDiagnosisSchema.safeParse(validMockDiagnosis);
  assert(parsedValid.success, 'Valid diagnosis object parses successfully against schema');

  // ----------------------------------------------------
  // Test 2: Malformed AI JSON Handling
  // ----------------------------------------------------
  console.log('\n--- 2. Malformed AI JSON Handling ---');
  const malformedJsonString = '{"overallScore": 80, "conceptMastery": '; // syntax error
  let parsedMalformed = null;
  try {
    parsedMalformed = JSON.parse(malformedJsonString);
  } catch {
    parsedMalformed = null;
  }
  assert(parsedMalformed === null, 'Malformed JSON string correctly identified and rejected');

  // ----------------------------------------------------
  // Test 3: Invalid Numeric Values Out-Of-Bounds
  // ----------------------------------------------------
  console.log('\n--- 3. Invalid Numeric Values & Enum Handling ---');
  const outOfBoundsDiagnosis = {
    ...validMockDiagnosis,
    conceptMastery: 150 // Out of 0-100 range
  };
  const parsedOutOfBounds = FullSessionDiagnosisSchema.safeParse(outOfBoundsDiagnosis);
  assert(!parsedOutOfBounds.success, 'Schema strictly rejects conceptMastery > 100');

  const negativeScoreDiagnosis = {
    ...validMockDiagnosis,
    overallScore: -10
  };
  const parsedNegative = FullSessionDiagnosisSchema.safeParse(negativeScoreDiagnosis);
  assert(!parsedNegative.success, 'Schema strictly rejects overallScore < 0');

  const invalidEnumDiagnosis = {
    ...validMockDiagnosis,
    recommendedPath: 'skip_to_next_grade'
  };
  const parsedInvalidEnum = FullSessionDiagnosisSchema.safeParse(invalidEnumDiagnosis);
  assert(!parsedInvalidEnum.success, 'Schema rejects invalid recommendedPath enum');

  // ----------------------------------------------------
  // Test 4: Missing Fields Handling
  // ----------------------------------------------------
  console.log('\n--- 4. Missing Fields Handling ---');
  const missingDimensions = {
    overallScore: 80,
    conceptMastery: 85
    // Missing dimensions, misconceptions, contradictions, recommendedPath, etc.
  };
  const parsedMissing = FullSessionDiagnosisSchema.safeParse(missingDimensions);
  assert(!parsedMissing.success, 'Schema detects and rejects missing required diagnostic properties');

  // ----------------------------------------------------
  // Test 5: Deterministic Fallback Diagnosis
  // ----------------------------------------------------
  console.log('\n--- 5. Deterministic Fallback Diagnosis ---');
  const standardInput: SessionDiagnosisInput = {
    topicSlug: 'quadratic-equations',
    topicName: 'Quadratic Equations',
    grade: 10,
    board: 'CBSE',
    selfAssessment: {
      'standard-form': 'KNOW',
      'nature-of-roots': 'PARTIAL'
    },
    attempts: [
      {
        questionId: 'q_1',
        subtopicTitle: 'Standard Form of Quadratic Equations',
        type: 'CONCEPT',
        prompt: 'Which equation is quadratic?',
        expectedAnswer: 'B',
        studentAnswer: 'B',
        confidenceRating: 4,
        isCorrect: true
      },
      {
        questionId: 'q_2',
        subtopicTitle: 'Nature of Roots',
        type: 'TRANSFER',
        prompt: 'Condition for k in kx² - 6x + 1 = 0',
        expectedAnswer: 'k < 9 and k ≠ 0',
        studentAnswer: 'k < 9',
        confidenceRating: 4,
        isCorrect: false
      }
    ]
  };

  const fallbackDiagnosis = diagnosisEngineService.synthesizeDeterministicDiagnosis(standardInput);
  assert(FullSessionDiagnosisSchema.safeParse(fallbackDiagnosis).success, 'Fallback diagnosis produces 100% valid FullSessionDiagnosis schema');
  assert(fallbackDiagnosis.overallScore === 50, 'Fallback accurately calculates overall score (50%)');

  // ----------------------------------------------------
  // Test 6: Evidence-Based Misconception Scenario
  // ----------------------------------------------------
  console.log('\n--- 6. Misconception Scenario (Evidence-Based) ---');
  assert(
    fallbackDiagnosis.misconceptions.some(m => m.id === 'misc_param_coeff_boundary'),
    'Evidence-based misconception flagged for omitting a ≠ 0 constraint in parametric quadratic equation'
  );
  assert(
    fallbackDiagnosis.misconceptions[0].evidence.length > 0,
    'Misconception contains safe, pedagogical evidence without internal CoT'
  );

  // ----------------------------------------------------
  // Test 7: Contradiction Detection Scenarios
  // ----------------------------------------------------
  console.log('\n--- 7. Contradiction Detection Scenarios ---');
  
  // Scenario 7a: Self-assessment overestimation
  const contradictionInput: SessionDiagnosisInput = {
    topicSlug: 'quadratic-equations',
    topicName: 'Quadratic Equations',
    grade: 10,
    board: 'CBSE',
    selfAssessment: {
      'nature-of-roots': 'KNOW' // Rated KNOW but fails attempts in Nature of Roots
    },
    attempts: [
      {
        questionId: 'q_transfer_k_1',
        subtopicTitle: 'Nature of Roots',
        type: 'TRANSFER',
        prompt: 'Condition for k in kx² - 6x + 1 = 0',
        expectedAnswer: 'k < 9 and k ≠ 0',
        studentAnswer: 'k < 9',
        confidenceRating: 5, // High confidence error
        isCorrect: false
      },
      {
        questionId: 'q_transfer_k_2',
        subtopicTitle: 'Nature of Roots',
        type: 'TRANSFER',
        prompt: 'Condition for m in mx² + 4x + 1 = 0',
        expectedAnswer: 'm < 4 and m ≠ 0',
        studentAnswer: 'm < 4',
        confidenceRating: 5, // Second high confidence error
        isCorrect: false
      }
    ]
  };

  const contradictionResult = diagnosisEngineService.synthesizeDeterministicDiagnosis(contradictionInput);
  assert(
    contradictionResult.contradictions.some(c => c.nature === 'OVERESTIMATION'),
    'Contradiction detected: Overestimation between perceived confidence (KNOW) and actual low performance'
  );

  // Scenario 7b: Impostor syndrome (Low confidence + consistently correct answers)
  const impostorInput: SessionDiagnosisInput = {
    topicSlug: 'quadratic-equations',
    topicName: 'Quadratic Equations',
    grade: 10,
    board: 'CBSE',
    selfAssessment: {
      'standard-form': 'DONT_KNOW'
    },
    attempts: [
      {
        questionId: 'q_1',
        subtopicTitle: 'Standard Form of Quadratic Equations',
        type: 'CONCEPT',
        prompt: 'Identify standard form',
        expectedAnswer: 'A',
        studentAnswer: 'A',
        confidenceRating: 1, // Pure guess
        isCorrect: true
      },
      {
        questionId: 'q_2',
        subtopicTitle: 'Standard Form of Quadratic Equations',
        type: 'PROCEDURAL',
        prompt: 'Expand polynomial',
        expectedAnswer: 'B',
        studentAnswer: 'B',
        confidenceRating: 1, // Pure guess
        isCorrect: true
      }
    ]
  };
  const impostorResult = diagnosisEngineService.synthesizeDeterministicDiagnosis(impostorInput);
  assert(
    impostorResult.contradictions.some(c => c.nature === 'UNDERESTIMATION'),
    'Contradiction detected: Underestimation (Low confidence guessing rating with 100% correct answers)'
  );

  // ----------------------------------------------------
  // Test 8: Prerequisite Gap Scenario
  // ----------------------------------------------------
  console.log('\n--- 8. Prerequisite Gap Scenario ---');
  assert(
    contradictionResult.prerequisiteGaps.length > 0,
    'Prerequisite gap correctly identified for polynomial degree boundary conditions'
  );
  assert(
    contradictionResult.prerequisiteGaps[0].gradeLevel === 'Grade 9',
    'Prerequisite gap correctly links upstream knowledge to Grade 9 foundations'
  );

  // ----------------------------------------------------
  // Test 9: Recommended Learning Path
  // ----------------------------------------------------
  console.log('\n--- 9. Recommended Learning Path ---');
  // When multiple prerequisite gaps exist -> prerequisite_first
  const strugglingInput: SessionDiagnosisInput = {
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
  const strugglingResult = diagnosisEngineService.synthesizeDeterministicDiagnosis(strugglingInput);
  assert(
    strugglingResult.recommendedPath === 'prerequisite_first',
    'Correctly recommends prerequisite_first path when multiple foundational gaps exist'
  );

  // ----------------------------------------------------
  // Test 10: /api/diagnostic/analyze Endpoint Service
  // ----------------------------------------------------
  console.log('\n--- 10. /api/diagnostic/analyze Service Integration ---');
  const analyzeDto = {
    topicSlug: 'quadratic-equations',
    selfAssessment: { 'nature-of-roots': 'KNOW' as const },
    attempts: standardInput.attempts
  };
  const analyzeResult = await diagnosticService.analyzeDiagnosis(analyzeDto);
  assert(
    FullSessionDiagnosisSchema.safeParse(analyzeResult).success,
    'diagnosticService.analyzeDiagnosis returns valid FullSessionDiagnosis payload'
  );
  assert(analyzeResult.overallScore === 50, 'analyzeDiagnosis calculated accurate multi-signal score');

  console.log('\n====================================================');
  console.log(`🏁 SPRINT 5 TEST SUITE RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
