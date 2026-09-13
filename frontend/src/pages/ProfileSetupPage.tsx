import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, BookOpen, Compass, CheckCircle2, User } from 'lucide-react';
import { api } from '../services/api';
import { SelectableCard } from '../components/common/SelectableCard';
import { FormField } from '../components/common/FormField';
import { PrimaryButton } from '../components/common/PrimaryButton';

import { useAuth } from '../context/AuthContext';

export const ProfileSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(() => user?.name || 'Aarav Sharma');
  const [grade, setGrade] = useState<number>(() => user?.grade || 10);
  const [board, setBoard] = useState(() => user?.board || 'CBSE');
  const [subject, setSubject] = useState('Mathematics');
  const [topic, setTopic] = useState('Quadratic Equations');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (user) {
        await api.updateProfile('me', {
          name,
          grade,
          board
        });
        await refreshUser();
      } else {
        const response = await api.createProfile({
          name,
          grade,
          board,
          subject,
          targetTopic: topic,
        });

        if (response.success && response.data?.id) {
          localStorage.setItem('mindtrace_user_id', response.data.id);
          localStorage.setItem('mindtrace_user_name', name);
        }
      }
      navigate('/learn');
    } catch (err) {
      console.warn('Profile save fallback to local cache:', err);
      navigate('/learn');
    } finally {
      setIsSubmitting(false);
    }
  };

  const classOptions = [
    { value: 8, label: '8', sub: 'Class 8' },
    { value: 9, label: '9', sub: 'Class 9' },
    { value: 10, label: '10', sub: 'Class 10' },
    { value: 11, label: '11', sub: 'Class 11' },
    { value: 12, label: '12', sub: 'Class 12' },
  ];

  const boardOptions = [
    { value: 'CBSE', label: 'CBSE', sub: 'Central Board' },
    { value: 'ICSE', label: 'ICSE', sub: 'Indian Certificate' },
    { value: 'State Board', label: 'State Board', sub: 'State Syllabus' },
  ];

  const subjectOptions = [
    { title: 'Mathematics', badge: 'Active Domain', available: true },
    { title: 'Physics', badge: 'Coming Soon', available: false },
    { title: 'Chemistry', badge: 'Coming Soon', available: false },
    { title: 'Computer Science', badge: 'Coming Soon', available: false },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-6 pb-16">
      
      {/* Header */}
      <div className="space-y-2 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-subtle text-accent-deep dark:text-accent text-xs font-bold border border-accent/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 1: Academic Calibration</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">
          Let's Understand Where You Are.
        </h1>
        <p className="text-sm sm:text-base text-secondary max-w-md mx-auto">
          Before we diagnose you, tell us what you're currently studying so we can tailor the evaluation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Student Name */}
        <div className="studio-card p-6 border border-border-subtle bg-surface space-y-3">
          <FormField label="What should we call you?" icon={<User className="w-4 h-4" />} required>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-elevated border border-border-subtle rounded-2xl pl-11 pr-4 py-3 text-sm text-primary font-bold focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              placeholder="Your name"
            />
          </FormField>
        </div>

        {/* Class Selection */}
        <div className="studio-card p-6 border border-border-subtle bg-surface space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-extrabold text-secondary uppercase tracking-wider">
              What class are you in?
            </label>
            <span className="text-[11px] text-muted">Select your grade</span>
          </div>
          <div className="grid grid-cols-5 gap-2.5">
            {classOptions.map((c) => (
              <SelectableCard
                key={c.value}
                label={c.label}
                sublabel={c.sub}
                isSelected={grade === c.value}
                onClick={() => setGrade(c.value)}
                size="md"
                className="text-center items-center justify-center py-3"
              />
            ))}
          </div>
        </div>

        {/* Education Board */}
        <div className="studio-card p-6 border border-border-subtle bg-surface space-y-3">
          <label className="block text-xs font-extrabold text-secondary uppercase tracking-wider">
            Which education board?
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {boardOptions.map((b) => (
              <SelectableCard
                key={b.value}
                label={b.label}
                sublabel={b.sub}
                isSelected={board === b.value}
                onClick={() => setBoard(b.value)}
                size="md"
              />
            ))}
          </div>
        </div>

        {/* Subject Selection */}
        <div className="studio-card p-6 border border-border-subtle bg-surface space-y-3">
          <label className="block text-xs font-extrabold text-secondary uppercase tracking-wider">
            What subject are you studying?
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {subjectOptions.map((s) => (
              <SelectableCard
                key={s.title}
                label={s.title}
                badge={s.badge}
                disabled={!s.available}
                isSelected={subject === s.title}
                onClick={() => {
                  if (s.available) setSubject(s.title);
                }}
                size="md"
              />
            ))}
          </div>
        </div>

        {/* Active Target Topic Card */}
        <div className="studio-card p-6 border-2 border-accent/40 bg-accent-subtle/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-accent uppercase tracking-wider">
              Selected Target Topic
            </span>
            <span className="text-[11px] font-bold text-accent-deep dark:text-accent bg-accent-subtle px-2 py-0.5 rounded-full border border-accent/20">
              Active Module
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-surface border border-accent/30 flex items-center justify-between shadow-xs">
            <div className="space-y-0.5">
              <div className="text-base font-extrabold text-primary">{topic}</div>
              <p className="text-xs text-secondary">
                Standard form, factorization, quadratic formula, discriminant, and word problems.
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <PrimaryButton
            type="submit"
            label="Save & Continue to Learning Journey"
            isLoading={isSubmitting}
            className="py-4 text-base"
          />
        </div>

      </form>
    </div>
  );
};
