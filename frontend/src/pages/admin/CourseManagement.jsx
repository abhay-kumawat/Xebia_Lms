'use client';

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ChevronDown } from 'lucide-react';
import { useCatalog } from '@/hooks/useCatalog';
import { useToast } from '@/hooks/useToast';
import { paginate } from '@/utils';
import { ConfirmationDialog } from '@/components/ui/Modal';
import CourseCard from '@/components/catalog/CourseCard';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import { DEFAULT_PAGE_SIZE, DIFFICULTY_LEVELS, COURSE_STATUSES } from '@/constants';

function SelectDropdown({ value, options, onChange }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none cursor-pointer rounded-xl border bg-white/[0.04] border-white/[0.08] py-2.5 pl-3.5 pr-8 text-sm text-white focus:outline-none hover:border-white/[0.14] transition-all"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#09090E] text-white">{o.label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
    </div>
  );
}

import { useParams } from 'react-router-dom';

export default function CourseManagement({ categoryId = null }) {
  const params = useParams();
  const resolvedCategoryId = categoryId || params.categoryId;
  const { categories, courses, getCategory, deleteCourse, duplicateCourse, hydrated } = useCatalog();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const category = resolvedCategoryId ? getCategory(resolvedCategoryId) : null;

  const [search, setSearch]                   = useState('');
  const [statusFilter, setStatusFilter]       = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [categoryFilter, setCategoryFilter]   = useState('all');
  const [sortBy, setSortBy]                   = useState('updated');
  const [page, setPage]                       = useState(1);
  const [pageSize, setPageSize]               = useState(DEFAULT_PAGE_SIZE);
  const [deleteTarget, setDeleteTarget]       = useState(null);

  const baseCourses = useMemo(() => {
    let list = courses.filter((c) => !c.deletedAt);
    if (resolvedCategoryId) list = list.filter((c) => c.categoryId === Number(resolvedCategoryId) || c.categoryId === resolvedCategoryId);
    return list;
  }, [courses, resolvedCategoryId]);

  const filtered = useMemo(() => {
    let list = baseCourses.filter((c) => {
      const q = search.toLowerCase();
      const matchSearch   = !search || c.title.toLowerCase().includes(q) || c.slug?.toLowerCase().includes(q);
      const matchStatus   = statusFilter === 'all'     || c.status === statusFilter;
      const matchDiff     = difficultyFilter === 'all' || c.difficulty === difficultyFilter;
      const matchCat      = categoryFilter === 'all'   || String(c.categoryId) === categoryFilter;
      return matchSearch && matchStatus && matchDiff && matchCat;
    });
    list = [...list].sort((a, b) => {
      if (sortBy === 'title')      return a.title.localeCompare(b.title);
      if (sortBy === 'difficulty') return a.difficulty.localeCompare(b.difficulty);
      if (sortBy === 'status')     return a.status.localeCompare(b.status);
      if (sortBy === 'created')    return new Date(b.createdAt) - new Date(a.createdAt);
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
    return list;
  }, [baseCourses, search, statusFilter, difficultyFilter, categoryFilter, sortBy]);

  const { data, total, totalPages } = paginate(filtered, page, pageSize);

  const handleCreate = () => {
    if (!categories?.length) {
      showToast('Create a category first before adding a course.', 'error');
      return;
    }
    navigate('/admin/courses/new');
  };

  const emptyStateConfig = useMemo(() => {
    if (search) {
      return {
        title: "No matching courses found",
        description: `We couldn't find any courses matching "${search}".`,
        actionLabel: null,
        onAction: null
      };
    }
    if (statusFilter !== 'all') {
      return {
        title: `No ${statusFilter} courses found`,
        description: `There are currently no courses marked as ${statusFilter}.`,
        actionLabel: statusFilter !== 'archived' ? "Create Course" : null,
        onAction: statusFilter !== 'archived' ? handleCreate : null
      };
    }
    if (difficultyFilter !== 'all') {
      return {
        title: `No ${difficultyFilter} courses found`,
        description: `There are currently no courses found for the ${difficultyFilter} difficulty level.`,
        actionLabel: "Create Course",
        onAction: handleCreate
      };
    }
    if (categoryFilter !== 'all') {
      const catName = categories.find(c => String(c.id) === categoryFilter)?.name || 'this category';
      return {
        title: `No courses in ${catName}`,
        description: `There are currently no courses assigned to ${catName}.`,
        actionLabel: "Create Course",
        onAction: handleCreate
      };
    }
    return {
      title: "No courses found",
      description: "Create a course to get started.",
      actionLabel: "Create Course",
      onAction: handleCreate
    };
  }, [search, statusFilter, difficultyFilter, categoryFilter, categories, handleCreate]);

  const getCategoryName  = (id) => categories.find((c) => c.id === id)?.name  || '—';
  const getCategoryColor = (id) => categories.find((c) => c.id === id)?.color || '#6c1d5f';

  const activeCourses   = baseCourses.filter((c) => c.status !== 'archived').length;
  const publishedCourses = baseCourses.filter((c) => c.status === 'published').length;

  if (!hydrated) return null;

  return (
    <div className="flex min-h-screen flex-col bg-transparent text-slate-100 transition-colors">
      {/* Page header bar */}
      <div className="flex items-center justify-between px-8 py-5 bg-[#0C0D12]/40 border-b border-white/[0.06] backdrop-blur-xl">
        <div>
          <h1 className="text-xl font-bold text-white">
            {category ? `${category.name} — Courses` : 'All Courses'}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            {category ? `Manage courses under category ${category.name}` : 'Browse and manage all courses on the platform.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Quick stat pills */}
          <span className="rounded-full px-3 py-1 text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            {baseCourses.length} Courses
          </span>
          <span className="rounded-full px-3 py-1 text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {activeCourses} Active
          </span>
          <span className="rounded-full px-3 py-1 text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {publishedCourses} Published
          </span>
          <button
            type="button"
            onClick={handleCreate}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-md hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border-0"
          >
            <Plus className="h-4 w-4" />
            Create Course
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 px-8 py-7">

        {/* Filters toolbar */}
        <div className="mb-6 flex items-center gap-3">
          {/* Search */}
          <div
            className="flex flex-1 items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm hover:border-white/[0.14] transition-all"
            style={{ maxWidth: 420 }}
          >
            <Search className="h-[15px] w-[15px] shrink-0 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search courses by title or slug..."
              className="w-full bg-transparent py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none"
            />
          </div>

          {/* Level filter */}
          <SelectDropdown
            value={difficultyFilter}
            onChange={(v) => { setDifficultyFilter(v); setPage(1); }}
            options={[{ value: 'all', label: 'All Levels' }, ...DIFFICULTY_LEVELS.map((d) => ({ value: d, label: d }))]}
          />

          {/* Category filter (only when not scoped) */}
          {!categoryId && (
            <SelectDropdown
              value={categoryFilter}
              onChange={(v) => { setCategoryFilter(v); setPage(1); }}
              options={[
                { value: 'all', label: 'All Categories' },
                ...categories.filter((c) => !c.deletedAt).map((c) => ({ value: String(c.id), label: c.name })),
              ]}
            />
          )}

          {/* Status filter */}
          <SelectDropdown
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPage(1); }}
            options={[
              { value: 'all', label: 'All Status' },
              ...COURSE_STATUSES.map((s) => ({ value: s.value, label: s.label })),
            ]}
          />

          <span className="ml-auto whitespace-nowrap text-xs font-medium text-brand-text-secondary">
            {filtered.length} courses
          </span>
        </div>

        {/* Course grid */}
        {data.length === 0 ? (
          <EmptyState
            icon={Plus}
            title={emptyStateConfig.title}
            description={emptyStateConfig.description}
            actionLabel={emptyStateConfig.actionLabel}
            onAction={emptyStateConfig.onAction}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {data.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                categoryName={getCategoryName(course.categoryId)}
                categoryColor={getCategoryColor(course.categoryId)}
                onEdit={(c)      => navigate(`/admin/courses/${c.id}/edit`)}
                onDelete={setDeleteTarget}
                onDuplicate={(c) => duplicateCourse(c.id)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-6">
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
            itemLabel="courses"
          />
        </div>
      </div>

      {/* Delete confirmation */}
      <ConfirmationDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { deleteCourse(deleteTarget.id); setDeleteTarget(null); }}
        title="Delete Course"
        message="Archive this course? You can restore it later."
      />
    </div>
  );
}
