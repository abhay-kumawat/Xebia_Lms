'use client';

import { motion } from 'framer-motion';

const ICON_COLORS = {
  purple: { bg: '#831B8415', text: '#831B84' },
  teal:   { bg: '#01ac9f15', text: '#01ac9f' },
  orange: { bg: '#ff620015', text: '#ff6200' },
  plum:   { bg: '#FF620015', text: '#FF6200' },
  pink:   { bg: '#db277715', text: '#db2777' },
};

export default function StatCard({ icon: Icon, label, value, color = 'teal', index = 0, className }) {
  const scheme = ICON_COLORS[color] || ICON_COLORS.teal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`flex items-center gap-4 rounded-lg border bg-white p-4 ${className || ''}`}
      style={{ borderColor: '#e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: scheme.bg }}
      >
        <Icon className="h-[18px] w-[18px]" style={{ color: scheme.text }} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold leading-tight text-gray-900">{value}</p>
        <p className="text-xs text-gray-400 truncate">{label}</p>
      </div>
    </motion.div>
  );
}
