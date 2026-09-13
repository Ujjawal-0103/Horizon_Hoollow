import React from 'react';
import { Eye, Activity, BookOpen, TrendingUp } from 'lucide-react';

export interface LearningMotifProps {
  currentStage?: 'understand' | 'diagnose' | 'learn' | 'improve';
  className?: string;
  condensed?: boolean;
}

export const LearningMotif: React.FC<LearningMotifProps> = ({
  currentStage = 'understand',
  className = '',
  condensed = false,
}) => {
  const steps = [
    { key: 'understand', label: 'Understand', icon: Eye, color: 'text-accent' },
    { key: 'diagnose', label: 'Diagnose', icon: Activity, color: 'text-pink' },
    { key: 'learn', label: 'Learn', icon: BookOpen, color: 'text-sky' },
    { key: 'improve', label: 'Improve', icon: TrendingUp, color: 'text-mint' },
  ];

  if (condensed) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {steps.map((step, idx) => {
          const isActive = step.key === currentStage;
          return (
            <React.Fragment key={step.key}>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    isActive
                      ? 'bg-accent ring-4 ring-accent/20 scale-125'
                      : 'bg-border-hover'
                  }`}
                />
                <span
                  className={`text-[11px] font-bold ${
                    isActive ? 'text-primary font-extrabold' : 'text-secondary'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className="w-4 h-0.5 bg-border-subtle rounded-full" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-3xl bg-surface-elevated/70 border border-border-subtle backdrop-blur-xs space-y-3 ${className}`}>
      <div className="flex items-center justify-between text-xs font-bold text-secondary">
        <span className="uppercase tracking-widest text-[10px] text-accent">MindTrace Learning Cycle</span>
        <span className="text-[11px] text-muted">Continuous Precision</span>
      </div>

      <div className="relative flex items-center justify-between">
        {/* Connecting line */}
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-0.5 bg-border-subtle z-0" />

        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = step.key === currentStage;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center gap-1.5 group">
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-200 border ${
                  isActive
                    ? 'bg-accent text-white border-accent shadow-sm scale-110'
                    : 'bg-surface border-border-subtle text-secondary group-hover:border-accent/40 group-hover:text-primary'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`text-[11px] font-bold transition-colors ${
                  isActive ? 'text-primary font-extrabold' : 'text-secondary'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
