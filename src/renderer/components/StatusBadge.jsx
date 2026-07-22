import React from 'react';
import { useTranslation } from 'react-i18next';

const STATUS_CONFIG = {
  'On Progress': {
    bg: 'bg-status-progress-bg',
    text: 'text-amber-700',
    dot: 'bg-status-progress',
    border: 'border-amber-200',
  },
  'Done': {
    bg: 'bg-status-done-bg',
    text: 'text-emerald-700',
    dot: 'bg-status-done',
    border: 'border-emerald-200',
  },
  'Done (Need Review)': {
    bg: 'bg-status-review-bg',
    text: 'text-blue-700',
    dot: 'bg-status-review',
    border: 'border-blue-200',
  },
  'Moved to next month': {
    bg: 'bg-status-delayed-bg',
    text: 'text-violet-700',
    dot: 'bg-status-delayed',
    border: 'border-violet-200',
  },
  'Cancelled / Hold': {
    bg: 'bg-status-cancelled-bg',
    text: 'text-gray-600',
    dot: 'bg-status-cancelled',
    border: 'border-gray-200',
  },
  'Revise': {
    bg: 'bg-status-revise-bg',
    text: 'text-red-700',
    dot: 'bg-status-revise',
    border: 'border-red-200',
  },
};

const STATUS_LABELS = {
  'On Progress': 'status.onProgress',
  'Done': 'status.done',
  'Done (Need Review)': 'status.needReview',
  'Moved to next month': 'status.delayed',
  'Cancelled / Hold': 'status.cancelled',
  'Revise': 'status.revise',
};

export default function StatusBadge({ status }) {
  const { t } = useTranslation();
  const config = STATUS_CONFIG[status] || {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
    border: 'border-slate-200',
  };

  const labelKey = STATUS_LABELS[status];
  const displayLabel = labelKey ? t(labelKey) : status;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-2xs font-medium border ${config.bg} ${config.text} ${config.border} whitespace-nowrap`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {displayLabel}
    </span>
  );
}
