'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Plus, ChevronRight, CheckCircle, Circle, Save, Clock, Tag, Smile, Check,
  Upload, Link2, ImageIcon, X, HelpCircle
} from 'lucide-react';
import { useCatalog } from '@/hooks/useCatalog';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import PageHeader from '@/components/layout/PageHeader';

const SWATCH_PALETTE = [
  { hex: '#6C1D5F', label: 'Plum'       },
  { hex: '#01AC9F', label: 'Teal'       },
  { hex: '#FF6200', label: 'Orange'     },
  { hex: '#84117C', label: 'Magenta'    },
  { hex: '#5C4F61', label: 'Slate'      },
  { hex: '#793B74', label: 'Violet'     },
];

const MORE_COLORS = [
  { hex: '#3B82F6', label: 'Blue' },
  { hex: '#60A5FA', label: 'Blue Light' },
  { hex: '#2563EB', label: 'Blue Dark' },
  { hex: '#0D9488', label: 'Teal' },
  { hex: '#14B8A6', label: 'Teal Light' },
  { hex: '#06B6D4', label: 'Cyan' },
  { hex: '#22D3EE', label: 'Cyan Light' },
  { hex: '#10B981', label: 'Green' },
  { hex: '#34D399', label: 'Green Light' },
  { hex: '#059669', label: 'Green Dark' },
  { hex: '#84CC16', label: 'Lime' },
  { hex: '#F97316', label: 'Orange' },
  { hex: '#FB923C', label: 'Orange Light' },
  { hex: '#F59E0B', label: 'Yellow' },
  { hex: '#FACC15', label: 'Yellow Light' },
  { hex: '#EF4444', label: 'Red' },
  { hex: '#F87171', label: 'Red Light' },
  { hex: '#DC2626', label: 'Red Dark' },
  { hex: '#F43F5E', label: 'Rose' },
  { hex: '#EC4899', label: 'Pink' },
  { hex: '#F472B6', label: 'Pink Light' },
  { hex: '#D946EF', label: 'Fuchsia' },
  { hex: '#8B5CF6', label: 'Purple' },
  { hex: '#6B7280', label: 'Gray' }
];

const EMOJI_OPTIONS = [
  '💻', '🤖', '📊', '☁️', '⚙️', '🔒',
  '📱', '🎨', '💼', '🧠', '🚀', '📚',
  '🌐', '🎯', '🔬', '📐',
];

const EMPTY_FORM = {
  name:        '',
  description: '',
  status:      'active',
  icon:        '💻',
  color:       '#01AC9F',
};

