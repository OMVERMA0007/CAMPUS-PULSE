import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, Clock, MapPin, Tag, Flame, ShieldAlert } from 'lucide-react';
import { CampusNotice, Category, PriorityLevel, SourceType } from '../types';
import { CATEGORIES } from '../types';

interface NoticeEditModalProps {
  notice: CampusNotice | null; // if null, creating a new notice manually
  isOpen: boolean;
  onClose: () => void;
  onSave: (notice: CampusNotice) => void;
  onCreateNew?: (noticeData: Omit<CampusNotice, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
}

export const NoticeEditModal: React.FC<NoticeEditModalProps> = ({
  notice,
  isOpen,
  onClose,
  onSave,
  onCreateNew,
  onShowToast,
}) => {
  const [formData, setFormData] = useState<Partial<CampusNotice>>({
    title: '',
    category: 'Other',
    date: '',
    time: '',
    venue: '',
    registrationDeadline: '',
    registrationLink: '',
    organizer: '',
    description: '',
    tags: [],
    priority: 'NORMAL',
    source: 'Manual',
    isFavorite: false,
    isCompleted: false,
  });

  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (notice) {
      setFormData(notice);
      setTagsInput(notice.tags?.join(', ') || '');
    } else {
      setFormData({
        title: '',
        category: 'Academic',
        date: '',
        time: '',
        venue: '',
        registrationDeadline: '',
        registrationLink: '',
        organizer: '',
        description: '',
        tags: [],
        priority: 'NORMAL',
        source: 'Manual',
        isFavorite: false,
        isCompleted: false,
      });
      setTagsInput('');
    }
  }, [notice, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title?.trim()) {
      onShowToast('Validation Error', 'Event title is required.', 'warning');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    if (notice) {
      // Editing existing notice
      onSave({
        ...notice,
        ...formData,
        title: formData.title.trim(),
        tags: tags.length > 0 ? tags : [formData.category as string],
      } as CampusNotice);
      onShowToast('Notice Updated', 'Changes saved to campus feed.', 'success');
    } else if (onCreateNew) {
      // Manual creation
      onCreateNew({
        title: formData.title.trim(),
        description: formData.description || 'No description provided.',
        category: (formData.category as Category) || 'Other',
        date: formData.date?.trim() || 'Not specified',
        time: formData.time?.trim() || 'Not specified',
        venue: formData.venue?.trim() || 'Not specified',
        registrationDeadline: formData.registrationDeadline?.trim() || 'Not specified',
        registrationLink: formData.registrationLink?.trim(),
        organizer: formData.organizer?.trim(),
        tags: tags.length > 0 ? tags : [(formData.category as string) || 'Campus'],
        priority: (formData.priority as PriorityLevel) || 'NORMAL',
        source: (formData.source as SourceType) || 'Manual',
        isFavorite: false,
        isCompleted: false,
        isDemoSample: false,
      });
      onShowToast('Notice Created', 'Added manually to campus feed.', 'success');
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {notice ? 'Edit Notice' : 'Add New Notice Manually'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {notice ? 'Update details, venue, or deadline' : 'Create a clean structured campus announcement'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title || ''}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. ACM Annual Student Programming Contest"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 font-medium"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value as PriorityLevel })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 font-medium"
              >
                <option value="URGENT">URGENT (&lt;24h / Critical)</option>
                <option value="TODAY">TODAY</option>
                <option value="UPCOMING">UPCOMING</option>
                <option value="NORMAL">NORMAL</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                <span>Date (YYYY-MM-DD)</span>
              </label>
              <input
                type="text"
                value={formData.date || ''}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                placeholder="2026-11-05 or Not specified"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 font-mono"
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Starting Time</span>
              </label>
              <input
                type="text"
                value={formData.time || ''}
                onChange={e => setFormData({ ...formData, time: e.target.value })}
                placeholder="e.g. 10:00 AM or Not specified"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Venue */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Venue</span>
              </label>
              <input
                type="text"
                value={formData.venue || ''}
                onChange={e => setFormData({ ...formData, venue: e.target.value })}
                placeholder="e.g. Seminar Hall 3 or Not specified"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Registration Deadline */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>Registration Deadline</span>
              </label>
              <input
                type="text"
                value={formData.registrationDeadline || ''}
                onChange={e => setFormData({ ...formData, registrationDeadline: e.target.value })}
                placeholder="YYYY-MM-DD or Not specified"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 font-mono"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description & Key Requirements
            </label>
            <textarea
              rows={4}
              value={formData.description || ''}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide a comprehensive summary of the event, eligibility, and instructions..."
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Link & Organizer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Registration / Official URL
              </label>
              <input
                type="url"
                value={formData.registrationLink || ''}
                onChange={e => setFormData({ ...formData, registrationLink: e.target.value })}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Organizing Club / Department
              </label>
              <input
                type="text"
                value={formData.organizer || ''}
                onChange={e => setFormData({ ...formData, organizer: e.target.value })}
                placeholder="e.g. IEEE Student Branch"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="Coding, Hackathon, Placement, IEEE"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-purple-600 hover:bg-purple-500 transition shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>{notice ? 'Save Changes' : 'Create Notice'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

