import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '../store/useProjectStore.js';
import Sidebar from '../components/Sidebar.jsx';
import StatsCard from '../components/StatsCard.jsx';
import ProjectTable from '../components/ProjectTable.jsx';
import FilterBar from '../components/FilterBar.jsx';
import ProjectPanel from './ProjectPanel.jsx';
import SettingsPage from './SettingsPage.jsx';
import LanguageToggle from '../components/LanguageToggle.jsx';

const STATUS_GROUPS = [
  { key: 'On Progress', color: 'bg-status-progress', dotColor: 'bg-status-progress' },
  { key: 'Done', color: 'bg-status-done', dotColor: 'bg-status-done' },
  { key: 'Done (Need Review)', color: 'bg-status-review', dotColor: 'bg-status-review' },
  { key: 'Moved to next month', color: 'bg-status-delayed', dotColor: 'bg-status-delayed' },
  { key: 'Cancelled / Hold', color: 'bg-status-cancelled', dotColor: 'bg-status-cancelled' },
  { key: 'Revise', color: 'bg-status-revise', dotColor: 'bg-status-revise' },
];

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { projects, loading, refreshProjects, selectProject, selectedProject, rootPath } = useProjectStore();
  const [activePage, setActivePage] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const unsubscribe = window.api.onProjectsChanged(() => refreshProjects());
    return unsubscribe;
  }, []);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch = p.project_name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || p.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [projects, search, statusFilter, priorityFilter]);

  const stats = useMemo(() => {
    const counts = {};
    STATUS_GROUPS.forEach((g) => (counts[g.key] = 0));
    projects.forEach((p) => {
      if (counts[p.status] !== undefined) counts[p.status]++;
    });
    return counts;
  }, [projects]);

  const statsCards = useMemo(() => {
    const total = projects.length;
    const onProgress = stats['On Progress'] || 0;
    const done = stats['Done'] || 0;
    const needReview = stats['Done (Need Review)'] || 0;

    const calcTrend = (count) => {
      if (total === 0) return { value: '0%', direction: 'neutral' };
      const pct = Math.round((count / total) * 100);
      return { value: `${pct}%`, direction: pct > 0 ? 'up' : 'neutral' };
    };

    return [
      {
        label: t('stats.totalProjects'),
        value: total,
        trend: `${total > 0 ? '+' : '0'}${total}`,
        trendDirection: total > 0 ? 'up' : 'neutral',
        description: t('stats.thisMonth'),
      },
      {
        label: t('stats.onProgress'),
        value: onProgress,
        trend: calcTrend(onProgress).value,
        trendDirection: calcTrend(onProgress).direction,
        description: t('stats.fromLastMonth'),
      },
      {
        label: t('stats.done'),
        value: done,
        trend: calcTrend(done).value,
        trendDirection: calcTrend(done).direction,
        description: t('stats.fromLastMonth'),
      },
      {
        label: t('stats.needReview'),
        value: needReview,
        trend: calcTrend(needReview).value,
        trendDirection: calcTrend(needReview).direction,
        description: t('stats.fromLastMonth'),
      },
    ];
  }, [projects, stats, t]);

  const handleGenerateReport = async () => {
    if (generating) return;
    setGenerating(true);
    try {
      const dateStr = new Date().toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'id-ID', { month: 'long', year: 'numeric' });
      const reportName = t('dashboard.reportName', { date: dateStr });
      const result = await window.api.generateReport(projects, reportName);
      if (result?.url) {
        window.open(result.url, '_blank');
      }
    } catch (err) {
      console.error('Generate report error:', err);
      alert(t('dashboard.reportFailed') + (err.message || 'Unknown error'));
    } finally {
      setGenerating(false);
    }
  };

  const handleNavigate = (page) => {
    setActivePage(page);
  };

  return (
    <div className="min-h-screen flex bg-paper">
      {/* Sidebar */}
      <Sidebar activePage={activePage} onNavigate={handleNavigate} />

      {/* Main Content */}
      <div className="flex-1 ml-60">
        {/* Header */}
        <header className="bg-surface border-b border-border px-6 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-ink">
                {activePage === 'dashboard' && t('sidebar.dashboard')}
                {activePage === 'analytics' && t('sidebar.analytics')}
                {activePage === 'projects' && t('sidebar.projects')}
                {activePage === 'settings' && t('sidebar.settings')}
              </h1>
              <p className="text-sm text-text-secondary mt-0.5 font-mono">{rootPath}</p>
            </div>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              {activePage !== 'settings' && (
                <>
                  <button onClick={handleGenerateReport} disabled={generating} className="btn-secondary" title={t('dashboard.generateReport')}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {generating ? t('dashboard.generating') : t('dashboard.report')}
                  </button>
                  <button onClick={refreshProjects} disabled={loading} className="btn-primary">
                    <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {loading ? t('dashboard.scanScanning') : t('dashboard.scanRescan')}
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {activePage === 'dashboard' && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {statsCards.map((stat, index) => (
                  <StatsCard key={index} {...stat} />
                ))}
              </div>

              {/* Filters */}
              <FilterBar
                search={search}
                setSearch={setSearch}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                priorityFilter={priorityFilter}
                setPriorityFilter={setPriorityFilter}
                totalCount={projects.length}
                filteredCount={filtered.length}
              />

              {/* Table */}
              <ProjectTable projects={filtered} onSelect={selectProject} />
            </>
          )}

          {activePage === 'analytics' && (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 bg-accent-soft rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-ink mb-2">{t('analyticsPage.title')}</h2>
              <p className="text-sm text-text-secondary">{t('analyticsPage.comingSoon')}</p>
            </div>
          )}

          {activePage === 'projects' && (
            <>
              {/* Filters without stats */}
              <FilterBar
                search={search}
                setSearch={setSearch}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                priorityFilter={priorityFilter}
                setPriorityFilter={setPriorityFilter}
                totalCount={projects.length}
                filteredCount={filtered.length}
              />

              {/* Table */}
              <ProjectTable projects={filtered} onSelect={selectProject} />
            </>
          )}

          {activePage === 'settings' && <SettingsPage />}
        </div>
      </div>

      {/* Modals */}
      {selectedProject && <ProjectPanel />}
    </div>
  );
}
