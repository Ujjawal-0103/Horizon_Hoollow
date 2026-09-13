import React from 'react';
import { useLocation, Link } from 'react-router-dom';
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
  Check
} from 'lucide-react';
import { DiagnosisSummary } from '../types';
import { ProgressRing } from '../components/common/ProgressRing';

export const LearningXRayPage: React.FC = () => {
  const location = useLocation();
  const summary: DiagnosisSummary = (location.state as any)?.summary || {
    overallScore: 67,
    evaluatedAttempts: 3,
    conceptMastery: 'EMERGING',
    proceduralSkill: 'STABLE',
    reasoning: [
      'Successfully factored second-degree terms',
      'Accurate discriminant computation'
    ],
    misconceptions: [
      'Assumes quadratic equation condition without verifying leading coefficient a ≠ 0'
    ],
    confidenceCalibration: 'overconfident',
    primaryRootCause: 'Overlooking implicit domain boundary constraints (a ≠ 0) when evaluating root existence.',
    recommendedAction: 'targeted_intervention'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-6 pb-24">
      
      {/* ── Section 16: Hero Screen Header & Overall Understanding ──── */}
      <div className="studio-card p-6 sm:p-10 border border-border-subtle bg-gradient-to-br from-surface via-surface to-accent-subtle/30 flex flex-col sm:flex-row sm:items-center justify-between gap-8">
        <div className="space-y-3 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-subtle text-accent-text text-xs font-bold">
            <Brain className="w-3.5 h-3.5" />
            Cognitive Diagnostics Active
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">
            Your Learning X-Ray
          </h1>
          <p className="text-sm sm:text-base text-secondary leading-relaxed font-medium">
            We found something interesting about how you understand <strong>Quadratic Equations</strong>. Your arithmetic speed is strong, but transfer across unfamiliar parameters needs targeted reinforcement.
          </p>
        </div>

        {/* Overall Understanding Radial Gauge */}
        <div className="shrink-0 p-5 rounded-3xl bg-surface border border-border-subtle shadow-sm flex flex-col items-center justify-center min-w-[170px] text-center">
          <ProgressRing percentage={76} size={100} strokeWidth={8} color="var(--accent-primary)" />
          <div className="mt-2 text-xs font-extrabold text-primary">Overall Understanding</div>
          <div className="text-[10px] text-secondary font-medium">Class 10 CBSE Math</div>
        </div>
      </div>

      {/* ── Section 16: Five Dimensions Spectrum ─────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-primary tracking-tight">
            The Five Cognitive Dimensions
          </h2>
          <span className="text-xs text-secondary font-medium">
            Multi-Signal Diagnostic Calibration
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5">
          
          {/* Dimension 1: Concept (Mint) */}
          <div className="studio-card p-4 border border-border-subtle bg-mint-subtle/20 flex flex-col justify-between space-y-2">
            <div>
              <span className="text-[10px] font-extrabold text-secondary uppercase tracking-wider">Concept</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-extrabold text-primary font-mono">82%</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-mint text-white">Strong</span>
              </div>
              <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border-subtle mt-2">
                <div className="bg-mint h-full rounded-full w-[82%]" />
              </div>
            </div>
            <p className="text-[11px] text-secondary leading-tight">Clear grasp of quadratic degree definitions.</p>
          </div>

          {/* Dimension 2: Procedure (Mint) */}
          <div className="studio-card p-4 border border-border-subtle bg-mint-subtle/20 flex flex-col justify-between space-y-2">
            <div>
              <span className="text-[10px] font-extrabold text-secondary uppercase tracking-wider">Procedure</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-extrabold text-primary font-mono">88%</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-mint text-white">Strong</span>
              </div>
              <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border-subtle mt-2">
                <div className="bg-mint h-full rounded-full w-[88%]" />
              </div>
            </div>
            <p className="text-[11px] text-secondary leading-tight">Factoring & formula execution is rapid.</p>
          </div>

          {/* Dimension 3: Reasoning (Gold) */}
          <div className="studio-card p-4 border border-border-subtle bg-gold-subtle/20 flex flex-col justify-between space-y-2">
            <div>
              <span className="text-[10px] font-extrabold text-secondary uppercase tracking-wider">Reasoning</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-extrabold text-primary font-mono">71%</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold text-white">Developing</span>
              </div>
              <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border-subtle mt-2">
                <div className="bg-gold h-full rounded-full w-[71%]" />
              </div>
            </div>
            <p className="text-[11px] text-secondary leading-tight">Good logic; overlooks coefficient limits.</p>
          </div>

          {/* Dimension 4: Transfer (Coral) */}
          <div className="studio-card p-4 border-2 border-coral/40 bg-coral-subtle/20 flex flex-col justify-between space-y-2">
            <div>
              <span className="text-[10px] font-extrabold text-coral-text uppercase tracking-wider">Transfer</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-extrabold text-coral-text font-mono">43%</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-coral text-white">Attention</span>
              </div>
              <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border-subtle mt-2">
                <div className="bg-coral h-full rounded-full w-[43%]" />
              </div>
            </div>
            <p className="text-[11px] text-secondary leading-tight">Struggles with parametric word contexts.</p>
          </div>

          {/* Dimension 5: Confidence (Coral) */}
          <div className="studio-card p-4 border-2 border-coral/40 bg-coral-subtle/20 flex flex-col justify-between space-y-2">
            <div>
              <span className="text-[10px] font-extrabold text-coral-text uppercase tracking-wider">Confidence</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-extrabold text-coral-text font-mono">29%</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-coral text-white">Attention</span>
              </div>
              <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border-subtle mt-2">
                <div className="bg-coral h-full rounded-full w-[29%]" />
              </div>
            </div>
            <p className="text-[11px] text-secondary leading-tight">High certainty on flawed boundary cases.</p>
          </div>

        </div>
      </div>

      {/* ── Section 17: Primary AI Insight Hero Card ────────────────── */}
      <div className="studio-card p-8 sm:p-10 border-2 border-accent bg-gradient-to-r from-accent-subtle/40 via-surface to-accent-subtle/20 space-y-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-2 text-accent text-xs font-extrabold uppercase tracking-widest">
          <Sparkles className="w-4 h-4" />
          ✦ Your Biggest Learning Signal
        </div>

        <h3 className="text-xl sm:text-2xl font-extrabold text-primary leading-snug">
          You can solve familiar problems, but struggle when the same concept appears in a new context.
        </h3>

        <p className="text-xs sm:text-sm text-secondary leading-relaxed max-w-2xl font-medium">
          Across three diagnostic attempts, your algebraic operations were completely sound. But when asked to evaluate parameter $k$ in $kx^2 - 6x + 1 = 0$, you solved $D &gt; 0$ correctly while completely omitting that $a \neq 0$. This suggests a <strong className="text-primary font-bold">concept-transfer gap</strong>, not a calculation issue.
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
            <div className="text-sm font-extrabold text-primary">Transfer = 43%</div>
            <p className="text-[11px] text-secondary">Failed questions introducing variable coefficients.</p>
          </div>

          {/* Node 2 */}
          <div className="studio-card p-4 border border-border-subtle bg-surface-elevated space-y-1.5">
            <span className="text-[10px] font-extrabold text-secondary uppercase">2. Learning Pattern</span>
            <div className="text-sm font-extrabold text-primary">Strong Procedure</div>
            <p className="text-[11px] text-secondary">Applies $b^2 - 4ac$ mechanically without checking $a \neq 0$.</p>
          </div>

          {/* Node 3 */}
          <div className="studio-card p-4 border border-border-subtle bg-surface-elevated space-y-1.5">
            <span className="text-[10px] font-extrabold text-accent uppercase">3. Likely Root Cause</span>
            <div className="text-sm font-extrabold text-primary">Translating Contexts</div>
            <p className="text-[11px] text-secondary">Difficulty translating implicit boundary constraints.</p>
          </div>

          {/* Node 4 */}
          <div className="studio-card p-4 border-2 border-accent bg-accent-subtle/50 space-y-1.5">
            <span className="text-[10px] font-extrabold text-accent uppercase">4. Prerequisite Gap</span>
            <div className="text-sm font-extrabold text-accent-text">Algebraic Representation</div>
            <p className="text-[11px] text-secondary">Grade 9 polynomial domain restrictions.</p>
          </div>

        </div>
      </div>

      {/* ── Section 19: Misconception Trajectory Timeline ───────────── */}
      <div className="studio-card p-6 sm:p-8 border border-border-subtle space-y-5">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <h3 className="text-base font-extrabold text-primary tracking-tight">
            Misconception Trajectory
          </h3>
          <span className="text-xs text-secondary font-medium">Longitudinal Tracker</span>
        </div>

        <div className="space-y-3">
          
          <div className="p-4 rounded-2xl bg-surface-elevated border border-border-subtle flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-mint text-white flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <span className="font-extrabold text-primary">Inverse Operations in Factoring</span>
                <p className="text-[11px] text-secondary">Sign conservation verified across 4 attempts.</p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-mint text-white">
              Resolved
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-surface-elevated border border-border-subtle flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-gold text-white flex items-center justify-center font-bold">
                ⚠
              </div>
              <div>
                <span className="font-extrabold text-primary">Discriminant Sign Interpretation ($D &lt; 0$)</span>
                <p className="text-[11px] text-secondary">Distinguishing between two real roots vs no real roots.</p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-gold text-white">
              Improving
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-surface-elevated border-2 border-coral/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-coral text-white flex items-center justify-center font-bold">
                ●
              </div>
              <div>
                <span className="font-extrabold text-primary">Concept Transfer ($a \neq 0$ Constraint)</span>
                <p className="text-[11px] text-secondary">Treating leading term as a constant in parameter problems.</p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-coral text-white">
              Active Gap
            </span>
          </div>

        </div>
      </div>

      {/* ── Section 20: Targeted Learning Persuasion Banner ─────────── */}
      <div className="studio-card p-8 border-2 border-accent bg-surface-elevated flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1.5 max-w-lg">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent">
            We Know What To Work On
          </span>
          <h3 className="text-xl font-extrabold text-primary">
            You don't need to relearn the entire chapter.
          </h3>
          <p className="text-xs sm:text-sm text-secondary leading-relaxed">
            Your next targeted step: <strong className="text-primary font-bold">Concept Transfer ($a \neq 0$ in parameter problems)</strong>.
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
