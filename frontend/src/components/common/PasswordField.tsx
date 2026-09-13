import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

export interface PasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string | null;
  showStrengthMeter?: boolean;
  id?: string;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  value,
  onChange,
  label = 'Password',
  placeholder = '••••••••',
  required = true,
  error,
  showStrengthMeter = false,
  id = 'password-input',
}) => {
  const [showPassword, setShowPassword] = useState(false);

  // Compute strength
  const getStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-transparent', width: 'w-0' };
    if (pwd.length < 6) {
      return { score: 1, label: 'Weak (min. 6 chars)', color: 'bg-coral', width: 'w-1/3' };
    }
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);

    const varietyCount = [hasSpecial, hasNumber, hasUpper, hasLower].filter(Boolean).length;

    if (pwd.length >= 8 && varietyCount >= 3) {
      return { score: 3, label: 'Strong password', color: 'bg-mint', width: 'w-full' };
    }
    if (pwd.length >= 6 && varietyCount >= 2) {
      return { score: 2, label: 'Fair password', color: 'bg-gold', width: 'w-2/3' };
    }
    return { score: 1, label: 'Weak', color: 'bg-coral', width: 'w-1/3' };
  };

  const strength = getStrength(value);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-xs font-bold text-secondary uppercase tracking-wider">
          {label} {required && <span className="text-coral">*</span>}
        </label>
        {showStrengthMeter && value.length > 0 && (
          <span className="text-[11px] font-bold text-secondary">{strength.label}</span>
        )}
      </div>

      <div className="relative group">
        <Lock className="w-4 h-4 text-secondary absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-accent transition-colors pointer-events-none" />
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-surface-elevated border rounded-2xl pl-11 pr-11 py-3 text-sm text-primary font-medium placeholder-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all ${
            error ? 'border-coral/50' : 'border-border-subtle'
          }`}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors p-1"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Strength indicator bar */}
      {showStrengthMeter && value.length > 0 && (
        <div className="h-1.5 w-full bg-surface-elevated rounded-full overflow-hidden mt-1.5 border border-border-subtle">
          <div
            className={`h-full ${strength.color} ${strength.width} transition-all duration-300 rounded-full`}
          />
        </div>
      )}

      {error && (
        <p className="text-xs text-coral-text font-bold pt-0.5">{error}</p>
      )}
    </div>
  );
};
