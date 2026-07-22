import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const toggle = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
      <button
        onClick={() => toggle('id')}
        className={`px-2 py-1 text-2xs font-medium rounded-md transition-all duration-150 ${
          currentLang === 'id'
            ? 'bg-white text-ink shadow-sm'
            : 'text-text-secondary hover:text-ink'
        }`}
      >
        ID
      </button>
      <button
        onClick={() => toggle('en')}
        className={`px-2 py-1 text-2xs font-medium rounded-md transition-all duration-150 ${
          currentLang === 'en'
            ? 'bg-white text-ink shadow-sm'
            : 'text-text-secondary hover:text-ink'
        }`}
      >
        EN
      </button>
    </div>
  );
}
