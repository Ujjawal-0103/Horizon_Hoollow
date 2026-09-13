import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Target, 
  Brain, 
  Clock, 
  Sparkles, 
  TrendingUp, 
  Zap,
  CheckCircle2,
  AlertTriangle,
  Play
} from 'lucide-react';
import { ProgressRing } from '../components/common/ProgressRing';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const studentName = user?.name ? user.name.split(' ')[0] : 'Aarav';

  return (
    <div className="space-y-8 pb-12">
      
      {/* ── Greeting Header ────────────────────────────────────────── */}
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight flex items-center gap-2">
          Good evening, {studentName} 👋
        </h1>
        <p className="text-sm sm:text-base text-secondary font-medium">
          Let's see where you are and what to improve next.
        </p>
      </div>

      {/* ── Asymmetric Hero Section (Section 7 & 8) ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Large Primary Learning Card (7 Cols) */}
        <div className="lg:col-span-7 studio-card p-6 sm:p-8 border border-border-subtle bg-gradient-to-br from-surface via-surface to-accent-subtle/30 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                Currently Learning
              </span>
              <span className="text-xs font-bold text-secondary bg-surface px-2.5 py-0.5 rounded-full border border-border-subtle">
                Class 10 CBSE
              </span>
            </div>

            <div>
              <div className="text-xs font-bold text-secondary">Mathematics</div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight mt-0.5">
                Quadratic Equations
              </h2>
            </div>

            {/* Visual Understanding Bar */}
            <div className="space-y-2 pt-2">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-semibold text-secondary">Overall Understanding</span>
                <span className="font-extrabold text-accent text-base font-mono">76%</span>
              </div>
              <div className="w-full bg-surface-elevated border border-border-subtle h-3 rounded-full overflow-hidden p-0.5">
                <div className="bg-gradient-to-r from-accent to-mint h-full rounded-full w-[76%] transition-all duration-700" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Link
              to="/learn"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm bg-accent hover:bg-accent-deep text-white shadow-sm transition-all transform hover:-translate-y-0.5"
            >
              <span>Continue Learning</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/diagnostic"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm bg-surface hover:bg-surface-elevated text-primary border border-border-subtle transition-all"
            >
              <span>Diagnose Mastery</span>
            </Link>
          </div>
        </div>

        {/* 4-Color Learning Snapshot Grid (5 Cols) */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-3">
          
          {/* Concepts understood - Mint */}
          <div className="studio-card p-5 border border-border-subtle flex flex-col justify-between bg-mint-subtle/30 border-mint/20">
            <span className="text-[11px] font-bold text-mint-text uppercase tracking-wider">
              Concepts
            </span>
            <div className="text-3xl font-extrabold text-primary font-mono my-2">
              8 <span className="text-sm text-secondary font-sans font-normal">/ 11</span>
            </div>
            <span className="text-[11px] text-mint-text font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-mint" /> 72% Mastered
            </span>
          </div>

          {/* Calibrated Gain - Purple */}
          <div className="studio-card p-5 border border-border-subtle flex flex-col justify-between bg-accent-subtle/30 border-accent/20">
            <span className="text-[11px] font-bold text-accent-text uppercase tracking-wider">
              Improvement
            </span>
            <div className="text-3xl font-extrabold text-accent font-mono my-2">
              +14%
            </div>
            <span className="text-[11px] text-accent font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> This week
            </span>
          </div>

          {/* Active Gaps - Coral */}
          <div className="studio-card p-5 border border-border-subtle flex flex-col justify-between bg-coral-subtle/30 border-coral/20">
            <span className="text-[11px] font-bold text-coral-text uppercase tracking-wider">
              Active Gaps
            </span>
            <div className="text-3xl font-extrabold text-coral-text font-mono my-2">
              2
            </div>
            <span className="text-[11px] text-secondary font-medium">
              1 Transfer, 1 Sign
            </span>
          </div>

          {/* Sessions - Sky Blue */}
          <div className="studio-card p-5 border border-border-subtle flex flex-col justify-between bg-sky-subtle/30 border-sky/20">
            <span className="text-[11px] font-bold text-sky-text uppercase tracking-wider">
              Sessions
            </span>
            <div className="text-3xl font-extrabold text-primary font-mono my-2">
              4
            </div>
            <span className="text-[11px] text-sky-text font-medium">
              Multi-signal verified
            </span>
          </div>

        </div>

      </div>

      {/* ── Your Learning X-Ray Compact Preview (Section 7) ──────────── */}
      <div className="studio-card p-6 sm:p-8 border border-border-subtle space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent-subtle text-accent flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-primary">Your Learning X-Ray</h3>
              <p className="text-xs text-secondary">Cognitive profile across 5 learning dimensions</p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-coral-subtle text-coral-text border border-coral/30 flex items-center gap-1 self-start sm:self-auto">
            <AlertTriangle className="w-3.5 h-3.5" /> Primary focus: Concept Transfer
          </span>
        </div>

        {/* 5 Dimensional Meters */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          
          <div className="p-3.5 rounded-xl bg-surface-elevated border border-border-subtle space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-secondary">
              <span>Concept</span>
              <span className="font-mono text-primary font-bold">82%</span>
            </div>
            <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border-subtle">
              <div className="bg-mint h-full rounded-full w-[82%]" />
            </div>
            <span className="text-[10px] font-bold text-mint-text block">Strong</span>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-elevated border border-border-subtle space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-secondary">
              <span>Procedure</span>
              <span className="font-mono text-primary font-bold">88%</span>
            </div>
            <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border-subtle">
              <div className="bg-mint h-full rounded-full w-[88%]" />
            </div>
            <span className="text-[10px] font-bold text-mint-text block">Strong</span>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-elevated border border-border-subtle space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-secondary">
              <span>Reasoning</span>
              <span className="font-mono text-primary font-bold">71%</span>
            </div>
            <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border-subtle">
              <div className="bg-gold h-full rounded-full w-[71%]" />
            </div>
            <span className="text-[10px] font-bold text-gold-text block">Developing</span>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-elevated border-2 border-coral/30 space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-coral-text">
              <span>Transfer</span>
              <span className="font-mono font-bold">43%</span>
            </div>
            <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border-subtle">
              <div className="bg-coral h-full rounded-full w-[43%]" />
            </div>
            <span className="text-[10px] font-bold text-coral-text block">Needs Attention</span>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-elevated border-2 border-coral/30 space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-coral-text">
              <span>Confidence</span>
              <span className="font-mono font-bold">29%</span>
            </div>
            <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border-subtle">
              <div className="bg-coral h-full rounded-full w-[29%]" />
            </div>
            <span className="text-[10px] font-bold text-coral-text block">Overconfident</span>
          </div>

        </div>

        <div className="pt-2 flex items-center justify-between">
          <p className="text-xs text-secondary">
            Diagnosed bottleneck: <strong className="text-primary font-semibold">Treating leading coefficient without verifying $a \neq 0$</strong>.
          </p>
          <Link
            to="/learning-xray"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:text-accent-deep transition-colors"
          >
            <span>View Full Learning X-Ray</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ── Continue Where You Left Off ─────────────────────────────── */}
      <div className="studio-card p-5 border border-border-subtle bg-surface-elevated flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-accent text-white flex items-center justify-center shadow-sm">
            <Play className="w-4 h-4 fill-white" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent">Continue Where You Left Off</span>
            <div className="text-sm font-bold text-primary">Targeted Concept Intervention: Parameter Constraints</div>
            <p className="text-xs text-secondary">10 minute interactive explain-back module</p>
          </div>
        </div>

        <Link
          to="/intervention"
          className="px-4 py-2 rounded-xl text-xs font-bold bg-accent hover:bg-accent-deep text-white shadow-sm transition-all whitespace-nowrap self-start sm:self-auto"
        >
          Resume Activity →
        </Link>
      </div>

    </div>
  );
};
