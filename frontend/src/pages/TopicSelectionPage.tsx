import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  HelpCircle, 
  Circle, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Search, 
  BookOpen, 
  Compass, 
  CheckCircle2, 
  AlertCircle,
  RotateCcw,
  Target,
  Brain,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Topic, 
  Subtopic, 
  SubtopicConfidence, 
  LearningGoal, 
  LearningMode,
  LearningSetup 
} from '../types';
import { SelectableCard } from '../components/common/SelectableCard';
import { PrimaryButton } from '../components/common/PrimaryButton';

export const TopicSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Active student identity derived from authenticated session
  const userId = user?.id || localStorage.getItem('mindtrace_user_id') || 'me';
  const userName = user?.name ? user.name.split(' ')[0] : (localStorage.getItem('mindtrace_user_name') || 'Student');

  // Step index: 1 = Academic Context, 2 = Subject, 3 = Topic, 4 = Goal, 5 = Confidence, 6 = Subtopics, 7 = Starting Point & Mode
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Core setup state
  const [classGrade, setClassGrade] = useState<string>(() => user?.grade ? String(user.grade) : '10');
  const [board, setBoard] = useState<string>(() => user?.board || 'CBSE');
  const [subject, setSubject] = useState<string>('Mathematics');
  const [topic, setTopic] = useState<Topic | null>(null);
  const [subtopicsList, setSubtopicsList] = useState<Subtopic[]>([]);
  const [learningGoal, setLearningGoal] = useState<LearningGoal>('Preparing for a test');
  const [overallConfidence, setOverallConfidence] = useState<number>(4);
  const [subtopicRatings, setSubtopicRatings] = useState<Record<string, SubtopicConfidence>>({});
  const [selectedMode, setSelectedMode] = useState<LearningMode>('TEST');

  // Persistence and UI status
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [savedContextId, setSavedContextId] = useState<string | null>(null);
  const [savedAssessmentId, setSavedAssessmentId] = useState<string | null>(null);

  // Confidence scale configuration
  const confidenceLevels = [
    { level: 1, label: "I don't know this yet", emoji: "😕", desc: "Starting completely fresh with this topic" },
    { level: 2, label: "I know a little", emoji: "😐", desc: "I recall some formulas or concepts vaguely" },
    { level: 3, label: "I know the basics", emoji: "🙂", desc: "I can solve standard, familiar textbook problems" },
    { level: 4, label: "I am comfortable", emoji: "😊", desc: "I understand factoring, formulas, and can handle variations" },
    { level: 5, label: "I am very confident", emoji: "😎", desc: "I feel very confident across all subtopics and word problems" }
  ];

  // Options configuration
  const classOptions = [
    { value: '8', label: '8', sub: 'Class 8' },
    { value: '9', label: '9', sub: 'Class 9' },
    { value: '10', label: '10', sub: 'Class 10' },
    { value: '11', label: '11', sub: 'Class 11' },
    { value: '12', label: '12', sub: 'Class 12' },
    { value: 'College / Other', label: 'Other', sub: 'College / Adult' },
  ];
  const boardOptions = [
    { value: 'CBSE', label: 'CBSE', sub: 'Central Board' },
    { value: 'ICSE', label: 'ICSE', sub: 'Indian Certificate' },
    { value: 'State Board', label: 'State', sub: 'State Syllabus' },
    { value: 'Other', label: 'Other', sub: 'International' },
  ];
  const subjectOptions = [
    { name: 'Mathematics', desc: 'Active MVP Domain • 7 CBSE Units', active: true },
    { name: 'Physics', desc: 'Mechanics, Electromagnetism', active: false },
    { name: 'Chemistry', desc: 'Organic, Inorganic, Physical', active: false },
    { name: 'Biology', desc: 'Genetics, Physiology', active: false },
    { name: 'Computer Science', desc: 'Algorithms, Data Structures', active: false },
    { name: 'English', desc: 'Grammar, Literature Analysis', active: false }
  ];
  const goalOptions: LearningGoal[] = [
    'Preparing for a test',
    'Homework',
    'Strengthen weak concepts',
    'Learn the topic',
    'General practice',
    'Other'
  ];

  // Load subtopics from backend and restore active context
  useEffect(() => {
    const initializeFromBackend = async () => {
      setLoading(true);
      setErrorMessage(null);

      try {
        // 1. Fetch available topic & subtopics directly from backend API
        const topicData = await api.getTopic('quadratic-equations');
        setTopic(topicData);

        const subtopics = await api.getSubtopics(topicData.id || 'quadratic-equations');
        setSubtopicsList(subtopics);

        // 2. Try to restore persisted student context from backend for authenticated user
        try {
          const activeContextRes = await api.getActiveLearningContext('me');
          if (activeContextRes && activeContextRes.data) {
            const ctx = activeContextRes.data;
            setSavedContextId(ctx.id);
            if (ctx.classGrade) setClassGrade(ctx.classGrade);
            if (ctx.board) setBoard(ctx.board);
            if (ctx.subject) setSubject(ctx.subject);
            if (ctx.learningGoal) setLearningGoal(ctx.learningGoal as LearningGoal);

            // Hydrate self-assessment if present
            if (ctx.selfAssessments && ctx.selfAssessments.length > 0) {
              const sa = ctx.selfAssessments[0];
              setSavedAssessmentId(sa.id);
              if (sa.overallConfidence) setOverallConfidence(sa.overallConfidence);
              if (sa.selectedMode) setSelectedMode(sa.selectedMode);

              // Hydrate subtopic ratings
              if (Array.isArray(sa.subtopicRatings) && sa.subtopicRatings.length > 0) {
                const ratingsMap: Record<string, SubtopicConfidence> = {};
                sa.subtopicRatings.forEach((item: any) => {
                  ratingsMap[item.subtopicId] = item.rating as SubtopicConfidence;
                });
                setSubtopicRatings(ratingsMap);
              }
            }
          }
        } catch (ctxErr) {
          // No active context found yet, continue with fresh state
          console.info('Starting fresh or unpersisted context:', ctxErr);
        }
      } catch (err: any) {
        console.error('Failed to load topic from backend:', err);
        setErrorMessage('Could not connect to backend to fetch curriculum. Please verify server is active.');
      } finally {
        setLoading(false);
      }
    };

    initializeFromBackend();
  }, []);

  // Set subtopic rating handler
  const handleRatingSelect = (subtopicId: string, rating: SubtopicConfidence) => {
    setSubtopicRatings(prev => ({
      ...prev,
      [subtopicId]: rating
    }));
    setValidationError(null);
  };

  // Step progression validation & handler
  const handleNextStep = async () => {
    setValidationError(null);

    // Step 6 Validation: All subtopics must be rated
    if (currentStep === 6) {
      const unrated = subtopicsList.filter(s => !subtopicRatings[s.id]);
      if (unrated.length > 0) {
        setValidationError(`Choose how familiar you are with each subtopic before continuing (${unrated.length} remaining).`);
        return;
      }
    }

    // Auto-save context progressively to backend so state is immediately resilient
    if (currentStep >= 4) {
      try {
        const ctxRes = await api.saveLearningContext({
          userId,
          classGrade,
          board,
          subject,
          topicId: topic?.id || 'topic_quadratic_equations',
          learningGoal,
          active: true
        });
        if (ctxRes && ctxRes.data) {
          setSavedContextId(ctxRes.data.id);
        }
      } catch (err) {
        console.warn('Progressive save warning (will retry on mode selection):', err);
      }
    }

    setCurrentStep(prev => Math.min(prev + 1, 7));
  };

  const handlePrevStep = () => {
    setValidationError(null);
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Final confirmation and handoff execution
  const handleFinalModeSelection = async (mode: LearningMode) => {
    setIsSaving(true);
    setErrorMessage(null);
    setSelectedMode(mode);

    try {
      // 1. Persist/ensure learning context is saved in PostgreSQL
      const contextRes = await api.saveLearningContext({
        userId,
        classGrade,
        board,
        subject,
        topicId: topic?.id || 'topic_quadratic_equations',
        learningGoal,
        active: true
      });

      const contextId = contextRes.data?.id || savedContextId || `ctx_${Date.now()}`;
      setSavedContextId(contextId);

      // 2. Persist SelfAssessment and SubtopicSelfAssessment rows (Strictly distinct from AI diagnosis)
      const assessmentRes = await api.saveSelfAssessment({
        userId,
        learningContextId: contextId,
        overallConfidence,
        selectedMode: mode,
        subtopicRatings
      });

      if (assessmentRes.data?.id) {
        setSavedAssessmentId(assessmentRes.data.id);
      }

      // 3. Execute appropriate handoff
      if (mode === 'TEST') {
        // Handoff to Diagnostic Session (Sprint 1 foundation, passes full context)
        const sessionResult = await api.createDiagnosticSession({
          userId,
          topicSlug: 'quadratic-equations',
          mode: 'TEST_WHAT_I_KNOW',
          selfAssessment: subtopicRatings
        });

        const sessionId = sessionResult.session.id;
        localStorage.setItem('mindtrace_active_session_id', sessionId);
        navigate(`/diagnostic/${sessionId}`, {
          state: {
            mode: 'TEST_WHAT_I_KNOW',
            learningContext: {
              classGrade,
              board,
              subject,
              learningGoal
            },
            selfAssessment: {
              overallConfidence,
              subtopicRatings
            },
            questions: sessionResult.questions
          }
        });
      } else {
        // Handoff to Learn From Scratch placeholder (Section 24)
        navigate('/learn/from-scratch', {
          state: {
            learningContext: { classGrade, board, subject, learningGoal },
            overallConfidence,
            subtopicRatings
          }
        });
      }
    } catch (err: any) {
      console.error('Error saving learning setup:', err);
      setErrorMessage("We couldn't save your learning setup. Please retry.");
    } finally {
      setIsSaving(false);
    }
  };

  // Subtopic counts
  const totalSubtopics = subtopicsList.length;
  const assessedCount = Object.keys(subtopicRatings).length;
  const strongestSubtopics = subtopicsList.filter(s => subtopicRatings[s.id] === 'KNOW');
  const partialSubtopics = subtopicsList.filter(s => subtopicRatings[s.id] === 'PARTIAL');
  const needHelpSubtopics = subtopicsList.filter(s => subtopicRatings[s.id] === 'DONT_KNOW');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 space-y-4">
        <div className="w-10 h-10 border-3 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-secondary font-bold">Loading your learning studio...</p>
      </div>
    );
  }

  // Progress steps metadata
  const stepsMetadata = [
    { num: '01', title: 'Context' },
    { num: '02', title: 'Subject' },
    { num: '03', title: 'Topic' },
    { num: '04', title: 'Goal' },
    { num: '05', title: 'Confidence' },
    { num: '06', title: 'Subtopics' },
    { num: '07', title: 'Mode' }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6 pb-24">

      {/* ── Guided Progress Bar (Section 21) ─────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-accent-subtle text-accent-text border border-accent/20">
              Sprint 2 Studio
            </span>
            <span className="text-secondary font-semibold">
              Step {currentStep} of 7: <strong className="text-primary font-bold">{stepsMetadata[currentStep - 1]?.title}</strong>
            </span>
          </div>
          <span className="text-[11px] font-mono font-extrabold text-accent">
            {Math.round((currentStep / 7) * 100)}% Completed
          </span>
        </div>

        {/* Step dots / indicator bar */}
        <div className="grid grid-cols-7 gap-1.5">
          {stepsMetadata.map((st, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;
            return (
              <div
                key={st.num}
                className={`h-2 rounded-full transition-all duration-300 ${
                  isCurrent
                    ? 'bg-accent shadow-sm'
                    : isCompleted
                    ? 'bg-mint'
                    : 'bg-border-subtle'
                }`}
                title={`Step ${stepNum}: ${st.title}`}
              />
            );
          })}
        </div>
      </div>

      {/* ── Error Banner UX (Section 28) ────────────────────────────── */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-coral-subtle/40 border border-coral/30 flex items-center justify-between text-xs sm:text-sm text-coral-text font-bold animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-coral shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleFinalModeSelection(selectedMode)}
              className="px-3 py-1.5 rounded-xl bg-coral text-white font-extrabold text-xs shadow-sm hover:opacity-90"
            >
              Retry
            </button>
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-3 py-1.5 rounded-xl bg-surface border border-coral/30 text-coral-text font-bold text-xs"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 1: Academic Context (Class & Board) ─────────────────── */}
      {currentStep === 1 && (
        <div className="studio-card p-6 sm:p-10 border border-border-subtle space-y-8 animate-fadeIn">
          <div className="space-y-2 text-center">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent">
              Welcome back, {userName} 👋
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
              Where are you right now?
            </h1>
            <p className="text-xs sm:text-sm text-secondary max-w-md mx-auto">
              Tell us your current class and curriculum board so we can tailor every diagnostic question.
            </p>
          </div>

          {/* Class Selection Chips/Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-extrabold text-secondary uppercase tracking-wider">
                Which class are you in?
              </label>
              <span className="text-[11px] text-muted">Tailors diagnostic questions</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {classOptions.map((opt) => (
                <SelectableCard
                  key={opt.value}
                  label={opt.label}
                  sublabel={opt.sub}
                  isSelected={classGrade === opt.value}
                  onClick={() => setClassGrade(opt.value)}
                  size="sm"
                  className="text-center items-center justify-center py-2.5"
                />
              ))}
            </div>
          </div>

          {/* Board Selection */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-extrabold text-secondary uppercase tracking-wider">
              Which curriculum board do you follow?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {boardOptions.map((b) => (
                <SelectableCard
                  key={b.value}
                  label={b.label}
                  sublabel={b.sub}
                  isSelected={board === b.value}
                  onClick={() => setBoard(b.value)}
                  size="md"
                />
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="pt-4 flex items-center justify-end">
            <PrimaryButton
              label="Continue"
              onClick={handleNextStep}
              className="w-auto px-8 py-3.5 text-sm"
            />
          </div>
        </div>
      )}

      {/* ── STEP 2: Subject ──────────────────────────────────────────── */}
      {currentStep === 2 && (
        <div className="studio-card p-6 sm:p-10 border border-border-subtle space-y-8 animate-fadeIn">
          <div className="space-y-2 text-center">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent">
              Academic Domain
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
              Which subject are you studying?
            </h1>
            <p className="text-xs sm:text-sm text-secondary max-w-md mx-auto">
              Mathematics is currently the active domain with complete diagnostic intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {subjectOptions.map((subj) => {
              const isSelected = subject === subj.name;
              return (
                <button
                  key={subj.name}
                  type="button"
                  onClick={() => setSubject(subj.name)}
                  className={`p-5 rounded-2xl text-left border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-accent-subtle/50 border-2 border-accent text-accent-text shadow-sm'
                      : 'bg-surface-elevated border-border-subtle text-secondary hover:border-border-hover'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="text-base font-extrabold text-primary flex items-center gap-2">
                      <span>{subj.name}</span>
                      {subj.active && (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-mint text-white">
                          Live MVP
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-secondary">{subj.desc}</p>
                  </div>
                  {isSelected && (
                    <div className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="pt-4 flex items-center justify-between border-t border-border-subtle">
            <button
              type="button"
              onClick={handlePrevStep}
              className="py-3 px-5 rounded-2xl font-bold text-xs text-secondary hover:text-primary transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              className="py-3.5 px-7 rounded-2xl font-extrabold text-sm bg-accent hover:bg-accent-deep text-white shadow-sm transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Current Topic (Fetched from Backend) ─────────────── */}
      {currentStep === 3 && (
        <div className="studio-card p-6 sm:p-10 border border-border-subtle space-y-8 animate-fadeIn">
          <div className="space-y-2 text-center">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent">
              Curriculum Calibration
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
              What are you learning right now?
            </h1>
            <p className="text-xs sm:text-sm text-secondary max-w-md mx-auto">
              Dynamic topic loaded from backend database.
            </p>
          </div>

          {/* Selected Topic Visual Card */}
          <div className="studio-card p-6 border-2 border-accent/40 bg-gradient-to-b from-surface to-accent-subtle/30 space-y-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent">
                  Class {classGrade} • {board} • {subject}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-primary">
                  {topic?.name || 'Quadratic Equations'}
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-mint text-white">
                Full Diagnostic Ready
              </span>
            </div>

            <p className="text-xs sm:text-sm text-secondary leading-relaxed">
              {topic?.description || 'Second-degree equations, factoring, quadratic formula, discriminant, and parabolic modeling.'}
            </p>

            <div className="p-4 rounded-2xl bg-surface border border-border-subtle flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-bold text-primary">
                <BookOpen className="w-4 h-4 text-accent" />
                <span>{subtopicsList.length} Seeded Subtopics</span>
              </div>
              <span className="text-muted font-mono">Curriculum ID: {topic?.slug || 'quadratic-equations'}</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="pt-4 flex items-center justify-between border-t border-border-subtle">
            <button
              type="button"
              onClick={handlePrevStep}
              className="py-3 px-5 rounded-2xl font-bold text-xs text-secondary hover:text-primary transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              className="py-3.5 px-7 rounded-2xl font-extrabold text-sm bg-accent hover:bg-accent-deep text-white shadow-sm transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <span>Continue to Goal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4: Learning Goal ────────────────────────────────────── */}
      {currentStep === 4 && (
        <div className="studio-card p-6 sm:p-10 border border-border-subtle space-y-8 animate-fadeIn">
          <div className="space-y-2 text-center">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent">
              Intent Calibration
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
              Why are you learning this?
            </h1>
            <p className="text-xs sm:text-sm text-secondary max-w-md mx-auto">
              Your learning intent will directly shape the diagnostic depth and intervention strategy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {goalOptions.map((goal) => {
              const isSelected = learningGoal === goal;
              return (
                <button
                  key={goal}
                  type="button"
                  onClick={() => setLearningGoal(goal)}
                  className={`p-4 sm:p-5 rounded-2xl text-left border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-accent-subtle/50 border-2 border-accent text-accent-text shadow-sm scale-[1.01]'
                      : 'bg-surface-elevated border-border-subtle text-secondary hover:border-border-hover'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-sm font-extrabold text-primary">{goal}</span>
                    <p className="text-[11px] text-secondary">
                      {goal === 'Preparing for a test' && 'Rigorous exam-focused question set'}
                      {goal === 'Homework' && 'Specific concept clarity and problem support'}
                      {goal === 'Strengthen weak concepts' && 'Misconception isolation and repair'}
                      {goal === 'Learn the topic' && 'Comprehensive step-by-step foundation'}
                      {goal === 'General practice' && 'Balanced procedural and reasoning mix'}
                      {goal === 'Other' && 'Custom diagnostic evaluation'}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="pt-4 flex items-center justify-between border-t border-border-subtle">
            <button
              type="button"
              onClick={handlePrevStep}
              className="py-3 px-5 rounded-2xl font-bold text-xs text-secondary hover:text-primary transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              className="py-3.5 px-7 rounded-2xl font-extrabold text-sm bg-accent hover:bg-accent-deep text-white shadow-sm transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <span>Continue to Confidence</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 5: Overall Self-Assessment (1-5 Interactive Slider) ─── */}
      {currentStep === 5 && (
        <div className="studio-card p-6 sm:p-10 border border-border-subtle space-y-8 animate-fadeIn text-center">
          <div className="space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent">
              Self-Perception Calibration
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
              How much do you think you know?
            </h1>
            <p className="text-xs sm:text-sm text-secondary max-w-md mx-auto leading-relaxed">
              Rate your overall confidence in Quadratic Equations on a 1–5 scale.
            </p>
          </div>

          {/* Large Emoji & Interactive Feedback Display */}
          <div className="max-w-lg mx-auto space-y-6 pt-2">
            <div className="p-7 rounded-3xl bg-surface-elevated border border-border-subtle shadow-sm flex flex-col items-center justify-center space-y-3">
              <span className="text-6xl select-none transition-transform duration-200 transform hover:scale-110">
                {confidenceLevels[overallConfidence - 1]?.emoji}
              </span>
              <div className="space-y-1">
                <div className="text-xl font-extrabold text-primary">
                  {overallConfidence} / 5 — "{confidenceLevels[overallConfidence - 1]?.label}"
                </div>
                <p className="text-xs text-secondary italic max-w-sm leading-relaxed">
                  {confidenceLevels[overallConfidence - 1]?.desc}
                </p>
              </div>

              {/* Progress track representation */}
              <div className="w-full pt-2 px-2">
                <div className="h-2 w-full bg-surface rounded-full overflow-hidden border border-border-subtle">
                  <div
                    className="h-full bg-gradient-to-r from-accent to-pink transition-all duration-300 rounded-full"
                    style={{ width: `${(overallConfidence / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Interactive Confidence Cards */}
            <div className="grid grid-cols-5 gap-2">
              {confidenceLevels.map((lvl) => {
                const isSelected = overallConfidence === lvl.level;
                return (
                  <button
                    key={lvl.level}
                    type="button"
                    onClick={() => setOverallConfidence(lvl.level)}
                    className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all outline-none ${
                      isSelected
                        ? 'bg-accent-subtle border-2 border-accent text-accent-deep dark:text-accent shadow-sm scale-105 ring-2 ring-accent/20'
                        : 'bg-surface-elevated border border-border-subtle text-secondary hover:border-accent/40 hover:bg-surface'
                    }`}
                  >
                    <span className="text-2xl">{lvl.emoji}</span>
                    <span className={`text-xs font-extrabold ${isSelected ? 'text-accent-deep dark:text-white' : 'text-primary'}`}>
                      {lvl.level}
                    </span>
                    <span className="text-[10px] font-medium text-secondary truncate max-w-full hidden sm:inline">
                      {lvl.level === 1 ? 'Not yet' : lvl.level === 3 ? 'Basics' : lvl.level === 5 ? 'Confident' : `Lvl ${lvl.level}`}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Microcopy Callout */}
            <div className="p-4 rounded-2xl bg-surface border border-accent/20 text-xs text-secondary leading-relaxed shadow-xs">
              <span className="text-accent font-extrabold">💡 Note: </span>
              "Your self-assessment is what you THINK you know. We'll test it later."
            </div>
          </div>

          {/* Navigation */}
          <div className="pt-4 flex items-center justify-between border-t border-border-subtle">
            <button
              type="button"
              onClick={handlePrevStep}
              className="py-3 px-5 rounded-2xl font-bold text-xs text-secondary hover:text-primary transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              className="py-3.5 px-7 rounded-2xl font-extrabold text-sm bg-accent hover:bg-accent-deep text-white shadow-sm transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <span>Continue to Subtopics</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 6: Subtopic Self-Assessment (7 Units) ────────────────── */}
      {currentStep === 6 && (
        <div className="studio-card p-6 sm:p-10 border border-border-subtle space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent">
                Curriculum Granularity
              </span>
              <h1 className="text-2xl font-extrabold text-primary tracking-tight">
                Which parts do you know?
              </h1>
              <p className="text-xs text-secondary">
                Select your familiarity for each subtopic. All 7 must be rated before proceeding.
              </p>
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-surface-elevated border border-border-subtle text-xs font-bold text-primary flex items-center gap-2 shrink-0">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <span>{assessedCount} of {totalSubtopics} subtopics assessed</span>
            </div>
          </div>

          {/* Validation UX (Section 27) */}
          {validationError && (
            <div className="p-3.5 rounded-2xl bg-coral-subtle/50 border border-coral/40 text-xs text-coral-text font-bold flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Subtopic Interactive Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {subtopicsList.map((sub, idx) => {
              const currentRating = subtopicRatings[sub.id];
              const isRated = Boolean(currentRating);

              return (
                <div
                  key={sub.id}
                  className={`studio-card p-4 border transition-all flex flex-col justify-between space-y-3 ${
                    currentRating === 'KNOW'
                      ? 'bg-mint-subtle/30 border-mint/50 shadow-sm'
                      : currentRating === 'PARTIAL'
                      ? 'bg-gold-subtle/30 border-gold/50 shadow-sm'
                      : currentRating === 'DONT_KNOW'
                      ? 'bg-coral-subtle/20 border-coral/40 shadow-sm'
                      : 'bg-surface border-border-subtle'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-muted uppercase">
                        0{idx + 1}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        currentRating === 'KNOW'
                          ? 'bg-mint text-white'
                          : currentRating === 'PARTIAL'
                          ? 'bg-gold text-white'
                          : currentRating === 'DONT_KNOW'
                          ? 'bg-coral text-white'
                          : 'bg-surface-elevated text-secondary border border-border-subtle'
                      }`}>
                        {currentRating === 'KNOW'
                          ? '✓ I know this'
                          : currentRating === 'PARTIAL'
                          ? '△ I know some'
                          : currentRating === 'DONT_KNOW'
                          ? '○ Need to learn'
                          : 'Not rated yet'}
                      </span>
                    </div>

                    <h3 className="text-sm font-extrabold text-primary">{sub.title}</h3>
                    {sub.description && (
                      <p className="text-xs text-secondary leading-snug">{sub.description}</p>
                    )}
                  </div>

                  {/* 3-State Controls (KNOW / PARTIAL / DONT_KNOW) */}
                  <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-border-subtle text-xs">
                    <button
                      type="button"
                      onClick={() => handleRatingSelect(sub.id, 'KNOW')}
                      className={`py-1.5 px-2 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-1 ${
                        currentRating === 'KNOW'
                          ? 'bg-mint text-white shadow-sm'
                          : 'bg-surface hover:bg-surface-elevated text-secondary border border-border-subtle'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Know</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRatingSelect(sub.id, 'PARTIAL')}
                      className={`py-1.5 px-2 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-1 ${
                        currentRating === 'PARTIAL'
                          ? 'bg-gold text-white shadow-sm'
                          : 'bg-surface hover:bg-surface-elevated text-secondary border border-border-subtle'
                      }`}
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Partial</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRatingSelect(sub.id, 'DONT_KNOW')}
                      className={`py-1.5 px-2 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-1 ${
                        currentRating === 'DONT_KNOW'
                          ? 'bg-coral text-white shadow-sm'
                          : 'bg-surface hover:bg-surface-elevated text-secondary border border-border-subtle'
                      }`}
                    >
                      <Circle className="w-3.5 h-3.5" />
                      <span>Learn</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="pt-4 flex items-center justify-between border-t border-border-subtle">
            <button
              type="button"
              onClick={handlePrevStep}
              className="py-3 px-5 rounded-2xl font-bold text-xs text-secondary hover:text-primary transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              className="py-3.5 px-7 rounded-2xl font-extrabold text-sm bg-accent hover:bg-accent-deep text-white shadow-sm transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <span>Review Starting Point</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 7: Starting Point Summary & Mode Selection ───────────── */}
      {currentStep === 7 && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* ── Section 12: Self-Assessment Summary Card ─────────────── */}
          <div className="studio-card p-6 sm:p-8 border border-border-subtle bg-surface space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent">
                  Snapshot
                </span>
                <h2 className="text-xl font-extrabold text-primary">
                  YOUR STARTING POINT
                </h2>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold text-muted uppercase">Overall Confidence</div>
                <div className="text-xl font-extrabold text-accent">{overallConfidence} / 5</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Feel Strongest In */}
              <div className="p-4 rounded-2xl bg-mint-subtle/30 border border-mint/30 space-y-2">
                <div className="font-extrabold text-mint-text uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-mint" />
                  <span>You feel strongest in ({strongestSubtopics.length}):</span>
                </div>
                {strongestSubtopics.length > 0 ? (
                  <ul className="space-y-1 pl-1 text-secondary font-medium">
                    {strongestSubtopics.map(s => (
                      <li key={s.id} className="flex items-center gap-1.5 text-primary">
                        <span className="text-mint font-bold">•</span> {s.title}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-secondary italic">No subtopics rated as fully known yet.</p>
                )}
              </div>

              {/* Want Help With */}
              <div className="p-4 rounded-2xl bg-coral-subtle/20 border border-coral/30 space-y-2">
                <div className="font-extrabold text-coral-text uppercase tracking-wider flex items-center gap-1.5">
                  <Circle className="w-4 h-4 text-coral" />
                  <span>You want help with ({needHelpSubtopics.length}):</span>
                </div>
                {needHelpSubtopics.length > 0 ? (
                  <ul className="space-y-1 pl-1 text-secondary font-medium">
                    {needHelpSubtopics.map(s => (
                      <li key={s.id} className="flex items-center gap-1.5 text-primary">
                        <span className="text-coral font-bold">•</span> {s.title}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-secondary italic">No subtopics flagged as critical gaps.</p>
                )}
              </div>
            </div>

            {/* Academic Context Badge */}
            <div className="flex flex-wrap gap-2 text-[11px] font-bold text-secondary pt-1">
              <span className="px-2.5 py-1 rounded-xl bg-surface-elevated border border-border-subtle">
                Class {classGrade}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-surface-elevated border border-border-subtle">
                {board}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-surface-elevated border border-border-subtle">
                {subject}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-surface-elevated border border-border-subtle">
                Goal: {learningGoal}
              </span>
            </div>
          </div>

          {/* ── Section 13: Mode Selection Decision Cards ─────────────── */}
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-extrabold text-primary tracking-tight">
                What would you like to do?
              </h2>
              <p className="text-xs sm:text-sm text-secondary">
                Choose how you want MindTrace to tailor your learning experience today.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              
              {/* Option 1: TEST WHAT I KNOW */}
              <div className="studio-card-interactive p-7 border-2 border-accent/40 bg-gradient-to-b from-surface to-accent-subtle/30 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-accent text-white flex items-center justify-center shadow-sm">
                    <Search className="w-6 h-6" />
                  </div>

                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent">
                      Diagnostic Evaluation
                    </span>
                    <h3 className="text-xl font-extrabold text-primary mt-0.5">
                      Find out what you REALLY understand
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-secondary leading-relaxed">
                    We'll test your knowledge and look at your reasoning, confidence, and ability to apply the concept across varied problems.
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['Reasoning', 'Transfer', 'Confidence', 'Concept understanding'].map(tag => (
                      <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface border border-accent/20 text-primary">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleFinalModeSelection('TEST')}
                  className="w-full py-4 px-5 rounded-2xl font-extrabold text-sm bg-accent hover:bg-accent-deep text-white shadow-sm transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {isSaving ? (
                    <span>Saving & Preparing Diagnosis...</span>
                  ) : (
                    <>
                      <span>Start Diagnosis →</span>
                    </>
                  )}
                </button>
              </div>

              {/* Option 2: LEARN FROM SCRATCH */}
              <div className="studio-card-interactive p-7 border border-border-subtle bg-surface flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-surface-elevated text-secondary flex items-center justify-center border border-border-subtle">
                    <Compass className="w-6 h-6" />
                  </div>

                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-secondary">
                      Foundation Studio
                    </span>
                    <h3 className="text-xl font-extrabold text-primary mt-0.5">
                      Build the concept from the ground up
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-secondary leading-relaxed">
                    Start with the fundamentals and build your understanding step by step with guided examples and practice.
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['Concept explanation', 'Examples', 'Guided practice'].map(tag => (
                      <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface-elevated border border-border-subtle text-secondary">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleFinalModeSelection('LEARN_FROM_SCRATCH')}
                  className="w-full py-4 px-5 rounded-2xl font-extrabold text-sm bg-surface hover:bg-surface-elevated text-primary border border-border-subtle transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <span>Saving Setup...</span>
                  ) : (
                    <>
                      <span>Start Learning →</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>

          {/* Navigation to go back */}
          <div className="pt-2 flex items-center justify-start">
            <button
              type="button"
              onClick={handlePrevStep}
              className="py-3 px-5 rounded-2xl font-bold text-xs text-secondary hover:text-primary transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Subtopic Self-Assessment</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
