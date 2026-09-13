import React from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';

export interface PrimaryButtonProps {
  label: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
  id?: string;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  onClick,
  type = 'button',
  disabled = false,
  isLoading = false,
  icon,
  variant = 'primary',
  className = '',
  id,
}) => {
  const variantStyles = {
    primary:
      'bg-accent hover:bg-accent-deep text-white shadow-sm hover:shadow-card-hover focus:ring-accent/40',
    secondary:
      'bg-accent-subtle hover:bg-accent-subtle/80 text-accent-deep dark:text-accent-primary border border-accent/20 focus:ring-accent/20',
    danger:
      'bg-coral hover:bg-coral/90 text-white shadow-sm focus:ring-coral/40',
  }[variant];

  return (
    <button
      id={id}
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`group relative w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2.5 focus:outline-none focus:ring-4 ${variantStyles} ${
        disabled || isLoading
          ? 'opacity-50 cursor-not-allowed transform-none'
          : 'transform hover:-translate-y-0.5 cursor-pointer'
      } ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>Please wait...</span>
        </>
      ) : (
        <>
          <span>{label}</span>
          {icon ? (
            icon
          ) : (
            <ArrowRight className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
          )}
        </>
      )}
    </button>
  );
};
