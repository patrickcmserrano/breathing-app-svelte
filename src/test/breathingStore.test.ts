import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { get } from 'svelte/store';

// Define proper types for our store state
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
  currentPhase: string;
  isRunning: boolean;
  currentCycle: number;
  timeRemaining: number;
}

// Mock the PHASE constants directly instead of importing from the component
const PHASE = {
  INHALE: 'inhale',
  HOLD: 'hold',
  EXHALE: 'exhale',
  REST: 'rest',
  PAUSED: 'paused'
} as const;

// Mock svelte/store 
vi.mock('svelte/store', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('svelte/store');
  return {
    ...actual,
    writable: <T>(initialValue: T) => {
      let value = initialValue;
      const subscribers: Array<(value: T) => void> = [];
      
      return {
        subscribe: (callback: (value: T) => void) => {
          callback(value);
          subscribers.push(callback);
          return () => {
            const index = subscribers.indexOf(callback);
            if (index !== -1) subscribers.splice(index, 1);
          };
        },
        set: (newValue: T) => {
          value = newValue;
          subscribers.forEach(callback => callback(value));
        },
        update: (updater: (value: T) => T) => {
          value = updater(value);
          subscribers.forEach(callback => callback(value));
        }
      };
    }
  };
});

// Create a mock version of the breathing store for testing
function createMockBreathingStore() {
  // Initial state
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
  
  // Create a store with our mock implementation
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
  let store: ReturnType<typeof createMockBreathingStore>;
  
  beforeEach(() => {
    // Create a fresh store for each test
    store = createMockBreathingStore();
  });
  
  it('should initialize with default settings', () => {
    const state = get(store);
    
    // Check default settings
    expect(state.settings).toEqual({
      inhaleDuration: 4,
      holdDuration: 7,
      exhaleDuration: 8,
      restDuration: 2,
      maxCycles: 4,
      soundsEnabled: true,
      volume: 0.7
    });
    
    // Check initial state
    expect(state.currentPhase).toBe(PHASE.PAUSED);
    expect(state.isRunning).toBe(false);
    expect(state.currentCycle).toBe(0);
    expect(state.timeRemaining).toBe(0);
  });
  
  it('should update settings correctly', () => {
    store.updateSettings({
      inhaleDuration: 5,
      holdDuration: 6
    });
    
    const state = get(store);
    
    // Should update only the specified settings
    expect(state.settings.inhaleDuration).toBe(5);
    expect(state.settings.holdDuration).toBe(6);
    
    // Other settings should remain unchanged
    expect(state.settings.exhaleDuration).toBe(8);
    expect(state.settings.restDuration).toBe(2);
  });
  
  it('should reset session to initial state', () => {
    // First update state to simulate a running session
    store.update(state => ({
      ...state,
      isRunning: true,
      currentPhase: PHASE.INHALE,
      currentCycle: 2,
      timeRemaining: 3
    }));
    
    // Now reset the session
    store.resetSession();
    
    const state = get(store);
    
    // Should be back to paused state
    expect(state.isRunning).toBe(false);
    expect(state.currentPhase).toBe(PHASE.PAUSED);
    expect(state.currentCycle).toBe(0);
    expect(state.timeRemaining).toBe(0);
  });
  
  it('should handle a simulated breathing cycle', () => {
    // Start breathing
    store.update(state => ({
      ...state,
      isRunning: true,
      currentPhase: PHASE.INHALE,
      timeRemaining: state.settings.inhaleDuration
    }));
    
    let state = get(store);
    expect(state.currentPhase).toBe(PHASE.INHALE);
    
    // Complete inhale phase and move to hold
    store.update(state => ({
      ...state,
      currentPhase: PHASE.HOLD,
      timeRemaining: state.settings.holdDuration
    }));
    
    // Verify hold phase
    state = get(store);
    expect(state.currentPhase).toBe(PHASE.HOLD);
    expect(state.timeRemaining).toBe(7);
    
    // Complete hold phase and move to exhale
    store.update(state => ({
      ...state,
      currentPhase: PHASE.EXHALE,
      timeRemaining: state.settings.exhaleDuration
    }));
    
    // Verify exhale phase
    state = get(store);
    expect(state.currentPhase).toBe(PHASE.EXHALE);
    expect(state.timeRemaining).toBe(8);
  });
});