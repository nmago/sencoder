import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ru from './locales/ru.json';

// Detect user's language
const getBrowserLanguage = (): string => {
  const browserLang = navigator.language.split('-')[0];
  return ['en', 'ru'].includes(browserLang) ? browserLang : 'en';
};

// Get saved language from localStorage or use browser language
const savedLanguage = localStorage.getItem('language') || getBrowserLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru }
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes
    }
  });

// Save language preference when it changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
  document.documentElement.lang = lng;
});

// Set initial lang attribute
document.documentElement.lang = savedLanguage;

export default i18n;
