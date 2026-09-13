import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Brain, 
  User, 
  Mail, 
  AlertCircle, 
  CheckCircle2, 
  Target, 
  Zap, 
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SelectableCard } from '../components/common/SelectableCard';
import { FormField } from '../components/common/FormField';
import { PasswordField } from '../components/common/PasswordField';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { LearningMotif } from '../components/common/LearningMotif';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [classGrade, setClassGrade] = useState('10');
  const [board, setBoard] = useState('CBSE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Class options with numbers and badges
  const classOptions = [
    { value: '8', label: '8', sub: 'Class 8' },
    { value: '9', label: '9', sub: 'Class 9' },
    { value: '10', label: '10', sub: 'Class 10' },
    { value: '11', label: '11', sub: 'Class 11' },
    { value: '12', label: '12', sub: 'Class 12' },
    { value: 'College / Other', label: 'Other', sub: 'College / Adult' },
  ];

  // Board options with clear descriptive sublabels
  const boardOptions = [
    { value: 'CBSE', label: 'CBSE', sub: 'Central Board' },
    { value: 'ICSE', label: 'ICSE', sub: 'Indian Certificate' },
    { value: 'State Board', label: 'State', sub: 'State Syllabus' },
    { value: 'Other', label: 'Other', sub: 'International' },
  ];

  // Validation
  const isFormValid =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 6 &&
    password === confirmPassword &&
    Boolean(classGrade) &&
    Boolean(board);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please provide your full name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        grade: parseInt(classGrade, 10) || 10,
        board,
      });
      navigate('/', { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-6 sm:py-10 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ── LEFT COLUMN: Brand Identity & Learning Showcase ────────── */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          
          {/* Brand header */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-subtle border border-accent/20 text-accent-deep dark:text-accent font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Intelligent Learning Studio</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight leading-tight">
              Understand <br />
              <span className="text-accent">how you learn.</span>
            </h1>

            <p className="text-sm text-secondary leading-relaxed">
              "Your learning journey starts with understanding where you are."
            </p>
          </div>

          {/* Visual Motif: Understand -> Diagnose -> Learn -> Improve */}
          <LearningMotif currentStage="understand" />

          {/* Value props */}
          <div className="p-5 rounded-3xl bg-surface border border-border-subtle space-y-3.5 shadow-sm">
            <div className="text-xs font-extrabold text-secondary uppercase tracking-wider">
              Why MindTrace?
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-mint-subtle text-mint flex items-center justify-center shrink-0 mt-0.5">
                <Target className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-primary block">Precision Diagnostics</span>
                <span className="text-secondary">Detect hidden conceptual gaps before exams, not after.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-accent-subtle text-accent flex items-center justify-center shrink-0 mt-0.5">
                <Brain className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-primary block">Living Knowledge X-Ray</span>
                <span className="text-secondary">Dynamic longitudinal modeling that tracks your true mastery.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-sky-subtle text-sky flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-primary block">Targeted Interventions</span>
                <span className="text-secondary">Actionable micro-steps designed to fix specific misunderstandings.</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-secondary font-medium px-2">
            <ShieldCheck className="w-3.5 h-3.5 text-mint" />
            <span>Zero ad tracking. Your academic diagnostic data is strictly private.</span>
          </div>

        </div>

        {/* ── RIGHT COLUMN: Interactive Registration Studio Form ─────── */}
        <div className="lg:col-span-7">
          <div className="studio-card p-6 sm:p-9 border border-border-subtle bg-surface shadow-sm space-y-7">
            
            {/* Form Title & Progress info */}
            <div className="border-b border-border-subtle pb-5 space-y-1">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-extrabold text-primary tracking-tight">
                  Create Your Learning Profile
                </h2>
                <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-accent-subtle text-accent-deep dark:text-accent">
                  Step 1 of 2
                </span>
              </div>
              <p className="text-xs sm:text-sm text-secondary">
                Let's calibrate MindTrace for your curriculum and grade level.
              </p>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-coral-subtle/50 border border-coral/30 flex items-center gap-2.5 text-xs text-coral-text font-bold animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-coral shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* ── GROUP 1: Student Details ───────────────────────── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-extrabold">
                    1
                  </span>
                  <h3 className="text-xs font-extrabold text-secondary uppercase tracking-wider">
                    Student Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Full Name" icon={<User className="w-4 h-4" />} required>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      className="w-full bg-surface-elevated border border-border-subtle rounded-2xl pl-11 pr-4 py-3 text-sm text-primary font-medium placeholder-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                    />
                  </FormField>

                  <FormField label="Email Address" icon={<Mail className="w-4 h-4" />} required>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="aarav@example.test"
                      className="w-full bg-surface-elevated border border-border-subtle rounded-2xl pl-11 pr-4 py-3 text-sm text-primary font-medium placeholder-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                    />
                  </FormField>
                </div>
              </div>

              {/* ── GROUP 2: Academic Context (Class & Board) ───────── */}
              <div className="space-y-4 pt-2 border-t border-border-subtle">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-extrabold">
                      2
                    </span>
                    <h3 className="text-xs font-extrabold text-secondary uppercase tracking-wider">
                      Academic Context
                    </h3>
                  </div>
                  <span className="text-[11px] text-muted">Tailors diagnostic questions</span>
                </div>

                {/* Class Selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-primary">
                    What class or grade are you in?
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {classOptions.map((item) => (
                      <SelectableCard
                        key={item.value}
                        label={item.label}
                        sublabel={item.sub}
                        isSelected={classGrade === item.value}
                        onClick={() => setClassGrade(item.value)}
                        size="sm"
                        className="text-center items-center justify-center py-2.5"
                      />
                    ))}
                  </div>
                </div>

                {/* Board Selection */}
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-primary">
                    Curriculum Board
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {boardOptions.map((item) => (
                      <SelectableCard
                        key={item.value}
                        label={item.label}
                        sublabel={item.sub}
                        isSelected={board === item.value}
                        onClick={() => setBoard(item.value)}
                        size="md"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* ── GROUP 3: Security & Access ─────────────────────── */}
              <div className="space-y-4 pt-2 border-t border-border-subtle">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-extrabold">
                    3
                  </span>
                  <h3 className="text-xs font-extrabold text-secondary uppercase tracking-wider">
                    Security Credentials
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <PasswordField
                    id="reg-password"
                    label="Password"
                    value={password}
                    onChange={setPassword}
                    showStrengthMeter={true}
                    placeholder="Min. 6 characters"
                  />

                  <PasswordField
                    id="reg-confirm-password"
                    label="Confirm Password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder="Re-enter password"
                    error={
                      confirmPassword && password !== confirmPassword
                        ? 'Passwords do not match'
                        : null
                    }
                  />
                </div>
              </div>

              {/* ── Primary Action CTA ──────────────────────────────── */}
              <div className="pt-3 space-y-2">
                <PrimaryButton
                  type="submit"
                  label="Create My Learning Profile"
                  isLoading={isSubmitting}
                  disabled={!isFormValid}
                  className="py-4"
                />

                {!isFormValid && (
                  <p className="text-center text-[11px] text-muted">
                    Please fill all required fields to continue.
                  </p>
                )}
              </div>

            </form>

            {/* Switch to Login */}
            <div className="text-center pt-4 border-t border-border-subtle text-xs text-secondary">
              Already have an account?{' '}
              <Link to="/login" className="font-extrabold text-accent hover:underline">
                Log In
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
