import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import id from './id.json';
import en from './en.json';

const savedLang = localStorage.getItem('setorhub-lang') || 'id';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      id: { translation: id },
      en: { translation: en },
    },
    fallbackLng: 'id',
    lng: savedLang,
    interpolation: {
      escapeValue: false,
    },
  });

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('setorhub-lang', lng);
  document.documentElement.lang = lng;
});

document.documentElement.lang = savedLang;

export default i18n;
