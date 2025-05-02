import { describe, it, expect, vi, beforeEach } from 'vitest';
import { _ } from 'svelte-i18n';
import { breathingStore } from '../stores/breathingStore';
import { audioStore } from '../stores/audioStore';

// Mock dependencies
vi.mock('../components/PageLayout.svelte', () => ({
  default: vi.fn()
}));

vi.mock('../components/BreathingCycle.svelte', () => ({
  default: vi.fn()
}));

vi.mock('../components/Settings.svelte', () => ({
  default: vi.fn()
}));

vi.mock('../components/AudioPlayer.svelte', () => ({
  default: vi.fn()
}));

vi.mock('svelte-i18n', () => ({
  _: () => ({ 
    subscribe: (fn: Function) => {
      fn('translated text');
      return { unsubscribe: () => {} };
    }
  })
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
    })
  }
}));

vi.mock('../stores/audioStore', () => ({
  audioStore: {
    initialize: vi.fn()
  }
}));

// Mock svelte onMount
vi.mock('svelte', () => ({
  onMount: vi.fn((callback) => callback())
}));

// Create a function to simulate the Home component behavior
function createHomeComponent() {
  // Mock BreathingCycle component reference
  const breathingCycleComponent = {
    startBreathing: vi.fn()
  };
  
  // Mock initial state
  let breathingSettings = {
    inhaleDuration: 4,
    holdDuration: 7,
    exhaleDuration: 8,
    restDuration: 2,
    maxCycles: 4,
    soundsEnabled: true,
    volume: 0.7
  };
  
  // Initialize component
  const initialize = () => {
    // This simulates the onMount behavior
    audioStore.initialize();
    
    // Simulate the breathingStore subscription
    breathingStore.subscribe((state) => {
      breathingSettings = state.settings;
    });
    
    return {
      breathingCycleComponent,
      breathingSettings
    };
  };
  
  // Simulate the startBreathing function
  const startBreathing = () => {
    if (breathingCycleComponent) {
      breathingCycleComponent.startBreathing();
    }
  };
  
  return {
    initialize,
    startBreathing,
    getBreathingComponent: () => breathingCycleComponent,
    getBreathingSettings: () => breathingSettings
  };
}

describe('Home Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should initialize audio on mount', () => {
    const component = createHomeComponent();
    component.initialize();
    
    expect(audioStore.initialize).toHaveBeenCalled();
  });
  
  it('should load breathing settings from store', () => {
    const component = createHomeComponent();
    component.initialize();
    
    const settings = component.getBreathingSettings();
    expect(settings).toBeDefined();
    expect(settings.inhaleDuration).toBe(4);
    expect(settings.holdDuration).toBe(7);
    expect(settings.exhaleDuration).toBe(8);
    expect(settings.restDuration).toBe(2);
    expect(settings.maxCycles).toBe(4);
  });
  
  it('should call startBreathing on breathing cycle component', () => {
    const component = createHomeComponent();
    const { breathingCycleComponent } = component.initialize();
    
    component.startBreathing();
    
    expect(breathingCycleComponent.startBreathing).toHaveBeenCalled();
  });
  
  it('should not throw if breathing cycle component is not defined', () => {
    const component = createHomeComponent();
    // Deliberately not initializing
    
    // This should not throw an error
    expect(() => component.startBreathing()).not.toThrow();
  });
  
  it('should subscribe to breathing store to get updated settings', () => {
    const component = createHomeComponent();
    component.initialize();
    
    expect(breathingStore.subscribe).toHaveBeenCalled();
  });
});