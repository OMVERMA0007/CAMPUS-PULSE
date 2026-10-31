import React, { useState } from 'react';
import {
  X,
  Zap,
  Sparkles,
  Layers,
  AlertTriangle,
  Check,
  Calendar,
  Clock,
  MapPin,
  Tag,
  Flame,
  ArrowRight,
  Info,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';
import { ExtractedNoticeDraft, Category, PriorityLevel, CampusNotice, SourceType } from '../types';
import { CATEGORIES } from '../types';
import { PRESET_NOTICES, PresetNotice } from '../data/presetTexts';
import { extractNoticeDetails } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { CATEGORY_COLORS } from '../utils/uiColors';

interface SmartAIInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveBatch: (drafts: Array<Omit<CampusNotice, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  existingNotices: CampusNotice[];
  geminiApiKey?: string;
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
}

export const SmartAIInputModal: React.FC<SmartAIInputModalProps> = ({
  isOpen,
  onClose,
  onSaveBatch,
  existingNotices,
  geminiApiKey,
  onShowToast,
}) => {
  const [rawText, setRawText] = useState('');
  const [sourceType, setSourceType] = useState<SourceType>('WhatsApp');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionResult, setExtractionResult] = useState<{
    drafts: ExtractedNoticeDraft[];
    engine: 'Gemini AI' | 'Smart Local Parser';
    errorMessage?: string;
  } | null>(null);

  // Active editable drafts
  const [editableDrafts, setEditableDrafts] = useState<ExtractedNoticeDraft[]>([]);
  const [activeDraftIndex, setActiveDraftIndex] = useState(0);

  // Duplicates warnings
  const [duplicateWarnings, setDuplicateWarnings] = useState<CampusNotice[]>([]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: PresetNotice) => {
    setRawText(preset.text);
    setSourceType(preset.sourceType);
    setExtractionResult(null);
    setEditableDrafts([]);
    setDuplicateWarnings([]);
  };

  const handleExtract = async () => {
    if (!rawText.trim()) {
      onShowToast('Empty Input', 'Please paste an announcement or select a preset example.', 'warning');
      return;
    }

    setIsExtracting(true);
    setExtractionResult(null);

    try {
      const result = await extractNoticeDetails(rawText, geminiApiKey);
      setExtractionResult(result);
      setEditableDrafts(result.drafts);
      setActiveDraftIndex(0);

      // Check for duplicate notices against existing database
      if (result.drafts.length > 0) {
        const first = result.drafts[0];
        const dupes = storageService.findPossibleDuplicates(
          first.title,
          existingNotices,
          first.date
        );
        setDuplicateWarnings(dupes);
      }

      onShowToast(
        `Extracted ${result.drafts.length} Event${result.drafts.length > 1 ? 's' : ''}`,
        `Processed using ${result.engine}. You can review and adjust any field.`,
        'success'
      );
    } catch (e) {
      onShowToast('Extraction Error', (e as Error).message, 'warning');
    } finally {
      setIsExtracting(false);
    }
  };

  const updateActiveDraft = (field: keyof ExtractedNoticeDraft, value: unknown) => {
    setEditableDrafts(prev => {
      const copy = [...prev];
      copy[activeDraftIndex] = {
        ...copy[activeDraftIndex],
        [field]: value,
      };
      return copy;
    });
  };

  const handleSaveAll = () => {
    if (editableDrafts.length === 0) return;

    const noticesToCreate: Array<Omit<CampusNotice, 'id' | 'createdAt' | 'updatedAt'>> = editableDrafts.map(d => ({
      title: d.title || 'Campus Notice',
      description: d.description || '',
      category: d.category || 'Other',
      date: d.date || 'Not specified',
      time: d.time || 'Not specified',
      venue: d.venue || 'Not specified',
      registrationDeadline: d.registrationDeadline || 'Not specified',
      registrationLink: d.registrationLink,
      organizer: d.organizer,
      tags: d.tags && d.tags.length > 0 ? d.tags : [d.category],
      priority: d.priority || 'NORMAL',
      source: sourceType,
      rawText,
      isFavorite: false,
      isCompleted: false,
      isDemoSample: false,
      extractionEngine: extractionResult?.engine || 'Smart Local Parser',
    }));

    onSaveBatch(noticesToCreate);
    onShowToast(
      'Saved to Campus Pulse!',
      `Successfully added ${editableDrafts.length} notice${editableDrafts.length > 1 ? 's' : ''} to your campus feed.`,
      'success'
    );
    onClose();
    // Reset state
    setRawText('');
    setExtractionResult(null);
    setEditableDrafts([]);
    setDuplicateWarnings([]);
  };

  const activeDraft = editableDrafts[activeDraftIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25">
              <Zap className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Smart AI Notice Extractor</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                  Zero Hallucination
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Paste messy WhatsApp forwards, emails, posters or club announcements.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Presets Strip */}
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>Or try a realistic sample forward:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESET_NOTICES.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyPreset(p)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-950/50 hover:text-purple-700 dark:hover:text-purple-300 border border-slate-200 dark:border-slate-700 transition"
                  title={p.description}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Large Text Area */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Paste Announcement Text
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Source:</span>
                <select
                  value={sourceType}
                  onChange={e => setSourceType(e.target.value as SourceType)}
                  className="text-xs px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium"
                >
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Email">College Email</option>
                  <option value="Notice Board">Notice Board</option>
                  <option value="Poster">Event Poster</option>
                  <option value="Manual">Manual Entry</option>
                </select>
              </div>
            </div>

            <textarea
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              placeholder="Paste unstructured campus text here... e.g. '🚨 Urgent: Coding Hackathon on Nov 4 at 9 AM in Comp Lab 4! Register by tonight 11:59 PM...'"
              rows={6}
              className="w-full rounded-2xl p-4 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono transition"
            />
          </div>

          {/* Extract Button Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Info className="w-4 h-4 text-purple-400 shrink-0" />
              <span>
                Missing details will be marked as <b>"Not specified"</b>. No hallucinated dates.
              </span>
            </div>

            <button
              onClick={handleExtract}
              disabled={isExtracting || !rawText.trim()}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-purple-600/20 transition-all hover:scale-102 active:scale-98"
            >
              {isExtracting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Analyzing & Extracting...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-cyan-300" />
                  <span>Extract with AI</span>
                </>
              )}
            </button>
          </div>

          {/* Extraction Results & Review Editor */}
          {editableDrafts.length > 0 && activeDraft && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
              {/* Engine Status & Multi-Event Tab Strip */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Engine Used:
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      extractionResult?.engine === 'Gemini AI'
                        ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                        : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800'
                    }`}
                  >
                    {extractionResult?.engine === 'Gemini AI'
                      ? '✨ Gemini 1.5 Flash'
                      : '⚡ Smart Local Parser'}
                  </span>
                </div>

                {/* Multi-event tab switcher if more than 1 event */}
                {editableDrafts.length > 1 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                      Multi-event detected:
                    </span>
                    <div className="flex gap-1">
                      {editableDrafts.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveDraftIndex(idx)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                            activeDraftIndex === idx
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300'
                          }`}
                        >
                          Event {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Duplicate Warning Alert */}
              {duplicateWarnings.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 flex items-start gap-3 text-xs">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Duplicate Warning: </span>
                    A similar notice already exists in your feed:{' '}
                    <b>"{duplicateWarnings[0].title}"</b> (Date: {duplicateWarnings[0].date}).
                    You can still proceed or edit the fields below.
                  </div>
                </div>
              )}

              {/* Interactive Review Form */}
              <div className="rounded-2xl p-5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Review & Edit Extracted Fields</span>
                    <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                      (Card {activeDraftIndex + 1} of {editableDrafts.length})
                    </span>
                  </h4>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Ready for Feed
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Event Title
                    </label>
                    <input
                      type="text"
                      value={activeDraft.title}
                      onChange={e => updateActiveDraft('title', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Category
                    </label>
                    <select
                      value={activeDraft.category}
                      onChange={e => updateActiveDraft('category', e.target.value as Category)}
                      className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Priority Level
                    </label>
                    <select
                      value={activeDraft.priority}
                      onChange={e => updateActiveDraft('priority', e.target.value as PriorityLevel)}
                      className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="URGENT">URGENT (&lt;24h / Critical)</option>
                      <option value="TODAY">TODAY</option>
                      <option value="UPCOMING">UPCOMING</option>
                      <option value="NORMAL">NORMAL</option>
                    </select>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-purple-400" />
                      <span>Event Date</span>
                    </label>
                    <input
                      type="text"
                      value={activeDraft.date}
                      onChange={e => updateActiveDraft('date', e.target.value)}
                      placeholder="YYYY-MM-DD or Not specified"
                      className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 font-mono"
                    />
                  </div>

                  {/* Starting Time */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Starting Time</span>
                    </label>
                    <input
                      type="text"
                      value={activeDraft.time}
                      onChange={e => updateActiveDraft('time', e.target.value)}
                      placeholder="e.g. 10:00 AM or Not specified"
                      className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Venue */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Venue / Location</span>
                    </label>
                    <input
                      type="text"
                      value={activeDraft.venue}
                      onChange={e => updateActiveDraft('venue', e.target.value)}
                      placeholder="e.g. Seminar Hall 2 or Not specified"
                      className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Registration Deadline */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-rose-400" />
                      <span>Registration Deadline</span>
                    </label>
                    <input
                      type="text"
                      value={activeDraft.registrationDeadline}
                      onChange={e => updateActiveDraft('registrationDeadline', e.target.value)}
                      placeholder="YYYY-MM-DD or Not specified"
                      className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Description & Summary
                    </label>
                    <textarea
                      value={activeDraft.description}
                      onChange={e => updateActiveDraft('description', e.target.value)}
                      rows={3}
                      className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Registration Link (Optional) */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Registration Link (Optional)
                    </label>
                    <input
                      type="url"
                      value={activeDraft.registrationLink || ''}
                      onChange={e => updateActiveDraft('registrationLink', e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Save All Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Discard
                </button>
                <button
                  onClick={handleSaveAll}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/25 transition-all hover:scale-102 active:scale-98"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    Save {editableDrafts.length > 1 ? `All ${editableDrafts.length} Notices` : 'Notice to Dashboard'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

