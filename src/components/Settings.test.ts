import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { breathingStore } from '../stores/breathingStore';
import { audioStore } from '../stores/audioStore';

// Mock dependencies
vi.mock('@lucide/svelte/icons/settings', () => ({
  default: vi.fn()
}));

vi.mock('../stores/breathingStore', () => ({
  breathingStore: {
    subscribe: vi.fn((callback) => {
      callback({
        settings: {
          inhaleDuration: 4,
          holdDuration: 7,
          exhaleDuration: 8,
          restDuration: 2,
          maxCycles: 4,
          soundsEnabled: true,
          volume: 0.7
        }
      });
      return () => {};
    }),
    updateSettings: vi.fn()
  }
}));

vi.mock('../stores/audioStore', () => ({
  audioStore: {
    setVolume: vi.fn()
  }
}));

vi.mock('svelte-i18n', () => ({
  _: () => ({ 
    subscribe: (fn: Function) => {
      fn('translated text');
      return { unsubscribe: () => {} };
    }
  })
}));

// Simulate the Settings functionality for testing
function createSettingsComponent() {
  let showSettings = false;
  let settings = {
    inhaleDuration: 4,
    holdDuration: 7,
    exhaleDuration: 8,
    restDuration: 2,
    maxCycles: 4,
    soundsEnabled: true,
    volume: 0.7
  };
  
  // Mock event handlers
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && showSettings) {
      showSettings = false;
    }
  }
  
  function handleBackdropClick(event: any) {
    // Only close if clicking directly on the backdrop element
    if (event.target === event.currentTarget) {
      showSettings = false;
    }
  }
  
  function toggleSettings() {
    showSettings = !showSettings;
  }
  
  function saveSettings() {
    // Ensure maxCycles is a number
    settings.maxCycles = Number(settings.maxCycles);
    
    breathingStore.updateSettings(settings);
    
    // Update audio settings
    if (settings.soundsEnabled !== undefined) {
      audioStore.setVolume(settings.volume);
    }
    
    // Close settings modal
    showSettings = false;
  }
  
  function updateSetting(key: string, value: any) {
    settings = {
      ...settings,
      [key]: value
    };
  }
  
  return {
    get showSettings() { return showSettings; },
    get settings() { return settings; },
    handleKeydown,
    handleBackdropClick,
    toggleSettings,
    saveSettings,
    updateSetting
  };
}

describe('Settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  it('should toggle settings visibility when toggleSettings is called', () => {
    const component = createSettingsComponent();
    
    // Initially hidden
    expect(component.showSettings).toBe(false);
    
    // Show settings
    component.toggleSettings();
    expect(component.showSettings).toBe(true);
    
    // Hide settings
    component.toggleSettings();
    expect(component.showSettings).toBe(false);
  });
  
  it('should close settings when Escape key is pressed', () => {
    const component = createSettingsComponent();
    
    // Show settings first
    component.toggleSettings();
    expect(component.showSettings).toBe(true);
    
    // Press Escape key
    component.handleKeydown({ key: 'Escape' } as KeyboardEvent);
    expect(component.showSettings).toBe(false);
    
    // Other keys should have no effect when settings are closed
    component.handleKeydown({ key: 'Enter' } as KeyboardEvent);
    expect(component.showSettings).toBe(false);
  });
  
  it('should close settings when clicking on backdrop', () => {
    const component = createSettingsComponent();
    
    // Show settings first
    component.toggleSettings();
    expect(component.showSettings).toBe(true);
    
    // Click on backdrop (target === currentTarget)
    const mockEvent = {
      target: 'backdrop',
      currentTarget: 'backdrop'
    };
    component.handleBackdropClick(mockEvent);
    expect(component.showSettings).toBe(false);
    
    // Show settings again
    component.toggleSettings();
    
    // Click on a child element (target !== currentTarget)
    const mockChildEvent = {
      target: 'child',
      currentTarget: 'backdrop'
    };
    component.handleBackdropClick(mockChildEvent);
    // Settings should still be visible
    expect(component.showSettings).toBe(true);
  });
  
  it('should save settings and close modal when saveSettings is called', () => {
    const component = createSettingsComponent();
    
    // Show settings
    component.toggleSettings();
    
    // Change some settings
    component.updateSetting('inhaleDuration', 5);
    component.updateSetting('maxCycles', '10'); // String to test conversion
    
    // Save settings
    component.saveSettings();
    
    // Check if breathingStore.updateSettings was called with correct values
    expect(breathingStore.updateSettings).toHaveBeenCalledWith({
      ...component.settings,
      inhaleDuration: 5,
      maxCycles: 10 // Should be converted to number
    });
    
    // Audio volume should be updated
    expect(audioStore.setVolume).toHaveBeenCalledWith(component.settings.volume);
    
    // Modal should be closed
    expect(component.showSettings).toBe(false);
  });
});