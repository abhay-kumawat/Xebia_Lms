'use client';

import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Pencil, Trash2, Globe, Clock, ChevronRight, Star } from 'lucide-react';
import { countCourseStats } from '@/utils';

function StatusPill({ children, color }) {
  const colors = {
    active:    { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400' },
    inactive:  { bg: 'bg-white/[0.05] border-white/[0.06]',   text: 'text-slate-400' },
    published: { bg: 'bg-purple-500/10 border-purple-500/20', text: 'text-purple-400' },
    draft:     { bg: 'bg-white/[0.05] border-white/[0.06]',   text: 'text-slate-400' },
    archived:  { bg: 'bg-orange-500/10 border-orange-500/20', text: 'text-orange-400' },
  };
  const s = colors[color] || colors.draft;
  return (
    <span
      className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${s.bg} ${s.text}`}
    >
      {children}
    </span>
  );
}

export default function CourseCard({ course, categoryName, categoryColor = '#6c1d5f', onEdit, onDelete, isCurriculumView = false }) {
  const navigate = useNavigate();
  const stats = countCourseStats(course);
  const isPublished = course.status === 'published';
  const isActive = course.status !== 'archived';

  const isTeacher = window.location.pathname.startsWith('/teacher');
  const urlPrefix = isTeacher ? '/teacher' : '/admin';
  const targetUrl = `${urlPrefix}/courses/${course.id}/builder`;

  const handleCardClick = (e) => {
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    navigate(targetUrl);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={handleCardClick}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] h-full shadow-xl ring-1 ring-white/[0.04] backdrop-blur-xl transition-all duration-300 hover:border-white/[0.12] cursor-pointer"
    >
      {/* Thumbnail */}
      <Link to={targetUrl} className="relative block" style={{ aspectRatio: '16/9', backgroundColor: '#101118' }}>
        {course.thumbnail && (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            style={{ aspectRatio: '16/9' }}
          />
        )}
        {/* Featured star */}
        {(course.isFeatured || isPublished) && (
          <div
            className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30"
          >
            ⭐
          </div>
        )}
        {/* Tech icon bottom left */}
        <div
          className="absolute bottom-3 left-3 flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0C0D12] text-base shadow-sm overflow-hidden"
        >
          {(() => {
            const logoVal = course.logo || course.icon || '';
            if (logoVal) {
              if (logoVal.startsWith('http') || logoVal.startsWith('/') || logoVal.startsWith('data:') || logoVal.startsWith('blob:')) {
                const srcUrl = (logoVal.startsWith('/') && !logoVal.startsWith('/uploads/'))
                  ? `https://res.cloudinary.com${logoVal}`
                  : logoVal;
                return <img src={srcUrl} alt="icon" className="h-full w-full object-cover" />;
              }
            }
            return <span>{logoVal || '💻'}</span>;
          })()}
        </div>
      </Link>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Category + level tags */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
            style={{ backgroundColor: `${categoryColor}25`, color: categoryColor === '#6c1d5f' ? '#c084fc' : categoryColor }}
          >
            {categoryName}
          </span>
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white/90"
            style={{ backgroundColor: categoryColor }}
          >
            {course.difficulty || 'Intermediate'}
          </span>
        </div>

        {/* Title + slug */}
        <div>
          <Link
            to={targetUrl}
            className="block text-sm font-bold leading-snug text-white hover:text-purple-400 transition-colors hover:underline truncate"
          >
            {course.title}
          </Link>
          <p className="mt-0.5 font-mono text-[10px] text-slate-500">/{course.slug}</p>
        </div>

        <div className="border-t border-white/[0.06]" />

        {/* Meta stats */}
        <div className="flex items-center gap-4 text-xs text-slate-400 font-semibold">
          <span className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-slate-500" />
            {course.language || 'English'}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            {course.duration || '—'}
          </span>
          <span className="flex items-center gap-1.5">
            📦 {stats.moduleCount} Modules
          </span>
        </div>

        {/* Status pills + action buttons */}
        <div className="mt-auto flex items-center gap-2 pt-2">
          <StatusPill color={isActive ? 'active' : 'inactive'}>
            {isActive ? 'Active' : 'Inactive'}
          </StatusPill>
          <StatusPill color={isPublished ? 'published' : 'draft'}>
            {isPublished ? 'Published' : 'Draft'}
          </StatusPill>

          {isCurriculumView ? (
            <Link
              to={`/admin/courses/${course.id}/builder`}
              className="ml-auto flex items-center gap-0.5 text-xs font-bold text-purple-400 hover:text-purple-300 hover:underline"
            >
              Manage →
            </Link>
          ) : (
            <div className="ml-auto flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); onEdit(course); }}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] cursor-pointer"
                title="Edit"
              >
                <Pencil className="h-3.5 w-3.5 text-purple-400" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); onDelete(course); }}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-red-500/15 cursor-pointer"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5 text-orange-400" />
              </button>
              <Link
                to={targetUrl}
                className="flex items-center gap-0.5 text-xs text-slate-400 hover:text-white ml-1 font-semibold"
              >
                Open <ChevronRight className="h-3 w-3 text-slate-500" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function CourseRow({ course, index, categoryName, categoryColor = '#6c1d5f', onEdit, onDelete }) {
  const isPublished = course.status === 'published';
  const isActive    = course.status !== 'archived';
  const isFeatured  = course.isFeatured || isPublished;

  return (
    <tr className="border-b border-brand-border transition-colors hover:bg-brand-surface/40">
      <td className="px-4 py-4 text-sm text-brand-text-secondary">{index}</td>
      <td className="px-4 py-4">
        <Link to={`/admin/courses/${course.id}/builder`} className="flex items-center gap-3">
          <img
            src={course.thumbnail}
            alt=""
            className="h-10 w-14 shrink-0 rounded-lg border border-brand-border bg-brand-surface object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-brand-text-primary hover:underline">{course.title}</p>
            <p className="truncate font-mono text-xs text-brand-text-secondary">{course.slug}</p>
          </div>
        </Link>
      </td>
      <td className="px-4 py-4">
        <span
          className="rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{ backgroundColor: `${categoryColor}18`, color: categoryColor }}
        >
          {categoryName}
        </span>
      </td>
      <td className="px-4 py-4">
        <span
          className="rounded-full px-2.5 py-1 text-xs font-semibold text-white"
          style={{ backgroundColor: categoryColor }}
        >
          {course.difficulty || 'Intermediate'}
        </span>
      </td>
      <td className="px-4 py-4 text-sm text-brand-text-secondary">{course.language || 'English'}</td>
      <td className="px-4 py-4 text-sm text-brand-text-secondary">{course.duration || '—'}</td>
      <td className="px-4 py-4">
        <div className="flex flex-wrap gap-1.5">
          <StatusPill color={isActive ? 'active' : 'inactive'}>{isActive ? 'Active' : 'Inactive'}</StatusPill>
          <StatusPill color={isPublished ? 'published' : 'draft'}>{isPublished ? 'Published' : 'Draft'}</StatusPill>
        </div>
      </td>
      <td className="px-4 py-4">
        <Star className={`h-4 w-4 ${isFeatured ? 'fill-amber-400 text-amber-400' : 'text-brand-border'}`} />
      </td>
      <td className="px-4 py-4">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(course)}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-brand-border bg-brand-background hover:bg-brand-surface"
          >
            <Pencil className="h-3.5 w-3.5" style={{ color: '#6c1d5f' }} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(course)}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-brand-border bg-brand-background hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <Trash2 className="h-3.5 w-3.5" style={{ color: '#ff6200' }} />
          </button>
        </div>
      </td>
    </tr>
  );
}
