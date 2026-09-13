import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Trash2, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const PrivacyNoticePage: React.FC = () => {
  const { user, deleteAccount } = useAuth();
  const navigate = useNavigate();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount();
      navigate('/login', { replace: true });
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-8 pb-24">
      
      {/* Header */}
      <div className="space-y-2 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint-subtle text-mint-text text-xs font-bold border border-mint/20">
          <ShieldCheck className="w-4 h-4 text-mint" />
          <span>Privacy & Student Data Ownership</span>
        </div>
        <h1 className="text-3xl font-extrabold text-primary tracking-tight">
          How MindTrace Protects Your Learning Data
        </h1>
        <p className="text-xs sm:text-sm text-secondary max-w-lg mx-auto">
          We believe diagnostic educational intelligence should be completely transparent, secure, and owned by you.
        </p>
      </div>

      {/* Main Privacy Card */}
      <div className="studio-card p-6 sm:p-10 border border-border-subtle bg-surface space-y-8 shadow-sm">
        
        {/* Section 1: What We Store */}
        <div className="space-y-3">
          <h2 className="text-base font-extrabold text-primary flex items-center gap-2">
            <Lock className="w-4 h-4 text-accent" />
            <span>1. What Learning Data We Store</span>
          </h2>
          <p className="text-xs sm:text-sm text-secondary leading-relaxed">
            MindTrace stores only the information strictly necessary to diagnose your conceptual understanding and track your progress:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
            <div className="p-3.5 rounded-2xl bg-surface-elevated border border-border-subtle space-y-1">
              <span className="font-bold text-primary">Academic Profile</span>
              <p className="text-secondary">Your name, class/grade, and curriculum board.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-surface-elevated border border-border-subtle space-y-1">
              <span className="font-bold text-primary">Learning Context</span>
              <p className="text-secondary">Your active subject, topic, and learning goal.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-surface-elevated border border-border-subtle space-y-1">
              <span className="font-bold text-primary">Self-Assessments</span>
              <p className="text-secondary">What you believe you know across curriculum subtopics.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-surface-elevated border border-border-subtle space-y-1">
              <span className="font-bold text-primary">Diagnostic Signals</span>
              <p className="text-secondary">Question attempts, step reasoning, and confidence calibration.</p>
            </div>
          </div>
        </div>

        {/* Section 2: Data Minimization */}
        <div className="space-y-3 border-t border-border-subtle pt-6">
          <h2 className="text-base font-extrabold text-primary flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-mint" />
            <span>2. Data Minimization & Privacy</span>
          </h2>
          <p className="text-xs sm:text-sm text-secondary leading-relaxed">
            We follow strict data minimization:
          </p>
          <ul className="space-y-2 text-xs text-secondary list-disc pl-5">
            <li><strong className="text-primary">No Advertising:</strong> Your learning data is never sold, shared with advertisers, or used for third-party marketing.</li>
            <li><strong className="text-primary">Isolated Access:</strong> Your diagnostic evaluations and reasoning logs are protected by backend ownership authorization. No other student can see your scores or struggles.</li>
            <li><strong className="text-primary">Password Security:</strong> Passwords are protected using industry-standard bcrypt hashes and are never stored in plaintext.</li>
          </ul>
        </div>

        {/* Section 3: Student Data Ownership & Account Deletion */}
        <div className="space-y-3 border-t border-border-subtle pt-6">
          <h2 className="text-base font-extrabold text-primary flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-coral" />
            <span>3. Right to Delete Your Data</span>
          </h2>
          <p className="text-xs sm:text-sm text-secondary leading-relaxed">
            You have full ownership of your learning footprint. You can permanently delete your account, academic context, self-assessments, and diagnostic records at any time.
          </p>

          {deleteError && (
            <div className="p-3 rounded-xl bg-coral-subtle text-xs text-coral-text font-bold">
              {deleteError}
            </div>
          )}

          {user && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="px-4 py-2.5 rounded-xl text-xs font-extrabold text-coral-text bg-coral-subtle hover:bg-coral hover:text-white border border-coral/30 transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account & Purge Learning Data</span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-secondary hover:text-primary transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Studio</span>
          </Link>

          {user && (
            <span className="text-xs text-secondary font-mono">
              Signed in as: <strong className="text-primary">{user.email}</strong>
            </span>
          )}
        </div>

      </div>

      {/* Account Deletion Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="studio-card max-w-md w-full p-6 sm:p-8 bg-surface border-2 border-coral/40 space-y-5 shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-coral-subtle flex items-center justify-center text-coral mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-extrabold text-primary">
                Permanently Delete Your Account?
              </h3>
              <p className="text-xs text-secondary leading-relaxed">
                This action is irreversible. All of your academic contexts, self-assessments, question attempts, and diagnostic history will be permanently wiped.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-secondary bg-surface-elevated border border-border-subtle hover:text-primary transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteAccount}
                className="py-2.5 px-4 rounded-xl text-xs font-extrabold text-white bg-coral hover:bg-coral-deep shadow-sm transition-all disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Everything'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
