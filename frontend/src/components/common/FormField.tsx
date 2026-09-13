import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface FormFieldProps {
  label: string;
  icon?: React.ReactNode;
  error?: string | null;
  helperText?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  icon,
  error,
  helperText,
  required = false,
  className = '',
  children,
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-secondary uppercase tracking-wider">
          {label} {required && <span className="text-coral">*</span>}
        </label>
        {helperText && !error && (
          <span className="text-[11px] text-muted">{helperText}</span>
        )}
      </div>

      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-accent transition-colors pointer-events-none">
            {icon}
          </div>
        )}
        {children}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-coral-text font-bold pt-0.5 animate-fadeIn">
          <AlertCircle className="w-3.5 h-3.5 text-coral shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
