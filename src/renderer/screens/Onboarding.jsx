import React, { useState } from 'react';
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

export default function Onboarding() {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [rootPath, setRootPath] = useState('');
  const [depth, setDepth] = useState(2);
  const [submitting, setSubmitting] = useState(false);
  const completeOnboarding = useProjectStore((s) => s.completeOnboarding);

  const handlePickFolder = async () => {
    const selected = await window.api.selectFolder();
    if (selected) setRootPath(selected);
  };

  const handleFinish = async () => {
    setSubmitting(true);
    await completeOnboarding(rootPath, depth);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-paper">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent/20 p-2">
            <img src="/Logo.webp" alt="SetorHub" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-xl font-semibold text-ink mb-1">{t('app.name')}</h1>
          <p className="text-sm text-text-secondary">{t('app.tagline')}</p>
        </div>

        {/* Card */}
        <div className="card p-6">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-2xs font-semibold ${
              step >= 1 ? 'bg-accent text-white' : 'bg-slate-100 text-slate-400'
            }`}>
              1
            </div>
            <div className={`flex-1 h-0.5 rounded-full ${step >= 2 ? 'bg-accent' : 'bg-slate-100'}`} />
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-2xs font-semibold ${
              step >= 2 ? 'bg-accent text-white' : 'bg-slate-100 text-slate-400'
            }`}>
              2
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-ink mb-1">{t('onboarding.pickRootFolder')}</h2>
                <p className="text-xs text-text-secondary mb-3">
                  {t('onboarding.pickRootDesc')}
                </p>
                <button
                  onClick={handlePickFolder}
                  className="w-full border-2 border-dashed border-border rounded-xl py-6 text-sm text-text-secondary hover:border-accent hover:text-accent hover:bg-accent-soft transition-all duration-150"
                >
                  {rootPath ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      <span className="font-mono text-xs text-ink">{rootPath}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>{t('onboarding.clickToPick')}</span>
                    </div>
                  )}
                </button>
              </div>
              <button
                disabled={!rootPath}
                onClick={() => setStep(2)}
                className="btn-primary w-full"
              >
                {t('onboarding.next')}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-ink mb-1">{t('onboarding.folderLevel')}</h2>
                <p className="text-xs text-text-secondary mb-4">
                  {t('onboarding.folderLevelDesc')}
                </p>

                {/* Slider */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xs text-text-secondary">1 {t('onboarding.level')}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-accent leading-none">{depth}</span>
                      <span className="text-xs text-text-secondary font-medium">{t('onboarding.level')}</span>
                    </div>
                    <span className="text-2xs text-text-secondary">{MAX_DEPTH} {t('onboarding.level')}</span>
                  </div>

                  <div className="relative px-1">
                    <input
                      type="range"
                      min={1}
                      max={MAX_DEPTH}
                      value={depth}
                      onChange={(e) => setDepth(Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer slider-track"
                      style={{
                        background: `linear-gradient(to right, #111827 0%, #111827 ${((depth - 1) / (MAX_DEPTH - 1)) * 100}%, #E5E7EB ${((depth - 1) / (MAX_DEPTH - 1)) * 100}%, #E5E7EB 100%)`
                      }}
                    />
                    {/* Tick marks */}
                    <div className="flex justify-between px-0 mt-1">
                      {Array.from({ length: MAX_DEPTH }, (_, i) => (
                        <div
                          key={i}
                          className={`w-1 h-1 rounded-full transition-colors duration-150 ${
                            i + 1 <= depth ? 'bg-accent' : 'bg-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dynamic Example */}
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-2xs text-text-secondary">
                    {t('onboarding.example', { path: generateExample(depth, t), depth })}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">
                  {t('onboarding.back')}
                </button>
                <button
                  onClick={handleFinish}
                  disabled={submitting}
                  className="btn-primary flex-1"
                >
                  {submitting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {t('onboarding.scanning')}
                    </>
                  ) : t('onboarding.startScan')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
