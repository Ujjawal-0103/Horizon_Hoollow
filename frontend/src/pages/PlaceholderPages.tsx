import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  RefreshCcw, 
  History, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Check, 
  Send,
  Brain,
  TrendingUp,
  Lightbulb,
  Play
} from 'lucide-react';
import { MathText } from '../components/common/MathText';

/* ── Section 21 & 22: Interactive Studio Teaching & Explain-Back ──── */
export const InterventionPage: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(1);
  const [explainInput, setExplainInput] = useState('');
  const [explainResult, setExplainResult] = useState<boolean>(false);

  const stages = [
    { id: 1, label: '01 UNDERSTAND' },
    { id: 2, label: '02 SEE' },
    { id: 3, label: '03 TRY' },
    { id: 4, label: '04 EXPLAIN' },
    { id: 5, label: '05 VERIFY' }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6 pb-24">
      
      {/* Header */}
      <div className="space-y-1 text-center">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent">
          Interactive Teaching Studio
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
          Targeted Concept Reconstruction
        </h1>
        <p className="text-xs sm:text-sm text-secondary">
          Focusing strictly on why leading coefficient <MathText text="a \neq 0" /> is required in Quadratic Equations.
        </p>
      </div>

      {/* 5-Step Stage Pills (Section 21) */}
      <div className="grid grid-cols-5 gap-1.5 text-center">
        {stages.map((st) => (
          <button
            key={st.id}
            type="button"
            onClick={() => setActiveStage(st.id)}
            className={`py-2 px-1 rounded-xl text-xs font-extrabold border transition-all ${
              activeStage === st.id
                ? 'bg-accent text-white border-accent shadow-sm scale-[1.02]'
                : activeStage > st.id
                ? 'bg-mint-subtle/50 text-mint-text border-mint/30'
                : 'bg-surface text-secondary border-border-subtle'
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* Stage Body Card */}
      <div className="studio-card p-6 sm:p-10 border border-border-subtle space-y-6">
        
        {/* Stage 1: UNDERSTAND */}
        {activeStage === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <span className="text-[11px] font-bold text-accent uppercase tracking-wider">
              Stage 01: Core Concept
            </span>
            <h3 className="text-xl font-extrabold text-primary">
              The Fundamental Definition: Why <MathText text="a \neq 0" />?
            </h3>
            <p className="text-sm text-secondary leading-relaxed font-medium">
              A quadratic equation is defined as <MathText text="ax^2 + bx + c = 0" /> with degree 2. If <MathText text="a = 0" />, the <MathText text="x^2" /> term completely vanishes, collapsing the equation into <MathText text="bx + c = 0" />—a linear equation with only 1 root!
            </p>
            <div className="p-4 rounded-2xl bg-surface-elevated border border-border-subtle text-xs text-primary font-bold">
              Rule: Whenever you see a parameter multiplying <MathText text="x^2" />, set that parameter <MathText text="\neq 0" /> before applying discriminant formulas!
            </div>
          </div>
        )}

        {/* Stage 2: SEE */}
        {activeStage === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <span className="text-[11px] font-bold text-mint-text uppercase tracking-wider">
              Stage 02: Worked Example
            </span>
            <h3 className="text-xl font-extrabold text-primary">
              Let's Walk Through A Parameter Case
            </h3>
            <p className="text-xs sm:text-sm text-secondary">
              Find k such that <MathText text="kx^2 - 6x + 1 = 0" /> has two distinct real roots:
            </p>
            <div className="p-5 rounded-2xl bg-surface-elevated border border-border-subtle font-mono text-xs space-y-2 text-primary">
              <div>1. <MathText text="D = (-6)^2 - 4(k)(1) = 36 - 4k" /></div>
              <div>2. For two distinct roots: <MathText text="D > 0 \Rightarrow 36 > 4k \Rightarrow k < 9" /></div>
              <div className="text-accent font-bold">3. Essential condition: Coefficient of <MathText text="x^2" /> is k, so <MathText text="k \neq 0" /></div>
              <div className="text-mint-text font-extrabold">Final: <MathText text="k < 9" /> and <MathText text="k \neq 0" /></div>
            </div>
          </div>
        )}

        {/* Stage 3: TRY */}
        {activeStage === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <span className="text-[11px] font-bold text-gold-text uppercase tracking-wider">
              Stage 03: Mini Interactive Challenge
            </span>
            <h3 className="text-xl font-extrabold text-primary">
              Test Your Eye
            </h3>
            <p className="text-xs sm:text-sm text-secondary">
              For what value of m does <MathText text="(m - 4)x^2 + 8x + 2 = 0" /> cease to be quadratic?
            </p>
            <div className="p-4 rounded-2xl bg-surface-elevated border border-border-subtle text-xs font-bold text-primary">
              Solution: When <MathText text="m - 4 = 0 \Rightarrow m = 4" />.
            </div>
          </div>
        )}

        {/* Stage 4: EXPLAIN (Section 22) */}
        {(activeStage === 4 || activeStage === 5) && (
          <div className="space-y-5 animate-fadeIn">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-accent uppercase tracking-wider">
                Stage 04 & 05: Teach It Back
              </span>
              <h3 className="text-xl font-extrabold text-primary">
                Teach it back to me.
              </h3>
              <p className="text-xs sm:text-sm text-secondary">
                Explain this as if you're helping a classmate understand why <MathText text="(p - 3)x^2 + 4x + 2 = 0" /> needs <MathText text="p \neq 3" />.
              </p>
            </div>

            <textarea
              rows={3}
              value={explainInput}
              onChange={(e) => setExplainInput(e.target.value)}
              placeholder="Type your explanation here (e.g., If p = 3, then (3 - 3) = 0, which kills the x^2 term so it becomes a linear line)..."
              className="w-full bg-surface-elevated border border-border-subtle rounded-2xl p-4 text-xs sm:text-sm text-primary placeholder-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all font-medium"
            />

            <button
              type="button"
              onClick={() => setExplainResult(true)}
              className="py-3 px-6 rounded-2xl font-extrabold text-xs sm:text-sm bg-accent hover:bg-accent-deep text-white shadow-sm transition-all flex items-center gap-2"
            >
              <span>Check My Understanding</span>
              <Send className="w-3.5 h-3.5" />
            </button>

            {/* AI Review Result (Section 22) */}
            {explainResult && (
              <div className="p-5 rounded-2xl bg-surface-elevated border border-border-subtle space-y-4 pt-4 animate-fadeIn">
                
                <div className="space-y-1">
                  <div className="text-xs font-extrabold text-mint-text flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-mint" />
                    What you understand
                  </div>
                  <p className="text-xs text-secondary leading-relaxed">
                    You accurately identified that <MathText text="p = 3" /> reduces the leading coefficient to zero, eliminating degree 2.
                  </p>
                </div>

                <div className="space-y-1 pt-2 border-t border-border-subtle">
                  <div className="text-xs font-extrabold text-gold-text flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-gold" />
                    What you're still missing
                  </div>
                  <p className="text-xs text-secondary leading-relaxed">
                    Be explicit about the root consequences: a linear equation can only have 1 solution, violating the requirement of 2 roots.
                  </p>
                </div>

                <div className="space-y-1 pt-2 border-t border-border-subtle">
                  <div className="text-xs font-extrabold text-accent flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-accent" />
                    One thing to reconsider
                  </div>
                  <p className="text-xs text-secondary leading-relaxed">
                    Always state the boundary restriction first before taking any discriminant calculations!
                  </p>
                </div>

              </div>
            )}
          </div>
        )}

        {/* Stage Progression Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
          <button
            type="button"
            disabled={activeStage === 1}
            onClick={() => setActiveStage(prev => prev - 1)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-secondary hover:text-primary disabled:opacity-30"
          >
            ← Previous Stage
          </button>

          {activeStage < 5 ? (
            <button
              type="button"
              onClick={() => setActiveStage(prev => prev + 1)}
              className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-accent hover:bg-accent-deep text-white shadow-sm"
            >
              Next Stage →
            </button>
          ) : (
            <Link
              to="/reassessment"
              className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-mint text-white shadow-sm flex items-center gap-1.5 hover:opacity-90 transition-all"
            >
              <span>Take Verification Reassessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

      </div>

    </div>
  );
};

/* ── Section 23 & 24: Reassessment & Before/After Wow Factor ───────── */
export const ReassessmentPage: React.FC = () => {
  const [reassessCompleted, setReassessCompleted] = useState(false);
  const [chosenOption, setChosenOption] = useState('');

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6 pb-24">
      
      {/* Header (Section 23) */}
      <div className="space-y-1 text-center">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-mint-text">
          Verification Challenge
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
          Let's See Whether The Idea Actually Stuck
        </h1>
        <p className="text-xs sm:text-sm text-secondary">
          We found a learning gap. You worked on it. Now let's verify if your mental model has permanently updated.
        </p>
      </div>

      {!reassessCompleted ? (
        <div className="studio-card p-6 sm:p-10 border border-border-subtle space-y-6">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-accent">CHALLENGE 1 OF 1</span>
            <span className="text-secondary font-medium">Transfer Check</span>
          </div>

          <h3 className="text-base sm:text-lg font-extrabold text-primary leading-relaxed">
            For what values of parameter c does the equation <MathText text="(c - 1)x^2 + 6x + 3 = 0" /> possess two distinct real roots?
          </h3>

          <div className="space-y-3 pt-1">
            {[
              '$c < 4$ and $c \\neq 1$',
              '$c < 4$',
              '$c > 4$ and $c \\neq 1$',
              '$c < 12$'
            ].map((opt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setChosenOption(opt)}
                className={`w-full p-4 rounded-2xl text-left text-xs sm:text-sm font-bold border transition-all flex items-center justify-between ${
                  chosenOption === opt
                    ? 'bg-accent-subtle border-2 border-accent text-primary shadow-sm scale-[1.01]'
                    : 'bg-surface border-border-subtle text-primary hover:bg-surface-elevated'
                }`}
              >
                <span><MathText text={opt} /></span>
                {chosenOption === opt && <Check className="w-4 h-4 text-accent" />}
              </button>
            ))}
          </div>

          <div className="pt-2">
            <button
              type="button"
              disabled={!chosenOption}
              onClick={() => setReassessCompleted(true)}
              className="w-full py-4 px-6 rounded-2xl font-extrabold text-sm bg-accent hover:bg-accent-deep text-white shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <span>Submit & Compare Progress</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* ── Major Hackathon Demo Moment: Before / After Result (Section 24) ── */
        <div className="space-y-6 animate-fadeIn">
          
          <div className="studio-card p-8 sm:p-10 border-2 border-mint/50 bg-surface space-y-8 shadow-sm text-center">
            
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-mint-subtle text-mint-text border border-mint/30">
                Cognitive Growth Confirmed
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-primary">
                Meaningful Improvement
              </h2>
              <p className="text-xs sm:text-sm text-secondary max-w-md mx-auto">
                Your transfer gap improved. You successfully included the non-zero leading constraint (<MathText text="c \neq 1" />) on your very first try!
              </p>
            </div>

            {/* Dramatic Side-by-Side Comparison (Section 24) */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              
              {/* BEFORE */}
              <div className="p-5 rounded-2xl bg-surface-elevated border border-border-subtle space-y-4 text-left">
                <div className="text-[10px] font-extrabold text-muted uppercase tracking-wider">
                  BEFORE INTERVENTION
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-secondary">TRANSFER</span>
                      <span className="text-coral-text font-mono">43%</span>
                    </div>
                    <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border-subtle mt-1">
                      <div className="bg-coral h-full w-[43%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-secondary">CONFIDENCE</span>
                      <span className="text-coral-text font-mono">29%</span>
                    </div>
                    <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border-subtle mt-1">
                      <div className="bg-coral h-full w-[29%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-secondary">REASONING</span>
                      <span className="text-gold-text font-mono">71%</span>
                    </div>
                    <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border-subtle mt-1">
                      <div className="bg-gold h-full w-[71%]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* AFTER */}
              <div className="p-5 rounded-2xl bg-mint-subtle/30 border-2 border-mint space-y-4 text-left shadow-sm">
                <div className="text-[10px] font-extrabold text-mint-text uppercase tracking-wider flex items-center justify-between">
                  <span>AFTER REASSESSMENT</span>
                  <span className="font-extrabold text-accent">+38% GAIN</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-primary">TRANSFER</span>
                      <span className="text-mint-text font-mono text-base font-extrabold">81%</span>
                    </div>
                    <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border-subtle mt-1">
                      <div className="bg-mint h-full w-[81%] transition-all duration-1000" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-primary">CONFIDENCE</span>
                      <span className="text-mint-text font-mono text-base font-extrabold">72%</span>
                    </div>
                    <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border-subtle mt-1">
                      <div className="bg-mint h-full w-[72%] transition-all duration-1000" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-primary">REASONING</span>
                      <span className="text-mint-text font-mono text-base font-extrabold">87%</span>
                    </div>
                    <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border-subtle mt-1">
                      <div className="bg-mint h-full w-[87%] transition-all duration-1000" />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Checklist Confirmation */}
            <div className="p-4 rounded-2xl bg-surface-elevated border border-border-subtle space-y-2 text-xs text-left">
              <div className="flex items-center gap-2 text-mint-text font-bold">
                <CheckCircle2 className="w-4 h-4 text-mint" />
                <span>Transfer gap resolved: Parametric non-zero boundary integrated</span>
              </div>
              <div className="flex items-center gap-2 text-mint-text font-bold">
                <CheckCircle2 className="w-4 h-4 text-mint" />
                <span>Reasoning confirmed through explain-back review</span>
              </div>
              <div className="flex items-center gap-2 text-mint-text font-bold">
                <CheckCircle2 className="w-4 h-4 text-mint" />
                <span>Confidence calibrated: Perception matches actual performance</span>
              </div>
            </div>

            {/* Navigation CTA */}
            <div className="pt-2 flex items-center justify-between">
              <Link
                to="/learning-xray"
                className="text-xs font-bold text-secondary hover:text-primary flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Learning X-Ray
              </Link>
              <Link
                to="/history"
                className="px-6 py-3 rounded-2xl font-extrabold text-xs bg-accent hover:bg-accent-deep text-white shadow-sm flex items-center gap-1.5"
              >
                <span>Save to Learning Journey</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

/* ── Section 25: Longitudinal Learning Journey History ─────────────── */
export const HistoryPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 pb-24">
      
      {/* Header */}
      <div className="space-y-1">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent">
          Longitudinal Model
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
          Your Learning Journey
        </h1>
        <p className="text-xs sm:text-sm text-secondary">
          Past diagnostic attempts dynamically calibrate future questions and test depth.
        </p>
      </div>

      {/* Trajectory Timeline (Section 25) */}
      <div className="studio-card p-6 sm:p-10 border border-border-subtle space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-primary uppercase tracking-wider">
            Quadratic Equations Trajectory
          </span>
          <span className="text-xs font-extrabold text-mint-text bg-mint-subtle px-2.5 py-0.5 rounded-full">
            +27% Total Growth
          </span>
        </div>

        {/* Milestone Steps */}
        <div className="py-6 flex items-center justify-between relative px-6 sm:px-16">
          <div className="absolute left-10 right-10 top-1/2 h-1 bg-border-subtle -translate-y-1/2 z-0" />
          
          <div className="relative z-10 flex flex-col items-center gap-1.5">
            <div className="w-10 h-10 rounded-2xl bg-surface border-2 border-border-subtle text-secondary font-mono text-xs font-bold flex items-center justify-center">
              60%
            </div>
            <span className="text-[11px] font-bold text-muted">Sep 1</span>
            <span className="text-[10px] text-secondary">Diagnostic</span>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-1.5">
            <div className="w-10 h-10 rounded-2xl bg-surface border-2 border-accent text-accent font-mono text-xs font-bold flex items-center justify-center">
              72%
            </div>
            <span className="text-[11px] font-bold text-muted">Sep 4</span>
            <span className="text-[10px] text-secondary">Intervention</span>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-1.5">
            <div className="w-12 h-12 rounded-2xl bg-accent text-white font-mono text-sm font-extrabold flex items-center justify-center shadow-sm">
              87%
            </div>
            <span className="text-[11px] font-extrabold text-accent">Today</span>
            <span className="text-[10px] font-bold text-mint-text">Reassessed</span>
          </div>
        </div>
      </div>

      {/* Misconception Tracking Board (Section 25) */}
      <div className="studio-card p-6 sm:p-8 border border-border-subtle space-y-4">
        <h3 className="text-sm font-extrabold text-primary uppercase tracking-wider">
          Persistent Misconception Registry
        </h3>

        <div className="space-y-3">
          
          <div className="p-4 rounded-2xl bg-surface-elevated border border-border-subtle flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-mint" />
              <div>
                <div className="font-bold text-primary">Inverse Operations in Factoring</div>
                <p className="text-[11px] text-secondary">Sign conservation verified across 4 attempts.</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-mint text-white">
              Resolved
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-surface-elevated border border-border-subtle flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-mint" />
              <div>
                <div className="font-bold text-primary">Concept Transfer ($a \neq 0$ Constraint)</div>
                <p className="text-[11px] text-secondary">Boundary logic successfully resolved in reassessment today.</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-mint text-white">
              Resolved
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-surface-elevated border-2 border-coral/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-coral" />
              <div>
                <div className="font-bold text-primary">Word Problem Translation</div>
                <p className="text-[11px] text-secondary">Translating speed-distance geometry into quadratic relations.</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-coral text-white">
              Active Focus
            </span>
          </div>

        </div>
      </div>

    </div>
  );
};

/* ── Sprint 2: Section 24 — Learn From Scratch Handoff Placeholder ── */
export const LearnFromScratchPlaceholderPage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-8 py-12 pb-24 text-center">
      <div className="studio-card p-8 sm:p-12 border border-border-subtle bg-surface space-y-6 shadow-sm">
        <div className="w-16 h-16 rounded-3xl bg-accent-subtle border border-accent/20 flex items-center justify-center mx-auto text-accent">
          <Sparkles className="w-8 h-8" />
        </div>

        <div className="space-y-3">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent bg-accent-subtle px-3 py-1 rounded-full border border-accent/20">
            Sprint 2 Handoff
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
            READY TO BUILD YOUR FOUNDATION
          </h1>
          <p className="text-sm sm:text-base text-secondary max-w-md mx-auto leading-relaxed">
            You chose to learn from the fundamentals.
            <br />
            Your personalized learning path will begin here.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-elevated border border-border-subtle max-w-sm mx-auto text-left space-y-2">
          <div className="text-xs font-bold text-primary flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-mint" />
            <span>Mode persisted: LEARN_FROM_SCRATCH</span>
          </div>
          <p className="text-[11px] text-secondary">
            Your self-assessment and chosen learning route are saved to your profile.
          </p>
        </div>

        <div className="pt-4">
          <Link
            to="/learn"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-extrabold text-xs sm:text-sm bg-surface border border-border-subtle text-primary hover:bg-surface-elevated transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
