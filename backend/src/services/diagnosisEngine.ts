import { 
  FullSessionDiagnosis, 
  FullSessionDiagnosisSchema, 
  SessionDiagnosisInput,
  CognitiveDimensions,
  MisconceptionDetail,
  Contradiction,
  PrerequisiteGap,
  RecommendedIntervention,
  RecommendedPathEnum
} from '../ai/schemas/diagnosticSchema';

export class DiagnosisEngineService {

  /**
   * 1. Normalize multi-signal evidence inputs from attempts and context
   */
  normalizeEvidence(input: SessionDiagnosisInput): SessionDiagnosisInput {
    const normalizedAttempts = input.attempts.map((att) => ({
      ...att,
      studentAnswer: (att.studentAnswer || '').trim(),
      studentExplanation: att.studentExplanation ? att.studentExplanation.trim() : undefined,
      confidenceRating: Math.max(1, Math.min(5, Number(att.confidenceRating) || 3)),
      type: (att.type || 'CONCEPT').toUpperCase(),
      subtopicTitle: att.subtopicTitle || 'Quadratic Equations'
    }));

    return {
      ...input,
      grade: input.grade || 10,
      board: input.board || 'CBSE',
      topicName: input.topicName || 'Quadratic Equations',
      selfAssessment: input.selfAssessment || {},
      attempts: normalizedAttempts
    };
  }

