import React, { useEffect, useState, useRef } from 'react';
import { useLocation, Link, useSearchParams } from 'react-router-dom';
import { 
  Brain, 
  Target, 
  Sparkles, 
  ArrowRight, 
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  ArrowDown,
  Layers,
  Flame,
  Check,
  RefreshCw,
  AlertCircle,
  Compass,
  GraduationCap,
  ShieldCheck
} from 'lucide-react';
import { FullSessionDiagnosis, RecommendedPath } from '../types';
import { ProgressRing } from '../components/common/ProgressRing';
import { api } from '../services/api';

export const LearningXRayPage: React.FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const sessionId = (location.state as any)?.sessionId || searchParams.get('sessionId');

  const defaultSummary: FullSessionDiagnosis = {
    overallScore: 67,
    evaluatedAttempts: 5,
    conceptMastery: 82,
    proceduralSkill: 88,
    reasoningSkill: 71,
    transferSkill: 43,
    confidenceCalibration: 29,
    dimensions: {
      conceptMastery: 82,
      conceptStatus: 'SOLID',
      proceduralSkill: 88,
      proceduralStatus: 'STABLE',
      reasoningSkill: 71,
      reasoningStatus: 'DEVELOPING',
      transferSkill: 43,
      transferStatus: 'LOW',
      confidenceCalibration: 29,
      calibrationStatus: 'overconfident'
    },
    misconceptions: [
      {
        id: 'misc_param_coeff_boundary',
        name: 'Concept Transfer (a ≠ 0 Constraint)',
        subtopic: 'Nature of Roots',
        severity: 'HIGH',
        status: 'ACTIVE_GAP',
        description: 'Treating leading coefficient as constant in parameter problems.',
        evidence: 'Omitted a ≠ 0 constraint when solving kx² - 6x + 1 = 0.'
      }
    ],
    contradictions: [
      {
        subtopicId: 'nature-of-roots',
        subtopicTitle: 'Nature of Roots',
        perceivedConfidence: 'KNOW',
        actualPerformance: 'LOW',
        nature: 'OVERESTIMATION',
        explanation: "Self-rated as 'Know', but struggled on parameter transfer questions."
      }
    ],
    prerequisiteGaps: [
      {
        prerequisite: 'Polynomial domain & degree boundary conditions',
        gradeLevel: 'Grade 9',
        relatedSubtopic: 'Nature of Roots',
        observableSignal: 'Overlooks leading coefficient constraints.',
        remediationSuggestion: 'Review definition of degree of polynomial when leading coefficient is an algebraic expression.'
      }
    ],
    recommendedPath: 'review_wrong_answers',
    recommendedIntervention: {
      targetSubtopicId: 'sub_5',
      targetSubtopicTitle: 'Nature of Roots',
      focusConcept: 'Concept Transfer (a ≠ 0 in parameter problems)',
      headline: 'Targeted Concept Reconstruction: Parameter Boundaries',
      reason: 'Your calculation speed is solid, but transfer across unfamiliar parameters needs targeted reinforcement.',
      suggestedAction: 'Complete the 5-step interactive studio module on parameter non-zero constraints.'
    },
    biggestLearningSignal: {
      headline: 'You can solve familiar problems, but struggle when the same concept appears in a new context.',
      detail: 'Across diagnostic attempts, your algebraic operations were completely sound. But when asked to evaluate parameter k in kx² - 6x + 1 = 0, you solved D > 0 correctly while completely omitting that a ≠ 0. This suggests a concept-transfer gap, not a calculation issue.'
    },
    rootCauseAnalysis: {
      visibleResult: 'Transfer = 43%',
      learningPattern: 'Strong Procedure',
      likelyRootCause: 'Difficulty translating implicit boundary constraints',
      prerequisiteGap: 'Grade 9 polynomial domain restrictions'
    }
  };

  const [summary, setSummary] = useState<FullSessionDiagnosis>(
    (location.state as any)?.summary || defaultSummary
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prevent duplicate requests
  const isFetchingRef = useRef(false);

  const fetchDiagnosis = async () => {
    if (!sessionId || isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const res = await api.analyzeDiagnosticSession({ sessionId });
      if (res) {
        setSummary(res);
      }
    } catch (err: any) {
      console.warn('Failed to load live session diagnosis, displaying current state:', err);
      setError(err?.message || 'Could not refresh latest AI diagnosis. Displaying synthesized session snapshot.');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    // If summary wasn't provided via route transition state, fetch directly
    if (sessionId && !(location.state as any)?.summary) {
      fetchDiagnosis();
    }
  }, [sessionId]);

  const dims = summary.dimensions || {
    conceptMastery: summary.conceptMastery ?? 82,
    conceptStatus: 'SOLID',
    proceduralSkill: summary.proceduralSkill ?? 88,
    proceduralStatus: 'STABLE',
    reasoningSkill: summary.reasoningSkill ?? 71,
    reasoningStatus: 'DEVELOPING',
    transferSkill: summary.transferSkill ?? 43,
    transferStatus: 'LOW',
    confidenceCalibration: summary.confidenceCalibration ?? 29,
    calibrationStatus: 'overconfident'
  };

  const getPathDescription = (path: RecommendedPath) => {
    switch (path) {
      case 'prerequisite_first':
        return {
          title: 'Review Grade 9 Foundations First',
          desc: 'We noticed a few prerequisite gaps from earlier classes. Strengthening those first will make the current chapter much easier.',
          badge: 'bg-gold-subtle text-gold-text border-gold/30'
        };
      case 'learn_from_scratch':
        return {
          title: 'Learn Topic Step-by-Step',
          desc: 'Build conceptual mastery starting from standard definitions and step-by-step worked examples.',
          badge: 'bg-accent-subtle text-accent-text border-accent/30'
        };
      case 'review_wrong_answers':
      default:
        return {
          title: 'Targeted Review of Key Gaps',
          desc: 'You have solid foundations! You only need to review the specific transfer/boundary mistakes identified.',
          badge: 'bg-mint-subtle text-mint-text border-mint/30'
        };
    }
  };

  const pathMeta = getPathDescription(summary.recommendedPath || 'review_wrong_answers');

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-primary">Synthesizing Your Learning Diagnosis...</h3>
          <p className="text-xs text-secondary">Analyzing multi-signal evidence, confidence calibration, and conceptual transfer.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-6 pb-24 animate-fadeIn">
      
      {/* ── Error Banner if any ────────────────────────────────────── */}
      {error && (
        <div className="p-4 rounded-2xl bg-coral-subtle/30 border border-coral/30 flex items-center justify-between text-xs text-coral-text">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-coral shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchDiagnosis}
            className="px-3 py-1.5 rounded-xl bg-surface border border-coral/30 font-bold hover:bg-surface-elevated transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Section 16: Hero Screen Header & Overall Understanding ──── */}
      <div className="studio-card p-6 sm:p-10 border border-border-subtle bg-gradient-to-br from-surface via-surface to-accent-subtle/30 flex flex-col sm:flex-row sm:items-center justify-between gap-8">
        <div className="space-y-3 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-subtle text-accent-text text-xs font-extrabold">
            <Brain className="w-3.5 h-3.5" />
            Cognitive Diagnostics Active (Sprint 5)
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">
            Your Learning X-Ray
          </h1>
          <p className="text-sm sm:text-base text-secondary leading-relaxed font-medium">
            We synthesized your multi-signal responses for <strong>Quadratic Equations</strong> across definition checks, algebraic operations, reasoning, and parameter transfer.
          </p>
        </div>

        {/* Overall Understanding Radial Gauge */}
        <div className="shrink-0 p-5 rounded-3xl bg-surface border border-border-subtle shadow-sm flex flex-col items-center justify-center min-w-[170px] text-center">
          <ProgressRing percentage={summary.overallScore ?? 76} size={100} strokeWidth={8} color="var(--accent-primary)" />
          <div className="mt-2 text-xs font-extrabold text-primary">Overall Understanding ({summary.overallScore ?? 76}%)</div>
          <div className="text-[10px] text-secondary font-medium">Class 10 CBSE Math</div>
        </div>
      </div>

      {/* ── Section 16: Five Cognitive Dimensions Spectrum ───────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-primary tracking-tight">
            The Five Cognitive Dimensions
          </h2>
          <span className="text-xs text-secondary font-medium">
            Multi-Signal Calibration ({summary.evaluatedAttempts || 5} Attempts Evaluated)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5">
          
          {/* Dimension 1: Concept */}
          <div className={`studio-card p-4 border flex flex-col justify-between space-y-2 ${
            dims.conceptMastery >= 75 ? 'border-border-subtle bg-mint-subtle/20' : 'border-coral/40 bg-coral-subtle/20'
          }`}>
            <div>
              <span className="text-[10px] font-extrabold text-secondary uppercase tracking-wider">Concept</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-extrabold text-primary font-mono">{dims.conceptMastery}%</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  dims.conceptMastery >= 75 ? 'bg-mint text-white' : 'bg-coral text-white'
                }`}>
                  {dims.conceptStatus}
                </span>
              </div>
              <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border-subtle mt-2">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${dims.conceptMastery >= 75 ? 'bg-mint' : 'bg-coral'}`} 
                  style={{ width: `${dims.conceptMastery}%` }} 
                />
              </div>
            </div>
            <p className="text-[11px] text-secondary leading-tight">Definitions & degree constraints.</p>
          </div>

          {/* Dimension 2: Procedure */}
          <div className={`studio-card p-4 border flex flex-col justify-between space-y-2 ${
            dims.proceduralSkill >= 75 ? 'border-border-subtle bg-mint-subtle/20' : 'border-gold/40 bg-gold-subtle/20'
          }`}>
            <div>
              <span className="text-[10px] font-extrabold text-secondary uppercase tracking-wider">Procedure</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-extrabold text-primary font-mono">{dims.proceduralSkill}%</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  dims.proceduralSkill >= 75 ? 'bg-mint text-white' : 'bg-gold text-white'
                }`}>
                  {dims.proceduralStatus}
                </span>
              </div>
              <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border-subtle mt-2">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${dims.proceduralSkill >= 75 ? 'bg-mint' : 'bg-gold'}`} 
                  style={{ width: `${dims.proceduralSkill}%` }} 
                />
              </div>
            </div>
            <p className="text-[11px] text-secondary leading-tight">Formula substitution & calculation.</p>
          </div>

          {/* Dimension 3: Reasoning */}
          <div className={`studio-card p-4 border flex flex-col justify-between space-y-2 ${
            dims.reasoningSkill >= 75 ? 'border-border-subtle bg-mint-subtle/20' : 'border-gold/40 bg-gold-subtle/20'
          }`}>
            <div>
              <span className="text-[10px] font-extrabold text-secondary uppercase tracking-wider">Reasoning</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-extrabold text-primary font-mono">{dims.reasoningSkill}%</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  dims.reasoningSkill >= 75 ? 'bg-mint text-white' : 'bg-gold text-white'
                }`}>
                  {dims.reasoningStatus}
                </span>
              </div>
              <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border-subtle mt-2">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${dims.reasoningSkill >= 75 ? 'bg-mint' : 'bg-gold'}`} 
                  style={{ width: `${dims.reasoningSkill}%` }} 
                />
              </div>
            </div>
            <p className="text-[11px] text-secondary leading-tight">Step logic & explain-backs.</p>
          </div>

          {/* Dimension 4: Transfer */}
          <div className={`studio-card p-4 border-2 flex flex-col justify-between space-y-2 ${
            dims.transferSkill >= 70 ? 'border-mint/40 bg-mint-subtle/20' : 'border-coral/40 bg-coral-subtle/20'
          }`}>
            <div>
              <span className="text-[10px] font-extrabold text-coral-text uppercase tracking-wider">Transfer</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-extrabold text-coral-text font-mono">{dims.transferSkill}%</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  dims.transferSkill >= 70 ? 'bg-mint text-white' : 'bg-coral text-white'
                }`}>
                  {dims.transferStatus}
                </span>
              </div>
              <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border-subtle mt-2">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${dims.transferSkill >= 70 ? 'bg-mint' : 'bg-coral'}`} 
                  style={{ width: `${dims.transferSkill}%` }} 
                />
              </div>
            </div>
            <p className="text-[11px] text-secondary leading-tight">Parameter application ($k, m$).</p>
          </div>

          {/* Dimension 5: Confidence Calibration */}
          <div className={`studio-card p-4 border-2 flex flex-col justify-between space-y-2 ${
            dims.confidenceCalibration >= 70 ? 'border-mint/40 bg-mint-subtle/20' : 'border-coral/40 bg-coral-subtle/20'
          }`}>
            <div>
              <span className="text-[10px] font-extrabold text-coral-text uppercase tracking-wider">Calibration</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-extrabold text-coral-text font-mono">{dims.confidenceCalibration}%</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                  dims.calibrationStatus === 'well_calibrated' ? 'bg-mint text-white' : 'bg-coral text-white'
                }`}>
                  {dims.calibrationStatus ? dims.calibrationStatus.replace('_', ' ') : 'Uncertain'}
                </span>
              </div>
              <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border-subtle mt-2">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${dims.confidenceCalibration >= 70 ? 'bg-mint' : 'bg-coral'}`} 
                  style={{ width: `${dims.confidenceCalibration}%` }} 
                />
              </div>
            </div>
            <p className="text-[11px] text-secondary leading-tight">Metacognitive alignment.</p>
          </div>

        </div>
      </div>

      {/* ── Section 17: Primary AI Insight Hero Card (Primary Learning Issue) ── */}
      <div className="studio-card p-8 sm:p-10 border-2 border-accent bg-gradient-to-r from-accent-subtle/40 via-surface to-accent-subtle/20 space-y-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-2 text-accent text-xs font-extrabold uppercase tracking-widest">
          <Sparkles className="w-4 h-4" />
          ✦ Primary Learning Signal
        </div>

        <h3 className="text-xl sm:text-2xl font-extrabold text-primary leading-snug">
          {summary.biggestLearningSignal?.headline || 'You can solve familiar problems, but struggle when the same concept appears in a new context.'}
        </h3>

        <p className="text-xs sm:text-sm text-secondary leading-relaxed max-w-2xl font-medium">
          {summary.biggestLearningSignal?.detail || 'Your calculation speed is sound, but applying concepts across unfamiliar parameter constraints needs targeted reinforcement.'}
        </p>

        <div className="pt-2">
          <Link
            to="/intervention"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs bg-accent hover:bg-accent-deep text-white shadow-sm transition-all"
          >
            <span>Understand Why</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ── Recommended Learning Path Card ─────────────────────────── */}
      <div className="studio-card p-6 sm:p-8 border border-border-subtle bg-surface space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-accent" />
            <h3 className="text-base font-extrabold text-primary tracking-tight">
              Recommended Learning Path
            </h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-extrabold border uppercase ${pathMeta.badge}`}>
            {(summary.recommendedPath || 'review_wrong_answers').replace('_', ' ')}
          </span>
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-primary">{pathMeta.title}</h4>
          <p className="text-xs text-secondary leading-relaxed font-medium">{pathMeta.desc}</p>
        </div>
      </div>

      {/* ── Section 18: Root Cause Node Flowchart ───────────────────── */}
      <div className="studio-card p-6 sm:p-8 border border-border-subtle space-y-6">
        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-primary tracking-tight uppercase">
            Cognitive Root-Cause Analysis
          </h3>
          <p className="text-xs text-secondary">
            Trace how observable errors connect back to foundational prerequisite representations.
          </p>
        </div>

        {/* Visual Causal Chain with Connected Nodes */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
          
          {/* Node 1 */}
          <div className="studio-card p-4 border border-border-subtle bg-surface-elevated space-y-1.5 relative">
            <span className="text-[10px] font-extrabold text-coral-text uppercase">1. Visible Result</span>
            <div className="text-sm font-extrabold text-primary">{summary.rootCauseAnalysis?.visibleResult || `Transfer = ${dims.transferSkill}%`}</div>
            <p className="text-[11px] text-secondary">Performance on multi-signal transfer questions.</p>
          </div>

          {/* Node 2 */}
          <div className="studio-card p-4 border border-border-subtle bg-surface-elevated space-y-1.5">
            <span className="text-[10px] font-extrabold text-secondary uppercase">2. Learning Pattern</span>
            <div className="text-sm font-extrabold text-primary">{summary.rootCauseAnalysis?.learningPattern || 'Strong Procedure'}</div>
            <p className="text-[11px] text-secondary">Applies algebraic procedures rapidly.</p>
          </div>

          {/* Node 3 */}
          <div className="studio-card p-4 border border-border-subtle bg-surface-elevated space-y-1.5">
            <span className="text-[10px] font-extrabold text-accent uppercase">3. Likely Root Cause</span>
            <div className="text-sm font-extrabold text-primary">{summary.rootCauseAnalysis?.likelyRootCause || 'Difficulty translating implicit boundary constraints'}</div>
            <p className="text-[11px] text-secondary">Omits non-zero leading constraint.</p>
          </div>

          {/* Node 4 */}
          <div className="studio-card p-4 border-2 border-accent bg-accent-subtle/50 space-y-1.5">
            <span className="text-[10px] font-extrabold text-accent uppercase">4. Prerequisite Gap</span>
            <div className="text-sm font-extrabold text-accent-text">{summary.rootCauseAnalysis?.prerequisiteGap || 'Grade 9 polynomial domain restrictions'}</div>
            <p className="text-[11px] text-secondary">Foundational algebraic representation gap.</p>
          </div>

        </div>
      </div>

      {/* ── Section 19: Misconception Registry & Evidence ──────────── */}
      <div className="studio-card p-6 sm:p-8 border border-border-subtle space-y-5">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <h3 className="text-base font-extrabold text-primary tracking-tight">
            Misconception & Conceptual Gap Registry
          </h3>
          <span className="text-xs text-secondary font-medium">Evidence-Based</span>
        </div>

        <div className="space-y-3">
          {summary.misconceptions && summary.misconceptions.length > 0 ? (
            summary.misconceptions.map((misc) => {
              const isLikelyGap = misc.name.toLowerCase().includes('likely') || misc.severity !== 'HIGH';
              return (
                <div 
                  key={misc.id}
                  className={`p-4 rounded-2xl bg-surface-elevated border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                    misc.status === 'ACTIVE_GAP' ? 'border-coral/40' : 'border-border-subtle'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-lg shrink-0 flex items-center justify-center font-bold text-white ${
                      misc.status === 'RESOLVED' ? 'bg-mint' : misc.status === 'IMPROVING' ? 'bg-gold' : 'bg-coral'
                    }`}>
                      {misc.status === 'RESOLVED' ? '✓' : misc.status === 'IMPROVING' ? '⚠' : '●'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-primary">{misc.name}</span>
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          isLikelyGap ? 'bg-gold-subtle text-gold-text' : 'bg-coral-subtle text-coral-text'
                        }`}>
                          {isLikelyGap ? 'Likely Gap' : 'Confirmed Misconception'}
                        </span>
                      </div>
                      <p className="text-[11px] text-secondary mt-0.5">{misc.description}</p>
                      <p className="text-[10px] text-accent font-medium mt-1">Diagnostic Evidence: {misc.evidence}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${
                    misc.status === 'RESOLVED' ? 'bg-mint text-white' : misc.status === 'IMPROVING' ? 'bg-gold text-white' : 'bg-coral text-white'
                  }`}>
                    {misc.status.replace('_', ' ')}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="p-4 rounded-2xl bg-surface-elevated border border-border-subtle text-xs text-mint-text font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-mint" />
              <span>Great job! No misconceptions detected across evaluated attempts.</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Contradiction Detection Card (Self-Assessment vs Performance) ── */}
      <div className="studio-card p-6 sm:p-8 border border-border-subtle space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-primary tracking-tight flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-coral" />
            Perception vs. Reality (Contradictions)
          </h3>
          <span className="text-xs text-secondary font-medium">Metacognitive Calibration</span>
        </div>

        {summary.contradictions && summary.contradictions.length > 0 ? (
          <div className="space-y-3">
            {summary.contradictions.map((c, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-surface-elevated border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-primary">{c.subtopicTitle}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      c.nature === 'OVERESTIMATION' ? 'bg-coral text-white' : 'bg-gold text-white'
                    }`}>
                      {c.nature}
                    </span>
                  </div>
                  <p className="text-secondary leading-relaxed">{c.explanation}</p>
                </div>
                <div className="shrink-0 flex items-center gap-2 text-[11px] font-mono">
                  <span className="px-2 py-1 rounded bg-surface border border-border-subtle text-secondary">Rated: {c.perceivedConfidence}</span>
                  <span>→</span>
                  <span className="px-2 py-1 rounded bg-surface border border-border-subtle text-primary font-bold">Actual: {c.actualPerformance}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-surface-elevated border border-border-subtle text-xs text-mint-text font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-mint" />
            <span>Well calibrated! Your self-assessment ratings closely matched your test results.</span>
          </div>
        )}
      </div>

      {/* ── Prerequisite Gaps Card ─────────────────────────────────── */}
      <div className="studio-card p-6 sm:p-8 border border-border-subtle space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-primary tracking-tight flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-accent" />
            Prerequisite Knowledge Gaps
          </h3>
          <span className="text-xs text-secondary font-medium">Foundational Diagnostics</span>
        </div>

        {summary.prerequisiteGaps && summary.prerequisiteGaps.length > 0 ? (
          <div className="space-y-3">
            {summary.prerequisiteGaps.map((gap, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-surface-elevated border border-border-subtle space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-primary">{gap.prerequisite}</span>
                  <span className="px-2 py-0.5 rounded-full bg-surface border border-border-subtle text-[10px] font-mono text-secondary">
                    {gap.gradeLevel}
                  </span>
                </div>
                <p className="text-secondary leading-relaxed">{gap.observableSignal}</p>
                <div className="text-[11px] font-medium text-accent">
                  Suggestion: {gap.remediationSuggestion}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-surface-elevated border border-border-subtle text-xs text-mint-text font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-mint" />
            <span>Solid foundation! No upstream Grade 8/9 prerequisite gaps detected.</span>
          </div>
        )}
      </div>

      {/* ── Section 20: Targeted Learning Persuasion Banner ─────────── */}
      <div className="studio-card p-8 border-2 border-accent bg-surface-elevated flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1.5 max-w-lg">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent">
            Recommended Action
          </span>
          <h3 className="text-xl font-extrabold text-primary">
            You don't need to relearn the entire chapter.
          </h3>
          <p className="text-xs sm:text-sm text-secondary leading-relaxed">
            Target Focus: <strong className="text-primary font-bold">{summary.recommendedIntervention?.focusConcept || 'Concept Transfer (a ≠ 0 in parameter problems)'}</strong>.
            <br />
            {summary.recommendedIntervention?.reason}
          </p>
        </div>

        <Link
          to="/intervention"
          className="px-6 py-3.5 rounded-2xl font-extrabold text-xs sm:text-sm bg-accent hover:bg-accent-deep text-white shadow-sm transition-all flex items-center justify-center gap-2 shrink-0 transform hover:-translate-y-0.5"
        >
          <span>Fix This Gap</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
};
