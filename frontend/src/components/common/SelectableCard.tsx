import React from 'react';
import { Check } from 'lucide-react';

export interface SelectableCardProps {
  id?: string | number;
  label: string | number;
  sublabel?: string;
  badge?: string;
  icon?: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

export const SelectableCard: React.FC<SelectableCardProps> = ({
  label,
  sublabel,
  badge,
  icon,
  isSelected,
  onClick,
  size = 'md',
  className = '',
  disabled = false,
}) => {
  const sizeClasses = {
    sm: 'py-2 px-2.5 min-h-[44px]',
    md: 'py-3 px-3.5 min-h-[56px]',
    lg: 'py-4 px-4 min-h-[72px]',
  }[size];

  return (
    <button
      type="button"
      role="button"
      aria-pressed={isSelected}
      disabled={disabled}
      onClick={onClick}
      className={`relative w-full rounded-2xl text-left transition-all duration-200 outline-none select-none flex flex-col justify-center ${sizeClasses} ${
        isSelected
          ? 'bg-accent-subtle border-2 border-accent text-accent-deep dark:text-accent shadow-sm scale-[1.02] ring-2 ring-accent/20'
          : 'bg-surface-elevated border border-border-subtle text-primary hover:border-border-hover hover:bg-surface hover:-translate-y-0.5'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      {/* Checkmark Indicator Badge */}
      {isSelected && (
        <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-accent text-white flex items-center justify-center shadow-xs animate-scaleIn">
          <Check className="w-2.5 h-2.5 stroke-[3]" />
        </span>
      )}

      {/* Optional Badge */}
      {badge && (
        <span
          className={`absolute top-2 right-2 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${
            isSelected
              ? 'bg-accent text-white'
              : 'bg-surface border border-border-subtle text-secondary'
          }`}
        >
          {badge}
        </span>
      )}

      <div className="flex items-center gap-2">
        {icon && (
          <div
            className={`shrink-0 transition-colors ${
              isSelected ? 'text-accent' : 'text-secondary'
            }`}
          >
            {icon}
          </div>
        )}

        <div className="flex flex-col min-w-0 pr-3">
          <span
            className={`truncate font-extrabold tracking-tight ${
              size === 'lg' ? 'text-base' : size === 'md' ? 'text-sm' : 'text-xs'
            } ${isSelected ? 'text-accent-deep dark:text-white' : 'text-primary'}`}
          >
            {label}
          </span>
          {sublabel && (
            <span
              className={`truncate text-[11px] font-medium leading-tight mt-0.5 ${
                isSelected
                  ? 'text-accent-text/80 dark:text-accent-subtle/80'
                  : 'text-secondary'
              }`}
            >
              {sublabel}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};