/** Media Type Selector (Emoji vs Image) */
function MediaToggle({ mode, onChange }) {
  const tabs = [
    { id: 'emoji',  label: 'Emoji Icon' },
    { id: 'upload', label: 'Upload Image' },
  ];
  return (
    <div className="inline-flex rounded-full border border-slate-200 dark:border-[#334155] p-0.5 mb-4 bg-slate-105/50 dark:bg-[#1E293B]/60">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border-0 ${
            mode === t.id
              ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-transparent'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/** Emoji picker panel */
function EmojiPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const clickHandler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', clickHandler);
    return () => document.removeEventListener('mousedown', clickHandler);
  }, []);

  return (
    <div className="flex items-center gap-4" ref={ref}>
      {/* Icon Display */}
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-black shrink-0 border border-slate-200 bg-slate-50 dark:border-[#334155] dark:bg-[#1E293B] shadow-inner select-none">
        {value && (value.startsWith('http') || value.startsWith('/') || value.startsWith('data:') || value.startsWith('blob:')) ? (
          <img src={value} alt="category thumbnail" className="w-full h-full object-cover rounded-2xl" />
        ) : (
          value || '💻'
        )}
      </div>

      {/* Select Dropdown Button */}
      <div className="relative flex-1">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-300 text-sm font-semibold text-left shadow-sm hover:border-slate-350 dark:hover:border-slate-600 transition-all cursor-pointer"
        >
          <span>{value ? `${value} Emoji Selected` : 'Select Category Emoji...'}</span>
          <Smile className="w-5 h-5 text-slate-400" />
        </button>

        {open && (
          <div className="absolute left-0 top-full z-20 mt-2 grid grid-cols-8 gap-2 p-3.5 rounded-2xl shadow-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] w-full max-w-sm">
            {EMOJI_OPTIONS.map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => { onChange(em); setOpen(false); }}
                className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer border-0 bg-transparent ${
                  value === em ? 'ring-2 ring-emerald-500 bg-emerald-500/10' : ''
                }`}
              >
                {em}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** File upload + URL picker */
function ImageMedia({ value, onChange }) {
  const [subTab, setSubTab] = useState('upload'); // upload | url
  const [urlInput, setUrlInput] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const isImageValue = value && (value.startsWith('http') || value.startsWith('data:') || value.startsWith('blob:'));

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const objectUrl = URL.createObjectURL(file);
    onChange(objectUrl);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleUrlApply = () => {
    if (urlInput.trim()) onChange(urlInput.trim());
  };

  return (
    <div className="space-y-4">
      {/* Sub-Tabs */}
      <div className="flex gap-2">
        {[{ id: 'upload', label: 'Upload File' }, { id: 'url', label: 'Image URL' }].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSubTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              subTab === t.id
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'border-slate-200 dark:border-[#334155] text-slate-500 dark:text-slate-400 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {t.id === 'upload' ? <Upload className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex items-start gap-4">
        {/* Upload Container */}
        {subTab === 'upload' ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`flex-1 border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer select-none transition-all ${
              dragOver 
                ? 'border-emerald-500 bg-emerald-500/5' 
                : 'border-slate-200 dark:border-[#334155] bg-slate-50/50 dark:bg-[#1E293B]/20 hover:border-emerald-500 dark:hover:border-emerald-400'
            }`}
          >
            <input
              type="file"
              ref={fileRef}
              accept="image/*"
              onChange={(e) => handleFile(e.target.files?.[0])}
              className="hidden"
            />
            {isImageValue ? (
              <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-250 dark:border-slate-700 shadow-sm">
                <img src={value} alt="thumbnail preview" className="w-full h-full object-cover" />
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-xs font-bold text-slate-750 dark:text-slate-355">Click to choose or drag image file</p>
                <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WEBP, or SVG up to 5MB</p>
              </>
            )}
          </div>
        ) : (
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#1E293B]">
              <Link2 className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUrlApply()}
                className="flex-1 py-2 text-xs text-slate-800 dark:text-white bg-transparent outline-none border-0 focus:ring-0"
              />
              {urlInput && (
                <button
                  type="button"
                  onClick={() => setUrlInput('')}
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 border-0 bg-transparent cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 text-slate-400" />
                </button>
              )}
            </div>
            <Button
              type="button"
              onClick={handleUrlApply}
              variant="primary"
              className="rounded-xl px-4 py-1.5 text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-0 text-white cursor-pointer"
            >
              Apply Image Link
            </Button>
          </div>
        )}
      </div>

      {isImageValue && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:underline border-0 bg-transparent cursor-pointer"
        >
          <X className="w-3.5 h-3.5" /> Clear Image
        </button>
      )}
    </div>
  );
}

/** Accent Color card (big circle + hex input + palette swatches) */
function AccentColorPicker({ value, onChange }) {
  const [hex, setHex] = useState(value?.replace('#', '') || '01AC9F');
  const [showMore, setShowMore] = useState(false);

  useEffect(() => { setHex((value || '#01AC9F').replace('#', '')); }, [value]);

  const handleHexInput = (v) => {
    setHex(v.replace('#', ''));
    if (/^[0-9a-fA-F]{6}$/.test(v.replace('#', ''))) {
      onChange('#' + v.replace('#', '').toUpperCase());
    }
  };

  return (
    <div className="space-y-3.5">
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
        Accent Color
      </label>
      <div className="rounded-[20px] p-5 border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] shadow-sm space-y-4">
        {/* Swatch & Input Row */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full border-2 border-white dark:border-[#1E293B] shrink-0 shadow"
            style={{
              backgroundColor: value || '#01AC9F',
              boxShadow: `0 0 0 2px ${value || '#01AC9F'}`,
            }}
          />
          <div className="flex-1 flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#1E293B]">
            <span className="text-slate-400 font-bold text-sm">#</span>
            <input
              type="text"
              maxLength={6}
              value={hex}
              onChange={(e) => handleHexInput(e.target.value)}
              className="flex-1 bg-transparent font-mono font-bold text-slate-800 dark:text-slate-200 focus:outline-none text-xs uppercase"
            />
          </div>
        </div>

        {/* Preset Swatches */}
        <div className="flex flex-wrap items-center gap-2">
          {SWATCH_PALETTE.map((s) => (
            <button
              key={s.hex}
              type="button"
              aria-label={s.label}
              onClick={() => onChange(s.hex.toUpperCase())}
              className={`w-7 h-7 rounded-full border-2 border-white dark:border-[#1E293B] cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-sm relative ${
                value?.toUpperCase() === s.hex.toUpperCase() ? 'ring-2 ring-emerald-500 scale-105' : ''
              }`}
              style={{ backgroundColor: s.hex }}
            >
              {value?.toUpperCase() === s.hex.toUpperCase() && (
                <Check className="w-3.5 h-3.5 text-white absolute inset-0 m-auto font-black" />
              )}
            </button>
          ))}
          
          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className="rounded-xl px-2.5 py-1 text-[10px] font-bold border border-slate-200 dark:border-[#334155] text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer bg-transparent"
          >
            {showMore ? 'Less Colors' : 'More...'}
          </button>
        </div>

        {/* More Colors Grid */}
        {showMore && (
          <div className="grid grid-cols-8 gap-2 pt-3 border-t border-slate-100 dark:border-[#334155]/60">
            {MORE_COLORS.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => onChange(c.hex.toUpperCase())}
                className={`w-6 h-6 rounded-full border border-white dark:border-[#1E293B] cursor-pointer hover:scale-110 active:scale-95 transition-all relative ${
                  value?.toUpperCase() === c.hex.toUpperCase() ? 'ring-2 ring-emerald-500' : ''
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.label}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Status Card Toggle (Active / Inactive) */
function StatusCard({ value, onChange }) {
  const isActive = value === 'active';

  return (
    <div className="space-y-3.5">
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
        Status
      </label>
      <div className="rounded-[20px] p-5 border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] shadow-sm space-y-4">
        {/* Toggle Switch */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onChange(isActive ? 'inactive' : 'active')}
            className={`flex h-6 w-11 items-center rounded-full px-0.5 transition-all outline-none border-0 cursor-pointer ${
              isActive ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
            }`}
          >
            <div
              className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
                isActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-xs font-bold ${isActive ? 'text-emerald-500' : 'text-slate-400'}`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Status helper badge */}
        {isActive ? (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-450 uppercase tracking-wider">
              Visible to all learners
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-150 dark:bg-slate-800/40 border border-slate-200/50 dark:border-white/[0.04]">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Hidden from learners
            </span>
          </div>
        )}

        <p className="text-[10px] text-slate-400 leading-normal">
          Inactive categories won't display in students catalog dashboards.
        </p>
      </div>
    </div>
  );
}

/* ─── Main CategoryForm Component ─── */
export default function CategoryForm() {
  const { categoryId } = useParams();
  const navigate       = useNavigate();
  const { categories, createCategory, updateCategory, hydrated } = useCatalog();

  const isEdit   = !!categoryId;
  const existing = isEdit ? categories.find((c) => String(c.id) === String(categoryId)) : null;

  const [form,   setForm]   = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saved,  setSaved]  = useState(false);
  const [media,  setMedia]  = useState('emoji'); // emoji | upload

  useEffect(() => {
    if (existing) {
      const isUrl = existing.icon && (
        existing.icon.startsWith('http') ||
        existing.icon.startsWith('/') ||
        existing.icon.startsWith('data:') ||
        existing.icon.startsWith('blob:')
      );
      setMedia(isUrl ? 'upload' : 'emoji');
      setForm({
        name:        existing.name        || '',
        description: existing.description || '',
        status:      existing.status      || 'active',
        icon:        existing.icon        || '💻',
        color:       existing.color       || '#01AC9F',
      });
    }
  }, [existing]);

  const fieldChecks = useMemo(() => [
    { label: 'Category Name', done: !!form.name.trim() },
    { label: 'Icon/Thumbnail', done: !!form.icon },
    { label: 'Description',  done: !!form.description.trim() },
    { label: 'Accent Color', done: !!form.color },
    { label: 'Status',       done: !!form.status },
  ], [form]);

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#0B1120]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (isEdit && !existing) {
    return (
      <div className="p-16 text-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#0B1120] h-screen flex flex-col justify-center items-center">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Category Not Found</h3>
        <p className="text-sm text-slate-400 mt-2">The category you are trying to edit does not exist.</p>
        <Button 
          className="mt-6 rounded-xl cursor-pointer" 
          variant="primary" 
          onClick={() => navigate('/admin/categories')}
        >
          Go Back to Categories
        </Button>
      </div>
    );
  }

  const validate = () => {
    const e = {};
    if (!form.name.trim())        e.name        = 'Name is required';
    if (!form.description.trim()) e.description = 'Description is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (asDraft = false) => {
    if (!validate()) return;
    const payload = { ...form, status: asDraft ? 'inactive' : form.status };
    try {
      if (isEdit) await updateCategory(existing.id, payload);
      else        await createCategory(payload);
      setSaved(true);
      setTimeout(() => navigate('/admin/categories'), 1200);
    } catch { /* error handled by useCatalog */ }
  };

  const accentColor = form.color || '#01AC9F';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-100 pb-16 transition-colors duration-300">
      
      {/* Breadcrumb Bar */}
      <div className="bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-[#334155] px-8 py-3.5 flex items-center justify-between">
        <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 tracking-wider">
          <Link to="/admin/dashboard" className="hover:text-slate-650 dark:hover:text-slate-250 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <Link to="/admin/categories" className="hover:text-slate-650 dark:hover:text-slate-250 transition-colors">
            Categories
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="text-emerald-500 font-extrabold">{isEdit ? 'Edit' : 'Create'}</span>
        </nav>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider rounded-full px-3 py-1 border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#1E293B] text-slate-450 dark:text-slate-400">
            <Clock className="w-3 h-3 text-emerald-500" />
            <span>Draft recovered</span>
          </span>
          <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center text-[10px] font-black shadow-sm select-none">
            A
          </div>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="max-w-7xl mx-auto px-8 mt-8 grid gap-8 lg:grid-cols-3">
        
        {/* Left Column (2/3 width) - Category Form fields */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Card */}
          <div className="rounded-[24px] border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] p-8 shadow-sm space-y-6">
            
            {/* Header Title inside card */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-[#334155]/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                    {isEdit ? 'Edit Category' : 'Create New Category'}
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-450 mt-0.5">
                    Fill in the details below to set up a new learning category.
                  </p>
                </div>
              </div>

              <div className="h-10 w-10 rounded-full bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black select-none">
                X
              </div>
            </div>

            {/* Success alert banner */}
            {saved && (
              <div className="flex items-center gap-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-5 py-3.5 text-emerald-600 dark:text-emerald-450 text-xs font-bold">
                <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                <span>Category {isEdit ? 'updated' : 'created'} successfully! Redirecting...</span>
                <button
                  type="button"
                  onClick={() => setSaved(false)}
                  className="ml-auto text-[10px] font-black border-0 bg-transparent text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Category Name Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Category Name <span className="text-red-500">*</span>
              </label>
              <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border bg-slate-50 dark:bg-[#1E293B] transition-all ${
                errors.name ? 'border-red-500 focus-within:border-red-500' : 'border-slate-200 dark:border-[#334155] focus-within:border-emerald-500 focus-within:bg-white dark:focus-within:bg-[#1E293B]'
              }`}>
                <input
                  type="text"
                  maxLength={100}
                  placeholder="e.g. Web Development"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="flex-1 bg-transparent focus:outline-none text-sm text-slate-900 dark:text-white"
                />
                {form.name.trim() && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Unique</span>
                  </span>
                )}
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
                {errors.name ? (
                  <p className="text-red-500">{errors.name}</p>
                ) : (
                  <span>Must be unique. Checked in real-time.</span>
                )}
                <span>{form.name.length}/100</span>
              </div>
            </div>

            {/* Icon / Thumbnail selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Icon / Thumbnail
              </label>
              <MediaToggle mode={media} onChange={setMedia} />
              {media === 'emoji' ? (
                <EmojiPicker value={form.icon} onChange={(icon) => setForm({ ...form, icon })} />
              ) : (
                <ImageMedia
                  value={typeof form.icon === 'string' && !EMOJI_OPTIONS.includes(form.icon) ? form.icon : ''}
                  onChange={(img) => setForm({ ...form, icon: img })}
                />
              )}
              <p className="text-[10px] text-slate-400 mt-1">
                Upload a file or paste a CDN URL. Emoji or image will appear as the category thumbnail.
              </p>
            </div>

            {/* Description textarea */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Describe what this category covers..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={`w-full resize-none rounded-xl px-4 py-3.5 text-sm focus:outline-none transition-all ${
                  errors.description 
                    ? 'border-red-500 focus:border-red-500 bg-slate-50 dark:bg-[#1E293B]' 
                    : 'border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#1E293B] focus:border-emerald-500 focus:bg-white dark:focus:bg-[#1E293B]'
                }`}
                style={{ minHeight: 110 }}
              />
              {errors.description && (
                <p className="text-[10px] font-semibold text-red-500 mt-1">{errors.description}</p>
              )}
              <p className="text-[10px] text-slate-400 mt-1">
                No character limit. Appears in category listings and SEO previews.
              </p>
            </div>

            {/* Accent Color and Status Pickers */}
            <div className="grid gap-6 sm:grid-cols-2">
              <AccentColorPicker
                value={form.color}
                onChange={(color) => setForm({ ...form, color })}
              />
              <StatusCard
                value={form.status}
                onChange={(status) => setForm({ ...form, status })}
              />
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-[#334155]/60 mt-8">
              <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-400">
                <Save className="h-3.5 w-3.5 text-emerald-500" />
                <span>Auto-saved · just now</span>
              </span>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => navigate('/admin/categories')}
                  variant="ghost"
                  className="rounded-xl border border-slate-200 dark:border-[#334155] text-slate-650 dark:text-slate-350 cursor-pointer font-bold px-5 py-2.5 bg-transparent"
                >
                  Cancel
                </Button>
                {!isEdit && (
                  <Button
                    onClick={() => handleSave(true)}
                    variant="outline"
                    className="rounded-xl border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-bold px-5 py-2.5 cursor-pointer"
                  >
                    Save as Draft
                  </Button>
                )}
                <Button
                  onClick={() => handleSave(false)}
                  variant="primary"
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold px-6 py-2.5 shadow-md cursor-pointer border-0"
                >
                  <Plus className="h-4 w-4" />
                  <span>{isEdit ? 'Save Changes' : 'Create Category'}</span>
                </Button>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column (1/3 width) - Live Preview, checklist */}
        <div className="space-y-8">
          
          {/* Live Preview Card */}
          <div className="space-y-3.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Live Preview
            </label>
            <div className="rounded-[24px] border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] shadow-xl overflow-hidden">
              {/* Color Bar */}
              <div className="h-2 w-full" style={{ backgroundColor: accentColor }} />
              
              <div 
                className="p-6 transition-all duration-300"
                style={{ background: `linear-gradient(135deg, ${accentColor}12 0%, transparent 65%)` }}
              >
                <div className="flex items-start gap-4">
                  {/* Category Icon Display */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-black shrink-0 border select-none overflow-hidden"
                    style={{ backgroundColor: `${accentColor}18`, borderColor: `${accentColor}35` }}
                  >
                    {form.icon && (form.icon.startsWith('http') || form.icon.startsWith('/') || form.icon.startsWith('data:') || form.icon.startsWith('blob:')) ? (
                      <img src={form.icon} alt="icon preview" className="w-full h-full object-cover" />
                    ) : (
                      form.icon || '💻'
                    )}
                  </div>

                  <div className="min-w-0 pt-1.5">
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                      {form.name || 'Category Name'}
                    </h4>
                    
                    {/* Active/Inactive badge */}
                    <div className="mt-1.5">
                      <span 
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                        style={{ backgroundColor: `${accentColor}15`, borderColor: `${accentColor}25`, color: accentColor }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
                        {form.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 leading-relaxed line-clamp-3">
                  {form.description || 'Learn the fundamentals of building modern web applications using industry-standard tools and best practices.'}
                </p>

                {/* Sub-Stats */}
                <div className="flex items-center gap-4 text-xs font-bold text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-white/[0.03] pt-4 mt-4">
                  <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-emerald-500" /> 0 Courses</span>
                  <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-emerald-500" /> 0 Learners</span>
                </div>
              </div>

              {/* Bottom hex code string footer */}
              <div className="bg-slate-50 dark:bg-white/[0.01] px-6 py-3 border-t border-slate-100 dark:border-white/[0.03] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentColor }} />
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                    {accentColor}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Field Summary Checklist */}
          <div className="space-y-3.5">
            <div className="rounded-[24px] border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-[#334155]/60 bg-slate-50 dark:bg-white/[0.01] text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-350">
                Field Summary
              </div>
              <div className="divide-y divide-slate-100 dark:divide-white/[0.03]">
                {fieldChecks.map((f) => (
                  <div key={f.label} className="flex items-center justify-between px-5 py-3">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{f.label}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${f.done ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {f.done ? 'Filled' : 'Not Filled'}
                      </span>
                      {f.done ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-200 dark:text-slate-700 shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="rounded-[24px] p-5 border border-emerald-500/10 dark:border-[#334155] bg-emerald-500/[0.02] dark:bg-[#111827]">
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" />
              <span>Quick Tips</span>
            </p>
            <ul className="space-y-2.5 text-xs text-slate-500 dark:text-slate-400">
              <li className="flex items-start gap-1.5"><span className="text-emerald-500 font-bold">→</span>Use a clear, descriptive category name.</li>
              <li className="flex items-start gap-1.5"><span className="text-emerald-500 font-bold">→</span>Pick a brand-aligned accent color swatch.</li>
              <li className="flex items-start gap-1.5"><span className="text-emerald-500 font-bold">→</span>Write a short, SEO-friendly summary description.</li>
              <li className="flex items-start gap-1.5"><span className="text-amber-500 font-bold">→</span>Keep status inactive until courses are published.</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
