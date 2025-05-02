import { addMessages, init, getLocaleFromNavigator, locale, _ } from 'svelte-i18n';

// Import language files
import en from './locales/en';
import pt from './locales/pt';
import es from './locales/es';
import zh from './locales/zh';
import hi from './locales/hi';
import ar from './locales/ar';
import fr from './locales/fr';

// Function to get the initial locale based on browser or localStorage
function getInitialLocale() {
  if (typeof window === 'undefined') {
    return 'en';
  }
  
  // Check if a preferred language is stored in localStorage
  const savedLocale = localStorage.getItem('preferredLanguage');
  
  if (savedLocale) {
    return savedLocale;
  }
  
  // Fallback to browser language if available
  const browserLocale = navigator.language.split('-')[0];
  // Support all available languages or default to English
  return ['en', 'pt', 'es', 'zh', 'hi', 'ar', 'fr'].includes(browserLocale) ? browserLocale : 'en';
}

// Add messages to the dictionary
addMessages('en', en);
addMessages('pt', pt);
addMessages('es', es);
addMessages('zh', zh);
addMessages('hi', hi);
addMessages('ar', ar);
addMessages('fr', fr);

// Initialize i18n with appropriate settings
function setupI18n() {
  const initialLocale = getInitialLocale();
  
  init({
    fallbackLocale: 'en',
    initialLocale: initialLocale,
  });
}

// Setup on load
setupI18n();

export { _, locale };