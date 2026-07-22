import React from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/index.js';
import StatusBadge from './StatusBadge.jsx';
import DriveButton from './DriveButton.jsx';

function formatDate(iso) {
  if (!iso) return '-';
  const lang = i18n.language;
  return new Date(iso).toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function PriorityDot({ priority }) {
  const colors = {
    Urgent: 'bg-red-500',
    Medium: 'bg-amber-400',
    Low: 'bg-emerald-400',
  };
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-text-secondary">
      <span className={`w-2 h-2 rounded-full ${colors[priority] || 'bg-slate-300'}`} />
      {priority}
    </span>
  );
}

export default function ProjectTable({ projects, onSelect }) {
  const { t } = useTranslation();

  if (projects.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-ink mb-1">{t('table.emptyTitle')}</p>
        <p className="text-sm text-text-secondary">{t('table.emptyHint')}</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-slate-50/50">
              <th className="table-header">{t('table.colProject')}</th>
              <th className="table-header">{t('table.colCategory')}</th>
              <th className="table-header">{t('table.colStatus')}</th>
              <th className="table-header">{t('table.colPriority')}</th>
              <th className="table-header">{t('table.colStartDate')}</th>
              <th className="table-header">{t('table.colApprover')}</th>
              <th className="table-header">{t('table.colModified')}</th>
              <th className="table-header">{t('table.colDrive')}</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p, i) => (
              <tr
                key={p.id}
                onClick={() => onSelect(p)}
                className="table-row cursor-pointer"
              >
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-ink hover:text-accent transition-colors">
                      {p.project_name}
                    </span>
                    {p.missing === 1 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-xs font-medium">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        {t('table.folderMissing')}
                      </span>
                    )}
                  </div>
                </td>
                <td className="table-cell">
                  <span className="text-sm text-text-secondary font-mono">
                    {[p.category, p.sub_category].filter(Boolean).join(' / ') || '-'}
                  </span>
                </td>
                <td className="table-cell"><StatusBadge status={p.status} /></td>
                <td className="table-cell"><PriorityDot priority={p.priority} /></td>
                <td className="table-cell text-text-secondary">{formatDate(p.created_at)}</td>
                <td className="table-cell text-text-secondary">{p.approver || '-'}</td>
                <td className="table-cell text-text-secondary font-mono">{formatDate(p.modified_at)}</td>
                <td className="table-cell">
                  <DriveButton project={p} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
