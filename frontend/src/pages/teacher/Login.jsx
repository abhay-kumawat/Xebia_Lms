import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ShieldAlert, CheckCircle, Eye, EyeOff, ArrowRight, Sparkles, BookOpen, GraduationCap, Users } from 'lucide-react';
import { useTeacherAuth } from '@/hooks/useTeacherAuth';

export default function TeacherLoginPage() {
  const { login } = useTeacherAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState(
    location.state?.email === 'teacher@xebia.com' ? 'teacher123' : ''
  );
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.successMsg || '');

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const validate = () => {
    const e = {};
    if (!email) e.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Please enter a valid email address';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email, password);
      navigate('/teacher/dashboard', { replace: true });
    } catch (err) {
      setServerError(err.message || 'Invalid Email or Password.');
    } finally {
      setLoading(false);
    }
  };

  const autofillCredentials = () => {
    setEmail('teacher@xebia.com');
    setPassword('teacher123');
  };

  const stats = [
    { icon: BookOpen, label: 'Curriculums', value: '120+' },
    { icon: Users, label: 'Active Students', value: '1,500+' },
    { icon: GraduationCap, label: 'Passing Rate', value: '94%' },
  ];

  return (
    <div className="flex min-h-screen bg-[#080D09] select-none text-slate-100">

      {/* ── LEFT BRANDING PANEL ── */}
      <div className="relative hidden lg:flex lg:w-[52%] flex-col justify-between overflow-hidden p-12">

        {/* Layered gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#06180F] via-[#040D0A] to-[#020504]" />
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/40 via-transparent to-teal-900/30" />

        {/* Grid mesh */}
        <div className="absolute inset-0 opacity-[0.05]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="teacher-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(52,211,153,0.8)" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#teacher-grid)" />
          </svg>
        </div>

        {/* Glowing orbs */}
        <motion.div
          className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
            <Sparkles className="h-5.5 w-5.5" />
          </div>
          <span className="text-lg font-black tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            Xebia Instructor Academy
          </span>
        </div>

        {/* Center Tagline */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4.5 py-1.5 text-xs font-bold text-emerald-400"
          >
            <span>Instructor Workspace v1.2</span>
          </motion.div>

          <h1 className="text-4xl font-extrabold leading-tight text-white md:text-5xl">
            Powering Next-Gen <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Enterprise Education.
            </span>
          </h1>

          <p className="text-sm leading-relaxed text-slate-400">
            Publish courses, configure assessments, monitor student progress, and analyze training statistics from a single centralized dashboard.
          </p>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-6 border-t border-white/[0.08] pt-8">
            {stats.map((s, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-400">
                  <s.icon className="h-4.5 w-4.5" />
                  <span className="text-base font-black text-white">{s.value}</span>
                </div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-[11px] text-slate-500 font-medium">
          © 2026 Xebia Academy Global. All rights reserved.
        </div>

      </div>

      {/* ── RIGHT LOGIN FORM PANEL ── */}
      <div className="flex w-full lg:w-[48%] flex-col justify-center bg-[#070907] px-6 py-12 md:px-16 lg:px-20 border-l border-white/[0.04]">
        
        <div className="mx-auto w-full max-w-md space-y-8">
          
          <div className="space-y-3.5">
            <h2 className="text-2xl font-black tracking-tight text-white">Teacher Portal Sign In</h2>
            <p className="text-xs text-slate-400">
              Sign in with your enterprise teacher credentials. Click below to auto-fill the demo account.
            </p>
            
            {/* Auto-fill trigger button */}
            <button
              onClick={autofillCredentials}
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer border-dashed"
            >
              <span>Auto-Fill Demo Account</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Server Error Alert */}
            <AnimatePresence>
              {serverError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-semibold text-red-400"
                >
                  <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
                  <span>{serverError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full rounded-2xl border bg-white/[0.02] py-3 pl-11 pr-4 text-sm text-slate-200 outline-none transition-all ${
                    errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-white/[0.08] focus:border-emerald-500'
                  }`}
                  placeholder="name@xebia.com"
                />
              </div>
              {errors.email && <p className="text-[10px] font-semibold text-red-500">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full rounded-2xl border bg-white/[0.02] py-3 pl-11 pr-11 text-sm text-slate-200 outline-none transition-all ${
                    errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-white/[0.08] focus:border-emerald-500'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 cursor-pointer border-0 bg-transparent"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
              {errors.password && <p className="text-[10px] font-semibold text-red-500">{errors.password}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:from-emerald-600 hover:to-teal-700 hover:shadow-emerald-950/20 active:scale-[0.98] disabled:opacity-50 cursor-pointer border-0 mt-3"
            >
              {loading ? 'Signing in...' : 'Sign In as Teacher'}
            </button>

          </form>

          {/* Selector Switch Back Button */}
          <div className="text-center pt-4">
            <Link
              to="/"
              className="text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
            >
              ← Back to Portal Selection
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
