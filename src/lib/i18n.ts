import { addMessages, init, getLocaleFromNavigator, locale, _ } from 'svelte-i18n';
import { writable } from 'svelte/store';

// Import language files
import en from './locales/en';
import pt from './locales/pt';
import es from './locales/es';
import zh from './locales/zh';
import hi from './locales/hi';
import ar from './locales/ar';
import fr from './locales/fr';

// Language definitions
export const SUPPORTED_LANGUAGES = ['en', 'pt', 'es', 'zh', 'hi', 'ar', 'fr'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export const translations = {
  en: {
    inhale: 'Inhale',
    hold: 'Hold',
    exhale: 'Exhale',
    rest: 'Rest'
  },
  es: {
    inhale: 'Inhala',
    hold: 'Mantén',
    exhale: 'Exhala',
    rest: 'Descansa'
  },
  fr: {
    inhale: 'Inspirez',
    hold: 'Retenez',
    exhale: 'Expirez',
    rest: 'Reposez'
  },
  pt: {
    inhale: 'Inspire',
    hold: 'Segure',
    exhale: 'Expire',
    rest: 'Descanse'
  },
  zh: {
    inhale: '吸气',
    hold: '保持',
    exhale: '呼气',
    rest: '休息'
  },
  hi: {
    inhale: 'सांस लें',
    hold: 'रोकें',
    exhale: 'सांस छोड़ें',
    rest: 'आराम करें'
  },
  ar: {
    inhale: 'استنشق',
    hold: 'امسك',
    exhale: 'زفير',
    rest: 'استراحة'
  }
};

// Add messages to the dictionary
addMessages('en', en);
addMessages('pt', pt);
addMessages('es', es);
addMessages('zh', zh);
addMessages('hi', hi);
addMessages('ar', ar);
addMessages('fr', fr);

// Initialize i18n with appropriate settings
export function setupI18n() {
  const initialLocale = getInitialLocale();
  
  init({
    fallbackLocale: 'en',
    initialLocale: initialLocale,
  });
}

type TranslationKey = keyof typeof translations['en'];

// Function to get the initial locale based on browser or localStorage
function getInitialLocale() {
  if (typeof window === 'undefined') {
    return 'en';
  }
  
  // Check if a preferred language is stored in localStorage
  const savedLocale = localStorage.getItem('preferredLanguage');
  
  if (savedLocale && SUPPORTED_LANGUAGES.includes(savedLocale as SupportedLanguage)) {
    return savedLocale;
  }
  
  // Fallback to browser language if available
  const browserLocale = navigator.language.split('-')[0];
  // Support all available languages or default to English
  return SUPPORTED_LANGUAGES.includes(browserLocale as SupportedLanguage) ? browserLocale : 'en';
}

export function createI18nStore() {
  const { subscribe, set } = writable<SupportedLanguage>('en');

  const store = {
    subscribe,
    setLanguage(lang: SupportedLanguage) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('preferredLanguage', lang);
      }
      locale.set(lang);
      set(lang);
      return lang;
    },
    initialize() {
      // Get saved preference if any
      const savedLang = typeof localStorage !== 'undefined' 
        ? localStorage.getItem('preferredLanguage') as SupportedLanguage 
        : null;
      
      if (savedLang && SUPPORTED_LANGUAGES.includes(savedLang)) {
        this.setLanguage(savedLang);
        return;
      }
      
      // Try browser language
      if (typeof navigator !== 'undefined') {
        const browserLang = navigator.language.split('-')[0] as SupportedLanguage;
        if (SUPPORTED_LANGUAGES.includes(browserLang)) {
          this.setLanguage(browserLang);
          return;
        }
      }
      
      // Default to English
      this.setLanguage('en');
    },
    t(key: TranslationKey, lang: SupportedLanguage = 'en') {
      return translations[lang]?.[key] || key;
    },
    translations // Export translations for testing
  };

  return store;
}

export const i18n = createI18nStore();

// Setup on load
setupI18n();

export { _, locale };