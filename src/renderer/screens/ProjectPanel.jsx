import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '../store/useProjectStore.js';

const STATUS_OPTIONS = ['On Progress', 'Done', 'Done (Need Review)', 'Moved to next month', 'Cancelled / Hold', 'Revise'];
const PRIORITY_OPTIONS = ['Urgent', 'Medium', 'Low'];

export default function ProjectPanel() {
  const { t, i18n } = useTranslation();
  const { selectedProject, closePanel, updateProject } = useProjectStore();
  const [form, setForm] = useState({
    status: selectedProject.status,
    priority: selectedProject.priority,
    approver: selectedProject.approver || '',
    comments: selectedProject.comments || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await updateProject(selectedProject.id, selectedProject.folder_path, form);
    setSaving(false);
    closePanel();
  };

  return (
    <div className="fixed inset-0 z-50 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink/20 backdrop-blur-sm" onClick={closePanel} />

      {/* Panel */}
      <div className="absolute inset-y-0 right-0 w-full max-w-md bg-surface shadow-panel-lg flex flex-col animate-slide-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold text-ink truncate">{selectedProject.project_name}</h2>
              <p className="text-2xs text-text-secondary font-mono mt-0.5 truncate">{selectedProject.folder_path}</p>
            </div>
            <button
              onClick={closePanel}
              className="ml-3 p-1.5 rounded-lg text-slate-400 hover:text-ink hover:bg-slate-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-5">
            {/* Status */}
            <div>
              <label className="block text-2xs font-medium text-text-secondary uppercase tracking-wider mb-1.5">{t('panel.status')}</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="select-field"
              >
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-2xs font-medium text-text-secondary uppercase tracking-wider mb-1.5">{t('panel.priority')}</label>
              <div className="flex gap-2">
                {PRIORITY_OPTIONS.map((p) => {
                  const isActive = form.priority === p;
                  const colors = {
                    Urgent: isActive ? 'bg-red-500 text-white border-red-500' : 'border-red-200 text-red-600 hover:bg-red-50',
                    Medium: isActive ? 'bg-amber-400 text-white border-amber-400' : 'border-amber-200 text-amber-600 hover:bg-amber-50',
                    Low: isActive ? 'bg-emerald-400 text-white border-emerald-400' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50',
                  };
                  return (
                    <button
                      key={p}
                      onClick={() => setForm({ ...form, priority: p })}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all duration-150 ${colors[p]}`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tanggal Mulai */}
            <div>
              <label className="block text-2xs font-medium text-text-secondary uppercase tracking-wider mb-1.5">{t('panel.startDate')}</label>
              <div className="input-field bg-slate-50 text-text-secondary">
                {selectedProject.created_at
                  ? new Date(selectedProject.created_at).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
                  : '-'}
              </div>
            </div>

            {/* Approver */}
            <div>
              <label className="block text-2xs font-medium text-text-secondary uppercase tracking-wider mb-1.5">{t('panel.approver')}</label>
              <input
                type="text"
                value={form.approver}
                onChange={(e) => setForm({ ...form, approver: e.target.value })}
                className="input-field"
                placeholder={t('panel.approverPlaceholder')}
              />
            </div>

            {/* Comments */}
            <div>
              <label className="block text-2xs font-medium text-text-secondary uppercase tracking-wider mb-1.5">{t('panel.comments')}</label>
              <textarea
                value={form.comments}
                onChange={(e) => setForm({ ...form, comments: e.target.value })}
                rows={4}
                className="input-field resize-none"
                placeholder={t('panel.commentsPlaceholder')}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-slate-50/80">
          <div className="flex gap-3">
            <button onClick={closePanel} className="btn-secondary flex-1">
              {t('panel.cancel')}
            </button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
              {saving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t('panel.saving')}
                </>
              ) : t('panel.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
