import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { get } from 'svelte/store';
import { audioStore } from './audioStore';
import { breathingStore } from './breathingStore';

// Mock Audio API
class MockAudio {
  src: string;
  preload: string = '';
  volume: number = 1;
  currentTime: number = 0;
  
  constructor(src: string) {
    this.src = src;
  }
  
  play() {
    return Promise.resolve();
  }
}

// Mock breathing store
vi.mock('./breathingStore', () => ({
  breathingStore: {
    subscribe: vi.fn((callback) => {
      callback({
        settings: {
          soundsEnabled: true,
          volume: 0.7
        }
      });
      return () => {};
    }),
    update: vi.fn(),
    updateSettings: vi.fn()
  }
}));

// Mock svelte/motion for the Tween import in breathingStore
vi.mock('svelte/motion', () => ({
  tweened: vi.fn().mockImplementation(() => ({
    subscribe: vi.fn(),
    set: vi.fn(),
    update: vi.fn()
  })),
  Tween: vi.fn().mockImplementation(() => ({
    subscribe: vi.fn(),
    set: vi.fn(),
    update: vi.fn()
  }))
}));

// Mock svelte/store derived
vi.mock('svelte/store', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('svelte/store');
  return {
    ...actual,
    derived: vi.fn().mockImplementation((stores, fn) => {
      return {
        subscribe: (callback: (value: any) => void) => {
          callback({});
          return () => {};
        }
      };
    })
  };
});

describe('AudioStore', () => {
  // Save original Audio constructor
  const originalAudio = global.Audio;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock window.Audio
    global.Audio = MockAudio as any;
  });

  afterEach(() => {
    // Restore original Audio constructor
    global.Audio = originalAudio;
  });
  
  // Spy on Audio methods
  const audioPlaySpy = vi.spyOn(MockAudio.prototype, 'play');
  
  it('should initialize audio elements', () => {
    // Initialize audio store
    audioStore.initialize();
    
    // Check that audio elements are created for each sound
    expect(audioPlaySpy).not.toHaveBeenCalled();
  });
  
  it('should play sounds when enabled', () => {
    // Initialize
    audioStore.initialize();
    
    // Play a sound
    audioStore.playSound('inhale');
    
    // Check that play was called
    expect(audioPlaySpy).toHaveBeenCalled();
  });
  
  it('should toggle sounds and update breathing store', () => {
    // Initialize
    audioStore.initialize();
    
    // Toggle sounds off
    audioStore.toggleSounds();
    
    // Check that breathingStore was updated
    expect(breathingStore.updateSettings).toHaveBeenCalledWith({ soundsEnabled: false });
  });
  
  it('should set volume for all sounds', () => {
    // Initialize first
    audioStore.initialize();
    
    // Set up spy AFTER initialization
    const updateSettingsSpy = vi.spyOn(breathingStore, 'updateSettings');
    
    // Set volume
    audioStore.setVolume(0.5);
    
    // Check that breathingStore was updated with correct volume
    expect(updateSettingsSpy).toHaveBeenCalledWith({ volume: 0.5 });
  });
});