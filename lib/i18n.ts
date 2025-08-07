import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import des fichiers de traduction
import en from './i18n/en.json';
import fr from './i18n/fr.json';

i18n.use(initReactI18next).init({
  lng: 'en', // Langue par défaut
  fallbackLng: 'fr',
  resources: {
    fr: { translation: fr },
    en: { translation: en },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
