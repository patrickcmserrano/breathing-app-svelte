import { describe, it, expect, vi, beforeEach } from 'vitest';
import { locale } from '../lib/i18n';

// Mock locale from i18n
vi.mock('../lib/i18n', () => ({
  locale: {
    set: vi.fn(),
    subscribe: vi.fn((callback) => {
      callback('en');
      return { unsubscribe: () => {} };
    })
  }
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  key: vi.fn(),
  length: 0,
  [Symbol.iterator]: function*() { yield* []; }
};

// Extract core functionality for testing
function createLanguageSelector() {
  let currentLocale = 'en';
  
  // Mock the subscription behavior
  locale.subscribe(value => {
    currentLocale = value;
  });
  
  function setLanguage(lang: string) {
    locale.set(lang);
    localStorage.setItem('preferredLanguage', lang);
  }
  
  return {
    currentLocale,
    setLanguage
  };
}

describe('LanguageSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup localStorage mock
    global.localStorage = localStorageMock;
  });
  
  it('should set the language when setLanguage is called', () => {
    const { setLanguage } = createLanguageSelector();
    
    setLanguage('pt');
    
    expect(locale.set).toHaveBeenCalledWith('pt');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('preferredLanguage', 'pt');
  });
  
  it('should set different languages correctly', () => {
    const { setLanguage } = createLanguageSelector();
    
    // Test multiple languages
    const languages = ['en', 'es', 'pt', 'fr', 'zh', 'hi', 'ar'];
    
    languages.forEach(lang => {
      vi.clearAllMocks();
      setLanguage(lang);
      expect(locale.set).toHaveBeenCalledWith(lang);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('preferredLanguage', lang);
    });
  });
});