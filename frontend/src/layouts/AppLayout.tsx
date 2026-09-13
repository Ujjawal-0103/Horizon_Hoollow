import React, { useEffect, useState, useRef } from 'react';
import { NavLink, Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  Compass, 
  BookOpen, 
  Activity, 
  Brain, 
  History as HistoryIcon,
  Sun, 
  Moon, 
  Sparkles, 
  Flame, 
  Menu, 
  X,
  LogOut,
  ShieldCheck,
  User as UserIcon,
  ChevronDown
} from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export const AppLayout: React.FC = () => {
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const checkServerHealth = async () => {
      try {
        const res = await api.getHealth();
        if (isMounted) setBackendHealthy(res?.status === 'ok');
      } catch (e) {
        if (isMounted) setBackendHealthy(false);
      }
    };
    checkServerHealth();
    const interval = setInterval(checkServerHealth, 20000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: Compass },
    { to: '/learn', label: 'My Learning', icon: BookOpen },
    { to: '/diagnostic', label: 'Diagnose', icon: Activity },
    { to: '/learning-xray', label: 'Progress', icon: Brain },
    { to: '/history', label: 'History', icon: HistoryIcon },
  ];

  const studentInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'S';

  return (
    <div className="min-h-screen flex flex-col bg-app text-primary transition-colors duration-200">
      
      {/* ── Top Navigation Bar (Section 6 & 13) ──────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-border-subtle bg-surface/90 backdrop-blur-md transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 rounded-xl border border-border-subtle text-secondary"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}

            <NavLink to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-2xl bg-accent text-white flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 group-hover:rotate-3">
                <Brain className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-primary flex items-center gap-1.5">
                  MindTrace
                  <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
                </span>
                <span className="text-[10px] font-semibold text-secondary -mt-0.5">
                  Intelligent Learning Studio
                </span>
              </div>
            </NavLink>
          </div>

          {/* Desktop Center Navigation Pills (Visible if Authenticated) */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1.5 bg-surface-elevated p-1.5 rounded-2xl border border-border-subtle">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to ||
                  (item.to !== '/' && location.pathname.startsWith(item.to));
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-surface text-accent shadow-sm border border-border-subtle'
                        : 'text-secondary hover:text-primary hover:bg-surface/50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-accent' : 'text-secondary'}`} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          )}

          {/* Right Toolbar: Streak, Theme Toggle, Profile/Auth */}
          <div className="flex items-center gap-2.5">
            
            {/* Learning Streak Pill */}
            {isAuthenticated && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gold-subtle border border-gold/30 text-gold-text text-xs font-extrabold">
                <Flame className="w-3.5 h-3.5 fill-gold text-gold" />
                <span>3 Day Streak</span>
              </div>
            )}

            {/* Theme Toggle (Sun/Moon) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-border-subtle bg-surface hover:bg-surface-elevated text-secondary hover:text-primary transition-all focus:outline-none"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-secondary" />
              ) : (
                <Sun className="w-4 h-4 text-gold" />
              )}
            </button>

            {/* Authenticated Student Profile & Account Menu */}
            {isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-2xl border border-border-subtle hover:border-accent bg-surface hover:bg-surface-elevated transition-all"
                >
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-accent to-pink text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {studentInitial}
                  </div>
                  <span className="hidden sm:inline text-xs font-bold text-primary">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-secondary" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-surface border border-border-subtle rounded-2xl p-2 shadow-lg space-y-1 z-50 animate-fadeIn text-xs">
                    <div className="p-2.5 rounded-xl bg-surface-elevated border border-border-subtle/50 space-y-0.5">
                      <div className="font-extrabold text-primary truncate">{user.name}</div>
                      <div className="text-[11px] text-secondary truncate">{user.email}</div>
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-accent-subtle text-accent-text">
                          Class {user.grade || 10} • {user.board || 'CBSE'}
                        </span>
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-secondary hover:text-primary hover:bg-surface-elevated font-medium transition-all"
                    >
                      <UserIcon className="w-4 h-4 text-accent" />
                      <span>Academic Profile</span>
                    </Link>

                    <Link
                      to="/privacy"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-secondary hover:text-primary hover:bg-surface-elevated font-medium transition-all"
                    >
                      <ShieldCheck className="w-4 h-4 text-mint" />
                      <span>Privacy & Data Ownership</span>
                    </Link>

                    <div className="border-t border-border-subtle my-1" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-coral-text hover:bg-coral-subtle/50 font-bold transition-all"
                    >
                      <LogOut className="w-4 h-4 text-coral" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Unauthenticated State: Log In & Register */
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-secondary hover:text-primary border border-border-subtle hover:bg-surface-elevated transition-all"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-accent hover:bg-accent-deep text-white shadow-sm transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}

          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && isAuthenticated && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
          <div className="w-64 h-full bg-surface border-r border-border-subtle p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <span className="font-bold text-sm text-primary">Navigation</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to ||
                  (item.to !== '/' && location.pathname.startsWith(item.to));
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-accent text-white shadow-sm'
                        : 'text-secondary hover:text-primary hover:bg-surface-elevated'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
            <div className="pt-4 border-t border-border-subtle space-y-2">
              <Link
                to="/privacy"
                className="flex items-center gap-2 text-xs font-bold text-secondary hover:text-primary"
              >
                <ShieldCheck className="w-4 h-4 text-mint" />
                <span>Privacy Notice</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 text-xs font-bold text-coral-text"
              >
                <LogOut className="w-4 h-4 text-coral" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Viewport Container ────────────────────────────────── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Outlet />
      </main>

      {/* ── Studio Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-border-subtle bg-surface/50 py-6 text-center text-xs text-secondary transition-colors duration-200">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-medium">MindTrace Studio • Longitudinal Learning Intelligence</p>
          <div className="flex items-center gap-3 text-secondary font-medium">
            <span>Class 10 CBSE Math</span>
            <span>•</span>
            <Link to="/privacy" className="hover:text-primary underline">Privacy Notice</Link>
            <span>•</span>
            <span className="capitalize">{theme} Mode</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
