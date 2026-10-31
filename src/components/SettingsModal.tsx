import React, { useState } from 'react';
import {
  X,
  Key,
  Sun,
  Moon,
  User,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
} from 'lucide-react';
import { AppSettings, CampusNotice } from '../types';
import { validateGeminiKey } from '../services/geminiService';
import { storageService } from '../services/storageService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onResetDemo: () => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetDemo,
  onShowToast,
}) => {
  const [apiKey, setApiKey] = useState(settings.geminiApiKey);
  const [userName, setUserName] = useState(settings.userName);
  const [userRole, setUserRole] = useState(settings.userRole);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyValidationStatus, setKeyValidationStatus] = useState<{
    tested: boolean;
    valid?: boolean;
    error?: string;
  }>({ tested: false });

  if (!isOpen) return null;

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      onShowToast('API Key Required', 'Please enter a Gemini API key first.', 'warning');
      return;
    }

    setIsTestingKey(true);
    setKeyValidationStatus({ tested: false });

    try {
      const res = await validateGeminiKey(apiKey);
      setKeyValidationStatus({ tested: true, valid: res.valid, error: res.error });
      if (res.valid) {
        onShowToast('Connected!', 'Gemini API is verified and ready for extraction.', 'success');
      } else {
        onShowToast('Verification Failed', res.error || 'Check key and permissions.', 'warning');
      }
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleSave = () => {
    onSaveSettings({
      ...settings,
      geminiApiKey: apiKey.trim(),
      userName: userName.trim() || 'Alex Rivera',
      userRole: userRole.trim() || 'Student',
    });
    onShowToast('Settings Saved', 'Your preferences have been updated.', 'success');
    onClose();
  };

  const handleExportData = () => {
    const jsonStr = storageService.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campus-pulse-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast('Backup Exported', 'Downloaded complete campus database as JSON.', 'success');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const content = evt.target?.result as string;
      if (content) {
        const result = storageService.importData(content);
        if (result.success) {
          onShowToast('Import Successful', result.message, 'success');
          window.location.reload();
        } else {
          onShowToast('Import Failed', result.message, 'warning');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Application Settings
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AI extraction engines, student profile & backups
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* AI Engine Section */}
          <div className="p-4 rounded-2xl bg-purple-500/5 dark:bg-purple-950/20 border border-purple-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-purple-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Google Gemini AI Integration
                </h3>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                Optional BYO Key
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              If an API key is provided, Campus Pulse connects directly to <b>Gemini 1.5 Flash</b>. Otherwise, our built-in <b>Smart Local Heuristic Parser</b> runs locally with zero external network dependencies.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Gemini API Key
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => {
                    setApiKey(e.target.value);
                    setKeyValidationStatus({ tested: false });
                  }}
                  placeholder="AIzaSy..."
                  className="flex-1 px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={handleTestKey}
                  disabled={isTestingKey || !apiKey.trim()}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-800 hover:bg-purple-200 transition disabled:opacity-50"
                >
                  {isTestingKey ? 'Testing...' : 'Verify'}
                </button>
              </div>

              {keyValidationStatus.tested && (
                <div className="mt-2 text-xs flex items-center gap-1.5">
                  {keyValidationStatus.valid ? (
                    <span className="text-emerald-500 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Key verified and active!
                    </span>
                  ) : (
                    <span className="text-rose-500 flex items-center gap-1 font-semibold">
                      <AlertCircle className="w-3.5 h-3.5" /> Failed: {keyValidationStatus.error}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Student Profile */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-500" />
              <span>Student Profile</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Department & Class
                </label>
                <input
                  type="text"
                  value={userRole}
                  onChange={e => setUserRole(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Data Management & Backups */}
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Data Management & Backup
            </h3>

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={handleExportData}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON Backup</span>
              </button>

              <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Import JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Reset all notices to default demo data?')) {
                    onResetDemo();
                    onShowToast('Reset Complete', 'Loaded 8 realistic campus demo announcements.', 'info');
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-purple-600 hover:bg-purple-500 transition shadow-sm"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

