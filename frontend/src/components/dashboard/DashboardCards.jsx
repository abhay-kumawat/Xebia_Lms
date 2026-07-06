import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';

const COLOR_SCHEMES = {
  purple: 'from-purple-500/10 to-indigo-500/10 text-purple-400 border border-purple-500/20',
  teal: 'from-teal-500/10 to-emerald-500/10 text-teal-400 border border-teal-500/20',
  emerald: 'from-emerald-500/10 to-lime-500/10 text-emerald-400 border border-emerald-500/20',
  orange: 'from-amber-500/10 to-orange-500/10 text-orange-400 border border-orange-500/20',
  plum: 'from-pink-500/10 to-purple-500/10 text-pink-400 border border-pink-500/20',
  pink: 'from-rose-500/10 to-pink-500/10 text-rose-400 border border-rose-500/20',
};

export function StatCard({ title, value, trend, iconName, color = 'teal', index = 0 }) {
  const Icon = Icons[iconName] || Icons.BookOpen;
  const gradientClass = COLOR_SCHEMES[color] || COLOR_SCHEMES.teal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -4, transition: { duration: 0.15 } }}
      className="group relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-white/[0.03] p-5 shadow-xl ring-1 ring-white/[0.04] backdrop-blur-xl transition-all duration-300"
    >
      {/* Decorative background glow on hover */}
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-purple-500/10 to-indigo-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
      
      <div className="flex items-start justify-between">
        <div className={`inline-flex rounded-xl bg-gradient-to-br p-2.5 ${gradientClass}`}>
          <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
        </div>
        
        {trend && (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] border border-white/[0.06] px-2.5 py-0.5 text-[10px] font-semibold text-slate-400">
            <Icons.TrendingUp className="h-3 w-3 text-emerald-400" />
            {trend}
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {title}
        </p>
        <p className="mt-1 text-2xl font-black text-white tracking-tight">
          {value}
        </p>
      </div>
    </motion.div>
  );
}
