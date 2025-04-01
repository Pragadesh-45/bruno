import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEn from './translation/en.json';
import translationTa from './translation/ta.json';
import translationHi from './translation/hi.json';
import translationKn from './translation/kn.json';
import translationTe from './translation/te.json';
import translationMl from './translation/ml.json';
import translationFr from './translation/fr.json';
import translationZh from './translation/zh.json';
import translationJa from './translation/ja.json';

const resources = {
  en: {
    translation: translationEn,
  },
  ta: {
    translation: translationTa,
  },
  hi: {
    translation: translationHi,
  },
  kn: {
    translation: translationKn,
  },
  te: {
    translation: translationTe,
  },
  ml: {
    translation: translationMl,
  },
  fr: {
    translation: translationFr,
  },
  zh: {
    translation: translationZh,
  },
  ja: {
    translation: translationJa,
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: 'en', // Use "en" as the default language. "cimode" can be used to debug / show translation placeholder

    ns: 'translation', // Use translation as the default Namespace that will be loaded by default

    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