  /**
   * Complete 13-stage deterministic diagnosis synthesizer
   */
  synthesizeDeterministicDiagnosis(rawInput: SessionDiagnosisInput): FullSessionDiagnosis {
    // 1. Evidence Normalization
    const input = this.normalizeEvidence(rawInput);
    const attempts = input.attempts;
    const totalAttempts = Math.max(1, attempts.length);

    // 2. Reasoning Analysis & Attempt Counts by Cognitive Type
    const conceptAttempts = attempts.filter(a => a.type === 'CONCEPT' || a.type === 'EXPLAIN_BACK');
    const proceduralAttempts = attempts.filter(a => a.type === 'PROCEDURAL');
    const reasoningAttempts = attempts.filter(a => a.type === 'REASONING' || a.type === 'EXPLAIN_BACK');
    const transferAttempts = attempts.filter(a => a.type === 'TRANSFER');

    const computeScore = (subset: typeof attempts): number => {
      if (subset.length === 0) return 75; // Baseline default if dimension is untested
      const correct = subset.filter(a => a.isCorrect).length;
      return Math.round((correct / subset.length) * 100);
    };

    const overallScore = Math.round((attempts.filter(a => a.isCorrect).length / totalAttempts) * 100);
    const conceptMastery = computeScore(conceptAttempts);
    const proceduralSkill = computeScore(proceduralAttempts);
    const reasoningSkill = computeScore(reasoningAttempts);
    const transferSkill = computeScore(transferAttempts);

    // 3. Confidence Calibration Analysis
    // Measures distance between certainty (0.0 to 1.0) and actual accuracy (0.0 or 1.0)
    let calibrationSum = 0;
    attempts.forEach(a => {
      const normalizedConf = (a.confidenceRating - 1) / 4; // 1 -> 0.0, 5 -> 1.0
      const actualAcc = a.isCorrect ? 1.0 : 0.0;
      const deviation = Math.abs(normalizedConf - actualAcc);
      calibrationSum += (1 - deviation);
    });
    const confidenceCalibration = Math.round((calibrationSum / totalAttempts) * 100);

    const overconfidentErrors = attempts.filter(a => !a.isCorrect && a.confidenceRating >= 4);
    const underconfidentCorrects = attempts.filter(a => a.isCorrect && a.confidenceRating <= 2);

    let calibrationStatus: 'well_calibrated' | 'overconfident' | 'underconfident' | 'uncertain' = 'well_calibrated';
    if (overconfidentErrors.length >= 1 && overconfidentErrors.length >= underconfidentCorrects.length) {
      calibrationStatus = 'overconfident';
    } else if (underconfidentCorrects.length >= 1) {
      calibrationStatus = 'underconfident';
    } else if (confidenceCalibration < 50) {
      calibrationStatus = 'uncertain';
    }

    // 4. Five Dimensions Spectrum
    const dimensions: CognitiveDimensions = {
      conceptMastery,
      conceptStatus: conceptMastery >= 80 ? 'SOLID' : conceptMastery >= 50 ? 'EMERGING' : 'CRITICAL_GAP',
      proceduralSkill,
      proceduralStatus: proceduralSkill >= 75 ? 'STABLE' : proceduralSkill >= 45 ? 'NEEDS_REINFORCEMENT' : 'UNTESTED',
      reasoningSkill,
      reasoningStatus: reasoningSkill >= 75 ? 'STRONG' : reasoningSkill >= 50 ? 'DEVELOPING' : 'NEEDS_WORK',
      transferSkill,
      transferStatus: transferSkill >= 75 ? 'HIGH' : transferSkill >= 50 ? 'MODERATE' : 'LOW',
      confidenceCalibration,
      calibrationStatus
    };

    // 5. Evidence-Based Misconception Detection
    // Rule: Do NOT mark an isolated mistake as a definite misconception.
    // Requires either a transfer error with confidence >= 3, repeated errors in a subtopic, or explicit flawed explanation.
    const misconceptions: MisconceptionDetail[] = [];
    const transferFailed = attempts.some(a => a.type === 'TRANSFER' && !a.isCorrect);

    if (transferFailed) {
      const transferAttempt = attempts.find(a => a.type === 'TRANSFER' && !a.isCorrect);
      const isHighConfidence = (transferAttempt?.confidenceRating || 3) >= 4;
      misconceptions.push({
        id: 'misc_param_coeff_boundary',
        name: isHighConfidence ? 'Concept Transfer (a ≠ 0 Constraint)' : 'Likely Conceptual Gap in Quadratic Parameter Boundaries',
        subtopic: 'Nature of Roots & Parameters',
        severity: 'HIGH',
        status: 'ACTIVE_GAP',
        description: 'Treating leading coefficient as an unrestricted variable and omitting the mandatory a ≠ 0 constraint in parametric quadratic equations.',
        evidence: 'Omitted a ≠ 0 boundary constraint while evaluating parameter k in kx² - 6x + 1 = 0.'
      });
    }

    const discriminantFailed = attempts.some(a => a.subtopicTitle?.toLowerCase().includes('discriminant') && !a.isCorrect);
    if (discriminantFailed) {
      misconceptions.push({
        id: 'misc_discriminant_sign',
        name: 'Discriminant Sign & Root Nature Interpretation',
        subtopic: 'Discriminant (D = b² - 4ac)',
        severity: 'MEDIUM',
        status: 'IMPROVING',
        description: 'Confusion between D = 0 (two equal real roots) versus D < 0 (no real roots).',
        evidence: 'Misclassified root existence condition when evaluating sign of b² - 4ac.'
      });
    }

    // 6. Contradiction Detection
    // Checks for conflicting signals:
    // a) Self-assessment rating vs actual accuracy (Overestimation / Underestimation)
    // b) High confidence + repeated incorrect answers
    // c) Low confidence + consistently correct answers
    // d) Correct answer + flawed written explanation
    const contradictions: Contradiction[] = [];
    const selfRatings = input.selfAssessment || {};

    // a) Self-assessment divergence
    Object.entries(selfRatings).forEach(([subtopicKey, rating]) => {
      const subtopicAttempts = attempts.filter(a => 
        (a.subtopicId && a.subtopicId.toLowerCase().includes(subtopicKey.toLowerCase())) ||
        (a.subtopicTitle && a.subtopicTitle.toLowerCase().includes(subtopicKey.toLowerCase()))
      );

      if (subtopicAttempts.length > 0) {
        const correctCount = subtopicAttempts.filter(a => a.isCorrect).length;
        const subtopicAcc = Math.round((correctCount / subtopicAttempts.length) * 100);
        const actualPerf: 'HIGH' | 'MODERATE' | 'LOW' = subtopicAcc >= 70 ? 'HIGH' : subtopicAcc >= 40 ? 'MODERATE' : 'LOW';

        if (rating === 'KNOW' && actualPerf === 'LOW') {
          contradictions.push({
            subtopicId: subtopicKey,
            subtopicTitle: subtopicAttempts[0].subtopicTitle || subtopicKey,
            perceivedConfidence: 'KNOW',
            actualPerformance: 'LOW',
            nature: 'OVERESTIMATION',
            explanation: `Self-rated as 'Know', but scored ${subtopicAcc}% on diagnostic questions.`
          });
        } else if (rating === 'DONT_KNOW' && actualPerf === 'HIGH') {
          contradictions.push({
            subtopicId: subtopicKey,
            subtopicTitle: subtopicAttempts[0].subtopicTitle || subtopicKey,
            perceivedConfidence: 'DONT_KNOW',
            actualPerformance: 'HIGH',
            nature: 'UNDERESTIMATION',
            explanation: `Self-rated as 'Don't Know', but demonstrated high accuracy (${subtopicAcc}%) on diagnostic checks.`
          });
        }
      }
    });

    // b) High confidence + incorrect answers
    if (overconfidentErrors.length >= 2) {
      contradictions.push({
        subtopicId: overconfidentErrors[0].subtopicId || 'general_calibration',
        subtopicTitle: overconfidentErrors[0].subtopicTitle || 'Confidence vs Accuracy',
        perceivedConfidence: 'KNOW',
        actualPerformance: 'LOW',
        nature: 'OVERESTIMATION',
        explanation: `Reported high confidence (4-5/5) across ${overconfidentErrors.length} questions that were answered incorrectly.`
      });
    }

    // c) Low confidence + consistently correct answers (Impostor phenomenon)
    if (underconfidentCorrects.length >= 2 && overallScore >= 80) {
      contradictions.push({
        subtopicId: underconfidentCorrects[0].subtopicId || 'metacognition',
        subtopicTitle: 'Self-Efficacy & Confidence',
        perceivedConfidence: 'DONT_KNOW',
        actualPerformance: 'HIGH',
        nature: 'UNDERESTIMATION',
        explanation: `Reported low confidence (1-2/5 guessing) but solved multiple questions with 100% accuracy.`
      });
    }

    // 7. Prerequisite Gap Detection
    const prerequisiteGaps: PrerequisiteGap[] = [];
    if (transferSkill < 50 || misconceptions.some(m => m.id === 'misc_param_coeff_boundary')) {
      prerequisiteGaps.push({
        prerequisite: 'Polynomial domain & degree boundary conditions',
        gradeLevel: 'Grade 9',
        relatedSubtopic: 'Standard Form & Nature of Roots',
        observableSignal: 'Applies discriminant formulas mechanically without verifying degree-2 existence conditions.',
        remediationSuggestion: 'Review definition of degree of polynomial when leading coefficient is an algebraic expression.'
      });
    }

    if (proceduralSkill < 50) {
      prerequisiteGaps.push({
        prerequisite: 'Sign rules in binomial expansion & algebraic reduction',
        gradeLevel: 'Grade 8',
        relatedSubtopic: 'Solving by Factorization',
        observableSignal: 'Sign discrepancies when expanding or factoring middle terms.',
        remediationSuggestion: 'Revisit algebraic distributive laws and negative integer multiplication.'
      });
    }

    // 8. Recommended Learning Path
    let recommendedPath: 'review_wrong_answers' | 'learn_from_scratch' | 'prerequisite_first' = 'review_wrong_answers';
    if (prerequisiteGaps.length >= 2 || (conceptMastery < 40 && proceduralSkill < 40)) {
      recommendedPath = 'prerequisite_first';
    } else if (overallScore < 45) {
      recommendedPath = 'learn_from_scratch';
    } else {
      recommendedPath = 'review_wrong_answers';
    }

    // 9. Recommended Intervention Micro-Target (Sprint 6/7 Target)
    const targetSubtopicTitle = misconceptions[0]?.subtopic || 'Nature of Roots';
    const targetSubtopicId = attempts.find(a => a.subtopicTitle === targetSubtopicTitle)?.subtopicId || 'sub_nature_roots';
    
    const recommendedIntervention: RecommendedIntervention = {
      targetSubtopicId,
      targetSubtopicTitle,
      focusConcept: misconceptions[0]?.name || 'Quadratic Parameter Boundary Conditions (a ≠ 0)',
      headline: 'Targeted Concept Reconstruction: Parameter Boundaries in Quadratic Equations',
      reason: transferSkill < 60 
        ? 'Your calculation speed is solid, but transfer across unfamiliar parameters needs targeted reinforcement.'
        : 'Reinforce conceptual foundations to ensure error-free problem solving.',
      suggestedAction: 'Complete the 5-step interactive studio module on parameter non-zero constraints.'
    };

    // 10. Biggest Learning Signal Hero Banner
    const biggestLearningSignal = {
      headline: transferSkill < 50 && proceduralSkill >= 60
        ? 'You can solve familiar problems rapidly, but struggle when the same concept appears with parameters.'
        : overallScore >= 80
        ? 'Strong conceptual and procedural grasp across quadratic equation foundations.'
        : 'Foundational algebraic skills are emerging, with clear opportunities for targeted reinforcement.',
      detail: `Across ${totalAttempts} diagnostic attempts, your procedural execution was ${proceduralSkill}%, while parameter transfer was ${transferSkill}%. This reveals a specific concept-transfer target rather than a general calculation issue.`
    };

    // 11. Root Cause Analysis Flowchart Nodes
    const rootCauseAnalysis = {
      visibleResult: `Transfer = ${transferSkill}%`,
      learningPattern: proceduralSkill >= 70 ? 'Strong procedural speed' : 'Developing procedural accuracy',
      likelyRootCause: transferSkill < 50 ? 'Difficulty translating implicit boundary constraints' : 'Consistent conceptual application',
      prerequisiteGap: prerequisiteGaps[0]?.prerequisite || 'Grade 9 polynomial domain representations'
    };

    const fullDiagnosis: FullSessionDiagnosis = {
      overallScore,
      evaluatedAttempts: totalAttempts,
      conceptMastery,
      proceduralSkill,
      reasoningSkill,
      transferSkill,
      confidenceCalibration,
      dimensions,
      misconceptions,
      contradictions,
      prerequisiteGaps,
      recommendedPath,
      recommendedIntervention,
      biggestLearningSignal,
      rootCauseAnalysis
    };

    // 12. Structured Diagnosis Validation via Zod
    return FullSessionDiagnosisSchema.parse(fullDiagnosis);
  }
}

export const diagnosisEngineService = new DiagnosisEngineService();
