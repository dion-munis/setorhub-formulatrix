import React from 'react';
import { useTranslation } from 'react-i18next';

const STATUS_OPTIONS = ['On Progress', 'Done', 'Done (Need Review)', 'Moved to next month', 'Cancelled / Hold', 'Revise'];
const PRIORITY_OPTIONS = ['Urgent', 'Medium', 'Low'];

export default function FilterBar({ search, setSearch, statusFilter, setStatusFilter, priorityFilter, setPriorityFilter, totalCount, filteredCount }) {
  const { t } = useTranslation();
  const hasFilters = search || statusFilter !== 'all' || priorityFilter !== 'all';

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPriorityFilter('all');
  };

  return (
    <div className="flex items-center gap-3 mb-5">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('filter.searchPlaceholder')}
          className="input-field pl-10"
        />
      </div>

      {/* Status filter */}
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="select-field w-48"
      >
        <option value="all">{t('filter.all')}</option>
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {/* Priority filter */}
      <select
        value={priorityFilter}
        onChange={(e) => setPriorityFilter(e.target.value)}
        className="select-field w-40"
      >
        <option value="all">{t('filter.all')}</option>
        {PRIORITY_OPTIONS.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="text-sm text-accent hover:text-accent-hover font-medium whitespace-nowrap"
        >
          {t('filter.reset')}
        </button>
      )}

      {/* Result count */}
      <div className="ml-auto text-sm text-text-secondary">
        {filteredCount === totalCount ? (
          <span>{totalCount} {t('filter.project')}</span>
        ) : (
          <span>{filteredCount} {t('filter.of')} {totalCount} {t('filter.project')}</span>
        )}
      </div>
    </div>
  );
}
