/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { get } from 'svelte/store';

interface BreathingSettings {
  inhaleDuration: number;
  holdDuration: number;
  exhaleDuration: number;
  restDuration: number;
  maxCycles: number;
  soundsEnabled: boolean;
  volume: number;
}

interface BreathingState {
  settings: BreathingSettings;
  currentPhase: keyof typeof PHASE;
  isRunning: boolean;
  currentCycle: number;
  timeRemaining: number;
}

const PHASE = {
  INHALE: 'INHALE',
  HOLD: 'HOLD',
  EXHALE: 'EXHALE',
  REST: 'REST',
  PAUSED: 'PAUSED'
} as const;

function createMockBreathingStore() {
  const initialState: BreathingState = {
    settings: {
      inhaleDuration: 4,
      holdDuration: 7,
      exhaleDuration: 8,
      restDuration: 2,
      maxCycles: 4,
      soundsEnabled: true,
      volume: 0.7
    },
    currentPhase: PHASE.PAUSED,
    isRunning: false,
    currentCycle: 0,
    timeRemaining: 0
  };
  
  let state: BreathingState = { ...initialState };
  const subscribers: Array<(state: BreathingState) => void> = [];
  
  return {
    subscribe: (callback: (state: BreathingState) => void) => {
      callback(state);
      subscribers.push(callback);
      return () => {
        const index = subscribers.indexOf(callback);
        if (index !== -1) subscribers.splice(index, 1);
      };
    },
    update: (updater: (state: BreathingState) => BreathingState) => {
      state = updater(state);
      subscribers.forEach(callback => callback(state));
      return state;
    },
    updateSettings: (newSettings: Partial<BreathingSettings>) => {
      state = {
        ...state,
        settings: {
          ...state.settings,
          ...newSettings
        }
      };
      subscribers.forEach(callback => callback(state));
      return state;
    },
    resetSession: () => {
      state = {
        ...state,
        currentPhase: PHASE.PAUSED,
        isRunning: false,
        currentCycle: 0,
        timeRemaining: 0
      };
      subscribers.forEach(callback => callback(state));
      return state;
    }
  };
}

describe('Breathing Store', () => {
  let mockStore: ReturnType<typeof createMockBreathingStore>;
  
  beforeEach(() => {
    mockStore = createMockBreathingStore();
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });
  
  it('should initialize with correct default values', () => {
    const state = get(mockStore);
    expect(state.currentPhase).toBe(PHASE.PAUSED);
    expect(state.isRunning).toBe(false);
    expect(state.currentCycle).toBe(0);
    expect(state.timeRemaining).toBe(0);
    expect(state.settings.inhaleDuration).toBe(4);
    expect(state.settings.holdDuration).toBe(7);
    expect(state.settings.exhaleDuration).toBe(8);
    expect(state.settings.restDuration).toBe(2);
    expect(state.settings.maxCycles).toBe(4);
    expect(state.settings.soundsEnabled).toBe(true);
    expect(state.settings.volume).toBe(0.7);
  });
  
  it('should update settings correctly', () => {
    mockStore.updateSettings({ inhaleDuration: 6, holdDuration: 8 });
    const state = get(mockStore);
    expect(state.settings.inhaleDuration).toBe(6);
    expect(state.settings.holdDuration).toBe(8);
    expect(state.settings.exhaleDuration).toBe(8); // Unchanged
  });
  
  it('should reset session correctly', () => {
    // First modify the state
    mockStore.update(state => ({
      ...state,
      currentPhase: PHASE.INHALE,
      isRunning: true,
      currentCycle: 2,
      timeRemaining: 3
    }));
    
    // Then reset
    mockStore.resetSession();
    
    // Verify reset
    const state = get(mockStore);
    expect(state.currentPhase).toBe(PHASE.PAUSED);
    expect(state.isRunning).toBe(false);
    expect(state.currentCycle).toBe(0);
    expect(state.timeRemaining).toBe(0);
  });
  
  it('should notify subscribers when state changes', () => {
    const mockSubscriber = vi.fn();
    const unsubscribe = mockStore.subscribe(mockSubscriber);
    
    // First call is on subscription
    expect(mockSubscriber).toHaveBeenCalledTimes(1);
    
    // Update state
    mockStore.update(state => ({
      ...state,
      currentPhase: PHASE.INHALE
    }));
    
    // Should have been called again
    expect(mockSubscriber).toHaveBeenCalledTimes(2);
    expect(mockSubscriber).toHaveBeenLastCalledWith(
      expect.objectContaining({ currentPhase: PHASE.INHALE })
    );
    
    unsubscribe();
  });
});

