import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as i18nModule from './i18n';

describe('i18n Setup', () => {
  let localStorageMock: { [key: string]: string } = {};
  
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Setup localStorage mock
    localStorageMock = {};
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(
      (key: string) => localStorageMock[key] || null
    );
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(
      (key: string, value: string) => {
        localStorageMock[key] = value;
      }
    );
    
    // Mock navigator.language
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with English as default when no saved preference or browser preference', () => {
    // Mock browser language to be unsupported
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('invalid-lang');
    
    // We need to spy on the actual method implementation
    const i18n = i18nModule.createI18nStore();
    const setLanguageSpy = vi.spyOn(i18n, 'setLanguage');
    
    i18n.initialize();
    
    expect(setLanguageSpy).toHaveBeenCalledWith('en');
  });

  it('should use saved preference from localStorage if available', () => {
    // Set a saved preference
    localStorageMock['preferredLanguage'] = 'fr';
    
    const i18n = i18nModule.createI18nStore();
    const setLanguageSpy = vi.spyOn(i18n, 'setLanguage');
    
    i18n.initialize();
    
    expect(setLanguageSpy).toHaveBeenCalledWith('fr');
  });

  it('should use browser language if no saved preference and language is supported', () => {
    // Set browser language to Spanish
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('es');
    
    // Create a new instance of i18n to avoid shared state issues
    const i18n = i18nModule.createI18nStore();
    const setLanguageSpy = vi.spyOn(i18n, 'setLanguage');
    
    i18n.initialize();
    
    expect(setLanguageSpy).toHaveBeenCalledWith('es');
  });

  it('should verify all language files are properly registered', () => {
    // Just test that the core languages have translations
    const i18n = i18nModule.createI18nStore();
    expect(Object.keys(i18n.translations)).toContain('en');
    expect(Object.keys(i18n.translations)).toContain('es');
    expect(Object.keys(i18n.translations)).toContain('fr');
    
    // Test a few translations
    expect(i18n.t('inhale', 'en')).toBe('Inhale');
    expect(i18n.t('hold', 'es')).toBe('Mantén');
    expect(i18n.t('exhale', 'fr')).toBe('Expirez');
  });
});