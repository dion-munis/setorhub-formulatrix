import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '../store/useProjectStore.js';

const MAX_DEPTH = 10;

function generateExample(depth, t) {
  const parts = [
    t('onboarding.rootFolder'),
    t('onboarding.category'),
    t('onboarding.subCategory'),
    t('onboarding.division'),
    t('onboarding.team'),
    t('onboarding.campaign'),
    t('onboarding.asset'),
    t('onboarding.version'),
    t('onboarding.variant'),
    t('onboarding.final'),
  ];
  const selected = parts.slice(0, depth + 1);
  selected[selected.length - 1] = t('onboarding.projectName');
  return selected.join(' / ');
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const { rootPath, driveRoot, scanDepth, updateSettings } = useProjectStore();
  const [newPath, setNewPath] = useState(rootPath || '');
  const [newDepth, setNewDepth] = useState(scanDepth);
  const [newDriveRoot, setNewDriveRoot] = useState(driveRoot || '');
  const [useCustomDriveRoot, setUseCustomDriveRoot] = useState(!!driveRoot);
  const [saving, setSaving] = useState(false);

  const hasChanges = newPath !== rootPath || newDepth !== scanDepth ||
    useCustomDriveRoot !== !!driveRoot || (useCustomDriveRoot && newDriveRoot !== driveRoot);

  const handlePickFolder = async () => {
    const selected = await window.api.selectFolder();
    if (selected) setNewPath(selected);
  };

  const handlePickDriveRoot = async () => {
    const selected = await window.api.selectFolder();
    if (selected) setNewDriveRoot(selected);
  };

  const handleSave = useCallback(async () => {
    if (!newPath || !hasChanges || saving) return;
    setSaving(true);
    const driveRootValue = useCustomDriveRoot ? newDriveRoot : '';
    await updateSettings(newPath, newDepth, driveRootValue);
    setSaving(false);
  }, [newPath, hasChanges, saving, useCustomDriveRoot, newDriveRoot, newDepth, updateSettings]);

  return (
    <div>
      {/* Settings Card */}
      <div className="card p-6 space-y-6">
        {/* Root Path */}
        <div>
          <label className="block text-sm font-medium text-ink mb-2">{t('settings.rootFolder')}</label>
          <div className="flex gap-2">
            <div className="flex-1 min-w-0">
              <div className="input-field truncate bg-slate-50 text-ink font-mono text-xs">
                {newPath || t('settings.notSelected')}
              </div>
            </div>
            <button onClick={handlePickFolder} className="btn-secondary whitespace-nowrap">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              {t('settings.pick')}
            </button>
          </div>
          {newPath !== rootPath && newPath && (
            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              {t('settings.changeFolderWarning')}
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Scan Depth */}
        <div>
          <label className="block text-sm font-medium text-ink mb-2">{t('settings.folderLevel')}</label>
          <p className="text-sm text-text-secondary mb-4">
            {t('settings.folderLevelDesc')}
          </p>

          {/* Slider */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-text-secondary">1 {t('settings.level')}</span>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-accent leading-none">{newDepth}</span>
                <span className="text-sm text-text-secondary font-medium">{t('settings.level')}</span>
              </div>
              <span className="text-sm text-text-secondary">{MAX_DEPTH} {t('settings.level')}</span>
            </div>

            <div className="relative px-1">
              <input
                type="range"
                min={1}
                max={MAX_DEPTH}
                value={newDepth}
                onChange={(e) => setNewDepth(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer slider-track"
                style={{
                  background: `linear-gradient(to right, #111827 0%, #111827 ${((newDepth - 1) / (MAX_DEPTH - 1)) * 100}%, #E5E7EB ${((newDepth - 1) / (MAX_DEPTH - 1)) * 100}%, #E5E7EB 100%)`
                }}
              />
              <div className="flex justify-between px-0 mt-1">
                {Array.from({ length: MAX_DEPTH }, (_, i) => (
                  <div
                    key={i}
                    className={`w-1 h-1 rounded-full transition-colors duration-150 ${
                      i + 1 <= newDepth ? 'bg-accent' : 'bg-slate-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Dynamic Example */}
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-text-secondary">
              {t('settings.example', { path: generateExample(newDepth, t), depth: newDepth })}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Drive Root */}
        <div>
          <label className="block text-sm font-medium text-ink mb-2">{t('settings.driveRootOptional')}</label>
          <p className="text-sm text-text-secondary mb-3">
            {t('settings.driveRootDesc')}
          </p>
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => setUseCustomDriveRoot(!useCustomDriveRoot)}
              className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                useCustomDriveRoot ? 'bg-accent' : 'bg-slate-300'
              }`}
            >
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                useCustomDriveRoot ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
            <span className="text-sm text-ink">
              {useCustomDriveRoot ? t('settings.useCustomDrive') : t('settings.sameAsRoot')}
            </span>
          </div>
          {useCustomDriveRoot && (
            <div className="flex gap-2">
              <div className="flex-1 min-w-0">
                <div className="input-field truncate bg-slate-50 text-ink font-mono text-xs">
                  {newDriveRoot || t('settings.notSelected')}
                </div>
              </div>
              <button onClick={handlePickDriveRoot} className="btn-secondary whitespace-nowrap">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                {t('settings.pick')}
              </button>
            </div>
          )}
          <div className="mt-3 p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-text-secondary">
              {useCustomDriveRoot ? (
                t('settings.driveExampleCustom', { driveRoot: 'D:\\Marketing\\Project', folderPath: 'H2 2026 TEST\\NT8\\VIDEOS' })
              ) : (
                t('settings.driveExampleDefault')
              )}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Save Button */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            {hasChanges ? t('settings.unsavedChanges') : t('settings.noChanges')}
          </p>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`btn-primary ${!hasChanges || saving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {saving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t('settings.saving')}
              </>
            ) : t('settings.saveRescan')}
          </button>
        </div>
      </div>
    </div>
  );
}
