import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  label: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps,
  label
}) => {
  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs font-bold text-accent tracking-widest uppercase">
          0{currentStep} / 0{totalSteps}
        </span>
        <span className="text-border-subtle">•</span>
        <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
          {label}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalSteps }).map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx + 1 === currentStep
                ? 'w-8 bg-accent'
                : idx + 1 < currentStep
                ? 'w-4 bg-semantic-success'
                : 'w-4 bg-border-subtle'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