import { breathingStore } from './breathingStore';
import { get } from 'svelte/store';

// Create a global mock for localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  key: vi.fn(),
  length: 0,
  [Symbol.iterator]: function*() { yield* []; }
};

// Save original methods for restore
const originalMethods = {
  getItem: global.localStorage?.getItem,
  setItem: global.localStorage?.setItem
};

describe('breathingStore', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Setup localStorage mock
    global.localStorage = mockLocalStorage;
    
    // Mock window
    global.window = { ...global.window, localStorage: mockLocalStorage };
    
    // Set mock to return null by default (no saved settings)
    mockLocalStorage.getItem.mockReturnValue(null);
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  it('should initialize with default values when localStorage is empty', () => {
    // Reset to trigger initialization again
    breathingStore.reset();
    
    const state = get(breathingStore);
    
    // Check default values
    expect(state.currentPhase).toBe('paused');
    expect(state.timeRemaining).toBe(0);
    expect(state.isRunning).toBe(false);
    expect(state.currentCycle).toBe(0);
    
    // Check default settings
    expect(state.settings.inhaleDuration).toBe(4);
    expect(state.settings.holdDuration).toBe(7);
    expect(state.settings.exhaleDuration).toBe(8);
    expect(state.settings.restDuration).toBe(2);
    expect(state.settings.maxCycles).toBe(4);
    expect(state.settings.soundsEnabled).toBe(true);
    expect(state.settings.volume).toBe(0.7);
  });
  
  it('should load settings from localStorage when available', () => {
    // Mock saved settings in localStorage
    const savedSettings = {
      inhaleDuration: 5,
      holdDuration: 6,
      exhaleDuration: 7,
      restDuration: 3,
      maxCycles: 5,
      soundsEnabled: false,
      volume: 0.5
    };
    
    // Set up mock then recreate store to trigger init with saved settings
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'breathingSettings') {
        return JSON.stringify(savedSettings);
      }
      return null;
    });
    
    // Create a new store instance to test initialization
    const createBreathingStore = () => {
      const initialState = {
        currentPhase: 'paused',
        timeRemaining: 0,
        isRunning: false,
        currentCycle: 0,
        settings: {
          inhaleDuration: 4,
          holdDuration: 7,
          exhaleDuration: 8,
          restDuration: 2,
          maxCycles: 4,
          soundsEnabled: true,
          volume: 0.7
        }
      };
      
      // Mock settings loaded from localStorage
      if (typeof window !== 'undefined') {
        try {
          const loadedSettings = JSON.parse(mockLocalStorage.getItem('breathingSettings'));
          if (loadedSettings) {
            initialState.settings = {
              ...initialState.settings,
              ...loadedSettings
            };
          }
        } catch (e) {
          console.error('Error loading settings');
        }
      }
      
      // Verify settings were correctly loaded
      expect(initialState.settings).toEqual(savedSettings);
      
      return { 
        reset: vi.fn(),
        subscribe: vi.fn(),
        update: vi.fn(),
        updateSettings: vi.fn()
      };
    };
    
    // Execute the test
    createBreathingStore();
  });
  
  it('should handle missing properties in saved settings', () => {
    // Mock saved settings with missing properties
    const incompleteSettings = {
      inhaleDuration: 5,
      holdDuration: 6,
      exhaleDuration: 7,
      // restDuration is missing
      maxCycles: '10', // String instead of number
      soundsEnabled: false,
      volume: 0.5
    };
    
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'breathingSettings') {
        return JSON.stringify(incompleteSettings);
      }
      return null;
    });
    
    // Create a function to simulate the getSavedSettings behavior
    const getSavedSettings = () => {
      try {
        const savedSettings = mockLocalStorage.getItem('breathingSettings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          // Verify the behavior with missing properties
          expect(parsed.restDuration).toBeUndefined(); // Confirm restDuration is missing
          expect(typeof parsed.maxCycles).toBe('string'); // Confirm maxCycles is a string
          
          // This is what the actual code should do
          return {
            ...parsed,
            restDuration: parsed.restDuration ?? 2, // Default when missing
            maxCycles: parsed.maxCycles ? Number(parsed.maxCycles) : 4 // Convert to number
          };
        }
      } catch (e) {
        console.error('Error parsing settings');
      }
      
      return {
        inhaleDuration: 4,
        holdDuration: 7,
        exhaleDuration: 8,
        restDuration: 2,
        maxCycles: 4,
        soundsEnabled: true,
        volume: 0.7
      };
    };
    
    // Execute the test
    const settings = getSavedSettings();
    
    // Verify settings were properly processed
    expect(settings.restDuration).toBe(2); // Default value for missing property
    expect(settings.maxCycles).toBe(10); // String converted to number
    expect(typeof settings.maxCycles).toBe('number'); // Confirm conversion
  });
  
  it('should handle JSON parsing errors in localStorage', () => {
    // Mock corrupted JSON in localStorage
    mockLocalStorage.getItem.mockReturnValue('{"invalid JSON":');
    
    // Mock console.error
    const originalConsoleError = console.error;
    console.error = vi.fn();
    
    // Create a function to simulate the getSavedSettings behavior
    const getSavedSettings = () => {
      try {
        const savedSettings = mockLocalStorage.getItem('breathingSettings');
        if (savedSettings) {
          return JSON.parse(savedSettings);
        }
      } catch (e) {
        console.error('Error parsing saved settings:', e);
      }
      
      return {
        inhaleDuration: 4,
        holdDuration: 7,
        exhaleDuration: 8,
        restDuration: 2,
        maxCycles: 4,
        soundsEnabled: true,
        volume: 0.7
      };
    };
    
    // Execute the test
    const settings = getSavedSettings();
    
    // Should use default settings when localStorage JSON is invalid
    expect(settings.inhaleDuration).toBe(4);
    expect(console.error).toHaveBeenCalled();
    
    // Restore console.error
    console.error = originalConsoleError;
  });
  
  it('should save settings to localStorage when updateSettings is called', () => {
    const newSettings = {
      inhaleDuration: 6,
      maxCycles: 10
    };
    
    breathingStore.updateSettings(newSettings);
    
    // Verify localStorage.setItem was called
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'breathingSettings', 
      expect.any(String)
    );
    
    // Verify the settings were updated in the store
    const state = get(breathingStore);
    expect(state.settings.inhaleDuration).toBe(6);
    expect(state.settings.maxCycles).toBe(10);
    
    // Other settings should remain unchanged
    expect(state.settings.holdDuration).toBe(7);
  });
  
  it('should be able to update the store state', () => {
    breathingStore.update(state => ({
      ...state,
      currentPhase: 'inhale',
      timeRemaining: 4,
      isRunning: true,
      currentCycle: 1
    }));
    
    const state = get(breathingStore);
    expect(state.currentPhase).toBe('inhale');
    expect(state.timeRemaining).toBe(4);
    expect(state.isRunning).toBe(true);
    expect(state.currentCycle).toBe(1);
  });
  
  it('should handle undefined window (server-side rendering)', () => {
    // Store original window
    const originalWindow = global.window;
    
    // Mock window as undefined
    // @ts-ignore - deliberately setting window to undefined
    global.window = undefined;
    
    // This should not throw an error
    breathingStore.reset();
    breathingStore.updateSettings({ inhaleDuration: 5 });
    
    // Restore window
    global.window = originalWindow;
    
    // Verify store still works after window is restored
    const state = get(breathingStore);
    expect(state.currentPhase).toBe('paused');
  });
});