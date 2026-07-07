import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ShieldAlert, CheckCircle, Eye, EyeOff, ArrowRight, Sparkles, BookOpen, Trophy, Users } from 'lucide-react';
import { useStudentAuth } from '@/hooks/useStudentAuth';

export default function StudentLoginPage() {
  const { login } = useStudentAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState(
    location.state?.email === 'abhay.kumawat@xebia.com' ? 'student123' : ''
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
      const user = await login(email, password);
      const userRole = user.role?.toLowerCase();
      if (userRole === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (err) {
      setServerError(err.message || 'Invalid Email or Password.');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { icon: BookOpen, label: 'Courses', value: '200+' },
    { icon: Users, label: 'Students', value: '12K+' },
    { icon: Trophy, label: 'Certifications', value: '500+' },
  ];

  return (
    <div className="flex min-h-screen bg-[#09090E] select-none">

      {/* ── LEFT BRANDING PANEL ── */}
      <div className="relative hidden lg:flex lg:w-[52%] flex-col justify-between overflow-hidden p-12">

        {/* Layered gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0b2e] via-[#0f0a1f] to-[#07060f]" />
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/40 via-transparent to-indigo-900/30" />

        {/* Grid mesh */}
        <div className="absolute inset-0 opacity-[0.07]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="login-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(167,139,250,0.8)" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#login-grid)" />
          </svg>
        </div>

        {/* Glowing orbs */}
        <motion.div
          className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div
          className="absolute top-[40%] right-[10%] w-[300px] h-[300px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.10) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-lg shadow-purple-900/40 ring-1 ring-white/10">
              <img src="/assets/Logo-Purple.png" alt="Xebia" className="h-7 w-7 object-contain brightness-200" />
            </div>
            <div>
              <p className="text-lg font-black text-white tracking-tight">Xebia Academy</p>
              <p className="text-[10px] text-purple-300/70 font-medium uppercase tracking-widest">Learning Platform</p>
            </div>
          </div>
        </div>

        {/* Main copy */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-xs font-semibold text-purple-300">AI-Powered Learning Experience</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-5xl font-black text-white leading-[1.1] tracking-tight"
            >
              Accelerate Your{' '}
              <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-indigo-400 bg-clip-text text-transparent">
                Career Growth
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="text-base text-slate-400 leading-relaxed max-w-sm"
            >
              Access world-class enterprise training programs, certifications, and hands-on projects — all in one place.
            </motion.p>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex gap-6"
          >
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <Icon className="h-4 w-4 text-purple-400" />
                  <span className="text-xl font-black text-white">{value}</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">{label}</span>
              </div>
            ))}
          </motion.div>

          {/* Testimonial */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.5 }}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-sm"
          >
            <p className="text-sm text-slate-300 leading-relaxed italic">
              "Xebia Academy transformed how our team learns. The structured curriculum and real-world projects
              helped us close critical skill gaps in under 3 months."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-black text-white">
                R
              </div>
              <div>
                <p className="text-xs font-bold text-white">Rahul Sharma</p>
                <p className="text-[10px] text-slate-500">Engineering Lead, Tech Corp</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom copyright */}
        <div className="relative z-10">
          <p className="text-[10px] text-slate-600">© 2026 Xebia Academy. All rights reserved.</p>
        </div>
      </div>

      {/* ── RIGHT LOGIN PANEL ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-16 bg-[#09090E] relative">

        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.5) 0%, transparent 70%)' }} />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center">
              <img src="/assets/Logo-Purple.png" alt="Xebia" className="h-6 w-6 object-contain brightness-200" />
            </div>
            <span className="text-base font-black text-white">Xebia Academy</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-white tracking-tight">Welcome back</h2>
            <p className="mt-1.5 text-sm text-slate-500">Sign in to continue your learning journey</p>
          </div>

          {/* Alerts */}
          <AnimatePresence mode="wait">
            {successMessage && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-400 mb-5"
              >
                <CheckCircle className="h-4 w-4 shrink-0" />
                <p className="font-semibold">{successMessage}</p>
              </motion.div>
            )}
            {serverError && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-400 mb-5"
              >
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <p className="font-semibold">{serverError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className={`w-full rounded-xl border bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-600 outline-none transition-all duration-200 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 focus:bg-white/[0.06] ${
                    errors.email
                      ? 'border-red-500/40 bg-red-500/5'
                      : 'border-white/[0.08] hover:border-white/[0.12]'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-[11px] font-medium text-red-400 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full rounded-xl border bg-white/[0.04] py-3.5 pl-11 pr-11 text-sm text-white placeholder-slate-600 outline-none transition-all duration-200 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 focus:bg-white/[0.06] ${
                    errors.password
                      ? 'border-red-500/40 bg-red-500/5'
                      : 'border-white/[0.08] hover:border-white/[0.12]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer bg-transparent border-0 p-0"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] font-medium text-red-400 mt-1">{errors.password}</p>
              )}
            </div>

            {/* Remember me & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  id="remember-me"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border-slate-600 bg-white/5 text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
                <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">Remember me</span>
              </label>
              <Link
                to="/student/forgot-password"
                className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.015 }}
              whileTap={{ scale: loading ? 1 : 0.985 }}
              className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-900/40 transition-all duration-200 hover:shadow-purple-900/60 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer border-0"
            >
              {/* Shimmer effect */}
              {!loading && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}
                />
              )}
              {loading ? (
                <>
                  <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Demo Account</p>
            <p className="font-mono text-[11px] text-purple-400">abhay.kumawat@xebia.com</p>
            <p className="font-mono text-[11px] text-slate-500 mt-0.5">Password: student123</p>
          </div>

          {/* Sign up link */}
          <p className="mt-5 text-center text-xs text-slate-600">
            Don&apos;t have an account?{' '}
            <Link
              to="/student/register"
              className="font-bold text-purple-400 hover:text-purple-300 transition-colors"
            >
              Create account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
