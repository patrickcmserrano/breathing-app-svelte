import { writable } from 'svelte/store';
import type { PhaseType } from '../components/BreathingCycle.svelte';

// Define the breathing store type
export interface BreathingState {
  currentPhase: PhaseType | string;
  timeRemaining: number;
  isRunning: boolean;
  currentCycle: number;
  settings: {
    inhaleDuration: number;
    holdDuration: number;
    exhaleDuration: number;
    restDuration: number;
    maxCycles: number;
    soundsEnabled: boolean;
    volume: number;
  }
}

// Get saved settings from localStorage or use defaults
const getSavedSettings = () => {
  if (typeof window !== 'undefined') {
    const savedSettings = localStorage.getItem('breathingSettings');
    
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        // Ensure restDuration is included in existing saved settings and maxCycles is a number
        return {
          ...parsed,
          restDuration: parsed.restDuration ?? 2,
          maxCycles: parsed.maxCycles ? Number(parsed.maxCycles) : 4
        };
      } catch (e) {
        console.error('Error parsing saved settings:', e);
      }
    }
  }
  
  // Default settings
  return {
    inhaleDuration: 4,
    holdDuration: 7,
    exhaleDuration: 8,
    restDuration: 2,
    maxCycles: 4, // Valor padrão alterado para 4 ciclos
    soundsEnabled: true,
    volume: 0.7
  };
};

// Initialize the store with default values
const initialState: BreathingState = {
  currentPhase: 'paused',
  timeRemaining: 0,
  isRunning: false,
  currentCycle: 0,
  settings: getSavedSettings()
};

// Create the breathing store
const createBreathingStore = () => {
  const { subscribe, set, update } = writable<BreathingState>(initialState);
  
  return {
    subscribe,
    update,
    set,
    // Update settings and save to localStorage
    updateSettings: (newSettings: Partial<BreathingState['settings']>) => {
      update(state => {
        const updatedSettings = {
          ...state.settings,
          ...newSettings
        };
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('breathingSettings', JSON.stringify(updatedSettings));
        }
        
        return {
          ...state,
          settings: updatedSettings
        };
      });
    },
    // Reset to initial state
    reset: () => {
      set(initialState);
    }
  };
};

export const breathingStore = createBreathingStore();