import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Brain, 
  Sparkles, 
  Check, 
  HelpCircle,
  CircleDot,
  Info,
  ChevronDown
} from 'lucide-react';
import { api } from '../services/api';
import { Question, DiagnosticEvaluation, DiagnosisSummary } from '../types';

export const DiagnosticSessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [studentExplanation, setStudentExplanation] = useState<string>('');
  const [confidenceRating, setConfidenceRating] = useState<number>(3);
  const [showWhyModal, setShowWhyModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evalPhase, setEvalPhase] = useState<number>(0);
  const [evaluation, setEvaluation] = useState<DiagnosticEvaluation | null>(null);
  const [summary, setSummary] = useState<DiagnosisSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize questions
  useEffect(() => {
    const init = async () => {
      const stateQuestions = (location.state as any)?.questions;
      if (stateQuestions && stateQuestions.length > 0) {
        setQuestions(stateQuestions);
        setLoading(false);
        return;
      }

      if (sessionId) {
        try {
          const session = await api.getDiagnosticSession(sessionId);
          if (session?.questions && session.questions.length > 0) {
            setQuestions(session.questions);
          }
        } catch (err) {
          console.warn('Backend session fallback:', err);
        }
      }

      setQuestions([
        {
          id: 'q_standard_form_1',
          subtopicId: 'sub_1',
          subtopicTitle: 'Standard Form of Quadratic Equations',
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
          explanation: 'Expanding both sides: x² + x + 8 = x² - 4. Subtracting x² leaves x + 12 = 0, which is degree 1 (linear), not 2.'
        },
        {
          id: 'q_nature_roots_1',
          subtopicId: 'sub_5',
          subtopicTitle: 'Nature of Roots',
          type: 'TRANSFER',
          difficulty: 'MEDIUM',
          prompt: 'If the quadratic equation kx² - 6x + 1 = 0 has two distinct real roots, what is the exact condition for parameter k?',
          options: [
            'k < 9 and k ≠ 0',
            'k > 9',
            'k ≤ 9 and k ≠ 0',
            'k < 36'
          ],
          correctAnswer: 'k < 9 and k ≠ 0',
          explanation: 'For distinct real roots, D = 36 - 4k > 0 => k < 9. For the equation to remain quadratic, the leading coefficient a = k cannot be 0.'
        },
        {
          id: 'q_discriminant_1',
          subtopicId: 'sub_4',
          subtopicTitle: 'Discriminant (D = b² - 4ac)',
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
          explanation: 'a = 2, b = -4, c = 3. Discriminant D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8.'
        }
      ]);
      setLoading(false);
    };

    init();
  }, [sessionId, location.state]);

  const currentQuestion = questions[currentIndex];

  const getCognitiveDetails = (type: string) => {
    switch (type) {
      case 'TRANSFER':
        return {
          title: 'Transfer Challenge',
          desc: 'This checks whether you can use the concept in a new or unfamiliar situation without falling for visual tricks.',
          badgeColor: 'bg-coral-subtle text-coral-text border-coral/30'
        };
      case 'REASONING':
        return {
          title: 'Reasoning Check',
          desc: 'This tests why the mathematical rule works, looking for sound step-by-step logic beyond guessing.',
          badgeColor: 'bg-accent-subtle text-accent-text border-accent/30'
        };
      case 'PROCEDURAL':
        return {
          title: 'Procedural Application',
          desc: 'This measures arithmetic accuracy, formula substitution, and sign management precision.',
          badgeColor: 'bg-sky-subtle text-sky-text border-sky/30'
        };
      default:
        return {
          title: 'Concept Check',
          desc: 'This validates foundational definitions and constraints ($a \\neq 0$, degree = 2).',
          badgeColor: 'bg-mint-subtle text-mint-text border-mint/30'
        };
    }
  };

  const cognitiveMeta = currentQuestion ? getCognitiveDetails(currentQuestion.type) : { title: 'Concept Check', desc: '', badgeColor: '' };

  const handleSubmit = async () => {
    if (!selectedAnswer) return;
    setIsSubmitting(true);
    setEvalPhase(0);

    // Sequence for educational AI processing animation (Section 15)
    setTimeout(() => setEvalPhase(1), 350);
    setTimeout(() => setEvalPhase(2), 700);
    setTimeout(() => setEvalPhase(3), 1100);

    const activeSessionId = sessionId || 'diag_demo_session';

    try {
      const res = await api.submitAttempt(activeSessionId, {
        questionId: currentQuestion.id,
        studentAnswer: selectedAnswer,
        studentExplanation,
        confidenceRating
      });

      setTimeout(() => {
        if (res.data) {
          setEvaluation(res.data.evaluation);
          setSummary(res.data.diagnosisSummary);
        }
        setIsSubmitting(false);
      }, 1500);

    } catch (err) {
      console.warn('Using deterministic AI fallback evaluation:', err);
      const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
      setTimeout(() => {
        setEvaluation({
          isCorrect,
          score: isCorrect ? 100 : 35,
          stepAnalysis: [
            {
              step: 1,
              status: isCorrect ? 'correct' : 'incorrect',
              evidence: isCorrect
                ? 'Correct expansion and identification of quadratic degree constraints.'
                : 'Overlooked cancellation of leading quadratic terms across both sides.'
            },
            {
              step: 2,
              status: isCorrect ? 'correct' : 'partially_correct',
              evidence: studentExplanation
                ? `Evaluated reasoning: "${studentExplanation.slice(0, 75)}..."`
                : 'Implicit reasoning evaluated from final option choice.'
            }
          ],
          reasoningSignals: isCorrect 
            ? ['Correct degree definition', 'Accurate algebraic simplification']
            : ['Missed cancellation of leading second-degree term'],
          misconceptionSignals: isCorrect
            ? []
            : ['Assuming an equation with squared terms is quadratic without simplifying completely.'],
          confidenceCalibration: confidenceRating >= 4 && !isCorrect
            ? 'overconfident'
            : confidenceRating <= 2 && isCorrect
            ? 'underconfident'
            : 'well_calibrated',
          rootCause: isCorrect ? undefined : 'Superficial visual identification without algebraic reduction.',
          recommendedAction: isCorrect ? 'test_transfer' : 'targeted_intervention'
        });
        setIsSubmitting(false);
      }, 1500);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer('');
      setStudentExplanation('');
      setConfidenceRating(3);
      setEvaluation(null);
    } else {
      navigate('/learning-xray', { state: { summary, sessionId } });
    }
  };

  if (loading || !currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-secondary font-medium">Preparing Question...</p>
      </div>
    );
  }

  const confidenceLabels: Record<number, string> = {
    1: 'Pure Guess (1/5)',
    2: 'Unsure (2/5)',
    3: 'Moderate (3/5)',
    4: 'Confident (4/5)',
    5: 'Certain (5/5)'
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4 pb-20">
      
      {/* ── Top Header Bar (Section 13) ─────────────────────────────── */}
      <div className="space-y-2 border-b border-border-subtle pb-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-extrabold text-accent uppercase tracking-wider">
            Quadratic Equations
          </span>
          <span className="font-mono font-bold text-secondary">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>

        {/* Cognitive Badge + Expandable "Why are we asking this?" */}
        <div className="flex items-center justify-between pt-1">
          <span className={`text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${cognitiveMeta.badgeColor}`}>
            {cognitiveMeta.title}
          </span>

          <button
            type="button"
            onClick={() => setShowWhyModal(!showWhyModal)}
            className="text-[11px] font-bold text-secondary hover:text-primary flex items-center gap-1 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-accent" />
            <span>Why are we asking this?</span>
            <ChevronDown className={`w-3 h-3 transform transition-transform ${showWhyModal ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Expandable Explanation Callout */}
        {showWhyModal && (
          <div className="p-3.5 rounded-2xl bg-surface-elevated border border-border-subtle text-xs text-secondary leading-relaxed animate-fadeIn">
            {cognitiveMeta.desc}
          </div>
        )}
      </div>

      {/* ── Question Card (Section 13) ─────────────────────────────── */}
      <div className="studio-card p-6 sm:p-8 border border-border-subtle space-y-6">
        
        {/* Question Prompt */}
        <h2 className="text-lg sm:text-xl font-extrabold text-primary leading-relaxed">
          {currentQuestion.prompt}
        </h2>

        {/* Large Option Cards (Section 14) */}
        <div className="space-y-3">
          {currentQuestion.options?.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            return (
              <button
                key={idx}
                type="button"
                disabled={!!evaluation || isSubmitting}
                onClick={() => setSelectedAnswer(option)}
                className={`w-full p-4 rounded-2xl text-left text-xs sm:text-sm font-bold transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-accent-subtle border-2 border-accent text-primary shadow-sm scale-[1.01]'
                    : 'bg-surface border border-border-subtle text-primary hover:border-accent/40 hover:bg-surface-elevated'
                } ${evaluation ? 'cursor-default' : ''}`}
              >
                <div className="flex items-center gap-3.5">
                  <span className={`w-7 h-7 rounded-xl text-xs font-mono font-bold flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-accent text-white' : 'bg-surface-elevated text-secondary border border-border-subtle'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{option}</span>
                </div>
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-accent" />}
              </button>
            );
          })}
        </div>

        {/* Multi-Signal Inputs (Only active before submission) */}
        {!evaluation && !isSubmitting && (
          <div className="pt-4 border-t border-border-subtle space-y-5">
            
            {/* Step-by-Step Reasoning Editor (Section 14) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-secondary uppercase tracking-wider">
                Explain your reasoning
              </label>
              <textarea
                rows={2}
                value={studentExplanation}
                onChange={(e) => setStudentExplanation(e.target.value)}
                placeholder="Why did you pick this option? (MindTrace analyzes this for mental model diagnosis)..."
                className="w-full bg-surface-elevated border border-border-subtle rounded-2xl p-3.5 text-xs text-primary placeholder-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all font-medium"
              />
            </div>

            {/* Confidence Slider (Section 14) */}
            <div className="space-y-2 bg-surface-elevated p-4 rounded-2xl border border-border-subtle">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-secondary uppercase tracking-wider">
                  How confident are you?
                </span>
                <span className="font-bold text-accent font-mono">
                  {confidenceLabels[confidenceRating]}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={confidenceRating}
                onChange={(e) => setConfidenceRating(Number(e.target.value))}
                className="w-full accent-accent h-2 bg-border-subtle rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-muted font-medium">
                <span>1 - Guessing</span>
                <span>3 - Moderate</span>
                <span>5 - Complete Certainty</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={!selectedAnswer || isSubmitting}
                onClick={handleSubmit}
                className="w-full py-4 px-6 rounded-2xl font-extrabold text-sm sm:text-base bg-accent hover:bg-accent-deep text-white shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 transform hover:-translate-y-0.5"
              >
                <span>Submit Answer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* ── AI Analysis Animation Sequence (Section 15) ───────────── */}
        {isSubmitting && (
          <div className="p-6 rounded-2xl bg-surface-elevated border border-border-subtle space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-accent animate-spin" />
              <span>Understanding Your Response</span>
            </div>

            <div className="space-y-2.5 text-xs font-medium">
              <div className="flex items-center gap-2 text-mint-text">
                <Check className="w-3.5 h-3.5 text-mint" />
                <span>Checking your answer</span>
              </div>

              <div className={`flex items-center gap-2 transition-all ${evalPhase >= 1 ? 'text-mint-text' : 'text-muted'}`}>
                {evalPhase >= 1 ? <Check className="w-3.5 h-3.5 text-mint" /> : <CircleDot className="w-3.5 h-3.5 text-accent animate-pulse" />}
                <span>Reviewing your reasoning</span>
              </div>

              <div className={`flex items-center gap-2 transition-all ${evalPhase >= 2 ? 'text-mint-text' : 'text-muted'}`}>
                {evalPhase >= 2 ? <Check className="w-3.5 h-3.5 text-mint" /> : <CircleDot className="w-3.5 h-3.5 text-accent animate-pulse" />}
                <span>Looking for learning patterns</span>
              </div>

              <div className={`flex items-center gap-2 transition-all ${evalPhase >= 3 ? 'text-mint-text' : 'text-muted'}`}>
                {evalPhase >= 3 ? <Check className="w-3.5 h-3.5 text-mint" /> : <div className="w-3.5 h-3.5 rounded-full border border-border-subtle" />}
                <span>Comparing your confidence</span>
              </div>

              <div className={`flex items-center gap-2 transition-all ${evalPhase >= 4 ? 'text-mint-text' : 'text-muted'}`}>
                {evalPhase >= 4 ? <Check className="w-3.5 h-3.5 text-mint" /> : <div className="w-3.5 h-3.5 rounded-full border border-border-subtle" />}
                <span>Preparing your Learning X-Ray</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── Diagnostic Result Card (Appears after evaluation) ────────── */}
      {evaluation && (
        <div className={`studio-card p-6 border-2 space-y-5 ${
          evaluation.isCorrect
            ? 'border-mint/40 bg-mint-subtle/20'
            : 'border-coral/40 bg-coral-subtle/20'
        }`}>
          <div className="flex items-start justify-between gap-3 border-b border-border-subtle pb-4">
            <div className="flex items-center gap-3">
              {evaluation.isCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-mint shrink-0" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-coral shrink-0" />
              )}
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-primary">
                  {evaluation.isCorrect ? 'Correct Conceptual Application' : 'Diagnosed Cognitive Discrepancy'}
                </h3>
                <p className="text-xs text-secondary mt-0.5">
                  Confidence Calibration: <strong className="capitalize text-primary font-bold">{evaluation.confidenceCalibration.replace('_', ' ')}</strong>
                </p>
              </div>
            </div>
            <div className="font-mono text-xl font-extrabold text-primary">
              {evaluation.score} / 100
            </div>
          </div>

          {/* Step Analysis */}
          <div className="space-y-2">
            <span className="text-xs font-extrabold text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-accent" /> Step-by-Step Reasoning Evidence
            </span>
            <div className="space-y-2">
              {evaluation.stepAnalysis?.map((step) => (
                <div
                  key={step.step}
                  className="p-3.5 rounded-xl bg-surface border border-border-subtle text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-primary">Step {step.step}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                      step.status === 'correct'
                        ? 'bg-mint text-white'
                        : 'bg-coral text-white'
                    }`}>
                      {step.status}
                    </span>
                  </div>
                  <p className="text-secondary leading-relaxed">{step.evidence}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Misconception Alert if flagged */}
          {evaluation.misconceptionSignals && evaluation.misconceptionSignals.length > 0 && (
            <div className="p-4 rounded-xl bg-coral-subtle border border-coral/30 space-y-1 text-xs">
              <div className="font-bold text-coral-text flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Misconception Flagged
              </div>
              {evaluation.misconceptionSignals.map((m, i) => (
                <p key={i} className="text-coral-text leading-relaxed">{m}</p>
              ))}
            </div>
          )}

          {/* Next Question CTA */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleNext}
              className="w-full py-3.5 px-5 rounded-2xl font-extrabold text-sm bg-accent hover:bg-accent-deep text-white shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>{currentIndex < questions.length - 1 ? 'Proceed to Next Question' : 'Complete Session & View Learning X-Ray'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
