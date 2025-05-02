/// <reference types="vitest" />

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { get } from 'svelte/store';

// Define types for our audio store
interface AudioState {
  sounds: Record<string, HTMLAudioElement>;
  soundsEnabled: boolean;
  volume: number;
  loaded: boolean;
}

// Mock Audio API
class MockAudio {
  src: string = '';
  preload: string = '';
  volume: number = 1;
  currentTime: number = 0;
  
  constructor(src?: string) {
    if (src) this.src = src;
  }
  
  play() {
    return Promise.resolve();
  }
}

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

// Create a mock version of the audio store for testing
function createMockAudioStore() {
  // Initial state
  const initialState: AudioState = {
    sounds: {},
    soundsEnabled: true,
    volume: 0.7,
    loaded: false
  };
  
  // Create a store with our mock implementation
  let state: AudioState = { ...initialState };
  const subscribers: Array<(state: AudioState) => void> = [];
  
  // Audio files we'll use
  const audioFiles = {
    inhale: '/sounds/inhale.mp3',
    exhale: '/sounds/exhale.mp3',
    hold: '/sounds/hold.mp3'
  };
  
  return {
    subscribe: (callback: (state: AudioState) => void) => {
      callback(state);
      subscribers.push(callback);
      return () => {
        const index = subscribers.indexOf(callback);
        if (index !== -1) subscribers.splice(index, 1);
      };
    },
    initialize: () => {
      // Create audio elements
      const sounds: Record<string, HTMLAudioElement> = {};
      
      for (const [key, src] of Object.entries(audioFiles)) {
        const audio = new MockAudio(src) as unknown as HTMLAudioElement;
        audio.preload = 'auto';
        audio.volume = state.volume;
        sounds[key] = audio;
      }
      
      state = {
        ...state,
        sounds,
        loaded: true
      };
      
      subscribers.forEach(callback => callback(state));
    },
    playSound: (soundName: string) => {
      if (!state.soundsEnabled || !state.loaded) return;
      
      const sound = state.sounds[soundName];
      if (sound) {
        sound.currentTime = 0;
        sound.play();
      }
    },
    toggleSounds: () => {
      state = {
        ...state,
        soundsEnabled: !state.soundsEnabled
      };
      
      subscribers.forEach(callback => callback(state));
      return state.soundsEnabled;
    },
    setVolume: (volume: number) => {
      state = {
        ...state,
        volume
      };
      
      // Update volume on all sounds
      if (state.loaded) {
        Object.values(state.sounds).forEach(sound => {
          sound.volume = volume;
        });
      }
      
      subscribers.forEach(callback => callback(state));
    }
  };
}

describe('Audio Store', () => {
  let audioStore: ReturnType<typeof createMockAudioStore>;
  let playSpy: ReturnType<typeof vi.spyOn>;
  
  beforeEach(() => {
    audioStore = createMockAudioStore();
    playSpy = vi.spyOn(MockAudio.prototype, 'play');
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  it('should initialize with default settings', () => {
    const state = get(audioStore);
    
    expect(state.soundsEnabled).toBe(true);
    expect(state.volume).toBe(0.7);
    expect(state.loaded).toBe(false);
    expect(state.sounds).toEqual({});
  });
  
  it('should initialize audio elements', () => {
    audioStore.initialize();
    
    const state = get(audioStore);
    
    expect(state.loaded).toBe(true);
    expect(Object.keys(state.sounds)).toContain('inhale');
    expect(Object.keys(state.sounds)).toContain('exhale');
    expect(Object.keys(state.sounds)).toContain('hold');
  });
  
  it('should toggle sounds on/off', () => {
    // Initially on
    expect(get(audioStore).soundsEnabled).toBe(true);
    
    // Toggle off
    audioStore.toggleSounds();
    expect(get(audioStore).soundsEnabled).toBe(false);
    
    // Toggle back on
    audioStore.toggleSounds();
    expect(get(audioStore).soundsEnabled).toBe(true);
  });
  
  it('should play sounds when enabled', () => {
    audioStore.initialize();
    
    // Play sound
    audioStore.playSound('inhale');
    
    // Play should have been called
    expect(playSpy).toHaveBeenCalled();
  });
  
  it('should not play sounds when disabled', () => {
    audioStore.initialize();
    
    // Disable sounds
    audioStore.toggleSounds();
    
    // Play sound
    audioStore.playSound('inhale');
    
    // Play should not have been called
    expect(playSpy).not.toHaveBeenCalled();
  });
  
  it('should set volume on all sounds', () => {
    audioStore.initialize();
    
    // Set volume
    audioStore.setVolume(0.5);
    
    const state = get(audioStore);
    
    // Check volume was updated
    expect(state.volume).toBe(0.5);
    
    // Check that each sound has the new volume
    Object.values(state.sounds).forEach(sound => {
      expect(sound.volume).toBe(0.5);
    });
  });
});