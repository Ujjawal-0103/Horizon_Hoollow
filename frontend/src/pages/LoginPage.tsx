import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Mail, AlertCircle, ShieldCheck, Target, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FormField } from '../components/common/FormField';
import { PasswordField } from '../components/common/PasswordField';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { LearningMotif } from '../components/common/LearningMotif';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Where to redirect after login
  const from = (location.state as any)?.from?.pathname || '/';

  const isFormValid = email.trim().length > 0 && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim().toLowerCase(), password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-6 sm:py-12 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* ── LEFT COLUMN: Brand Identity ───────────────────────────── */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-subtle border border-accent/20 text-accent-deep dark:text-accent font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Student Authentication</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight leading-tight">
              Welcome back to <br />
              <span className="text-accent">MindTrace.</span>
            </h1>

            <p className="text-sm text-secondary leading-relaxed max-w-md">
              Log in to resume your active learning diagnostics, review your conceptual knowledge map, and conquer misconceptions.
            </p>
          </div>

          <LearningMotif currentStage="diagnose" />

          <div className="p-4 rounded-2xl bg-surface border border-border-subtle flex items-center gap-3 text-xs text-secondary shadow-xs">
            <ShieldCheck className="w-5 h-5 text-mint shrink-0" />
            <span>Encrypted student session. Your learning trajectory is exclusively owned by you.</span>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Authentication Form ─────────────────────── */}
        <div className="lg:col-span-6">
          <div className="studio-card p-6 sm:p-9 border border-border-subtle bg-surface shadow-sm space-y-6">
            
            <div className="border-b border-border-subtle pb-4 space-y-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-primary tracking-tight">
                Log In to Your Studio
              </h2>
              <p className="text-xs text-secondary">
                Enter your credentials to access your student profile.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-coral-subtle/50 border border-coral/30 flex items-center gap-2.5 text-xs text-coral-text font-bold animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-coral shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <FormField label="Email Address" icon={<Mail className="w-4 h-4" />} required>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.test"
                  className="w-full bg-surface-elevated border border-border-subtle rounded-2xl pl-11 pr-4 py-3 text-sm text-primary font-medium placeholder-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                />
              </FormField>

              <PasswordField
                id="login-password"
                label="Password"
                value={password}
                onChange={setPassword}
                placeholder="Enter your password"
                showStrengthMeter={false}
              />

              <div className="pt-2">
                <PrimaryButton
                  type="submit"
                  label="Log In"
                  isLoading={isSubmitting}
                  disabled={!isFormValid}
                />
              </div>

            </form>

            <div className="text-center pt-3 border-t border-border-subtle text-xs text-secondary">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-extrabold text-accent hover:underline">
                Create student account
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
