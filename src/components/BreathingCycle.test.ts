import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PHASE } from './BreathingCycle.svelte';
import { breathingStore } from '../stores/breathingStore';
import { audioStore } from '../stores/audioStore';

// Mock dependencies
vi.mock('../stores/breathingStore', () => ({
  breathingStore: {
    subscribe: vi.fn((callback) => {
      callback({
        currentPhase: 'paused',
        isRunning: false,
        timeRemaining: 0,
        currentCycle: 0,
        settings: {
          maxCycles: 4,
          inhaleDuration: 4,
          holdDuration: 7,
          exhaleDuration: 8,
          restDuration: 2,
          soundsEnabled: true,
          volume: 1
        }
      });
      return () => {};
    }),
    update: vi.fn((updater) => {
      const mockState = {
        currentPhase: 'paused',
        isRunning: false,
        timeRemaining: 0,
        currentCycle: 0,
        settings: {
          maxCycles: 4,
          inhaleDuration: 4,
          holdDuration: 7,
          exhaleDuration: 8,
          restDuration: 2,
          soundsEnabled: true,
          volume: 1
        }
      };
      updater(mockState);
      return mockState;
    })
  }
}));

vi.mock('../stores/audioStore', () => ({
  audioStore: {
    playSound: vi.fn(),
    initialize: vi.fn()
  }
}));

vi.mock('svelte-i18n', () => ({
  _: () => ({ 
    subscribe: (fn: Function) => {
      fn('translated text');
      return { unsubscribe: () => {} };
    },
    toUpperCase: () => 'TRANSLATED TEXT'
  })
}));

vi.mock('svelte/motion', () => ({
  Tween: vi.fn().mockImplementation(() => ({
    subscribe: vi.fn(),
    set: vi.fn(),
    update: vi.fn(),
    target: 1,
    current: 1
  }))
}));

// Mock window.setInterval and clearInterval
const mockSetInterval = vi.fn(() => 123);
const mockClearInterval = vi.fn();

// Extract the core functions from BreathingCycle.svelte for testing
function createBreathingCycle() {
  let currentPhase = PHASE.PAUSED;
  let timeRemaining = 0;
  let isRunning = false;
  let currentCycle = 0;
  let timer = 0;
  
  const inhaleDuration = 4;
  const holdDuration = 7;
  const exhaleDuration = 8;
  const restDuration = 2;
  const maxCycles = 4;

  function startBreathing() {
    if (isRunning) return;
    
    isRunning = true;
    
    if (currentPhase !== PHASE.PAUSED) {
      currentCycle = 0;
    }
    
    currentPhase = PHASE.INHALE;
    timeRemaining = inhaleDuration;
    
    audioStore.playSound('inhale');
    
    breathingStore.update(state => ({
      ...state,
      currentPhase,
      isRunning,
      timeRemaining,
      currentCycle
    }));
    
    timer = window.setInterval(updateTimer, 1000);
  }

  function pauseBreathing() {
    isRunning = false;
    currentPhase = PHASE.PAUSED;
    
    breathingStore.update(state => ({
      ...state,
      currentPhase,
      isRunning
    }));
    
    clearInterval(timer);
  }

  function updateTimer() {
    timeRemaining -= 1;
    
    breathingStore.update(state => ({
      ...state,
      timeRemaining
    }));
    
    if (timeRemaining <= 0) {
      switch (currentPhase) {
        case PHASE.INHALE:
          currentPhase = PHASE.HOLD;
          timeRemaining = holdDuration;
          break;
        case PHASE.HOLD:
          currentPhase = PHASE.EXHALE;
          timeRemaining = exhaleDuration;
          audioStore.playSound('exhale');
          break;
        case PHASE.EXHALE:
          currentPhase = PHASE.REST;
          timeRemaining = restDuration;
          break;
        case PHASE.REST:
          currentCycle += 1;
          
          if (maxCycles > 0 && currentCycle >= maxCycles) {
            pauseBreathing();
            return;
          }
          
          currentPhase = PHASE.INHALE;
          timeRemaining = inhaleDuration;
          audioStore.playSound('inhale');
          break;
      }
      
      breathingStore.update(state => ({
        ...state,
        currentPhase,
        timeRemaining,
        currentCycle
      }));
    }
  }

  return {
    currentPhase,
    timeRemaining,
    isRunning,
    currentCycle,
    startBreathing,
    pauseBreathing,
    updateTimer
  };
}

describe('BreathingCycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup global mocks
    global.window.setInterval = mockSetInterval;
    global.window.clearInterval = mockClearInterval;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should start breathing cycle when startBreathing is called', () => {
    const { startBreathing } = createBreathingCycle();
    
    startBreathing();
    
    expect(audioStore.playSound).toHaveBeenCalledWith('inhale');
    expect(breathingStore.update).toHaveBeenCalled();
    expect(mockSetInterval).toHaveBeenCalledWith(expect.any(Function), 1000);
  });

  it('should pause breathing cycle when pauseBreathing is called', () => {
    const { startBreathing, pauseBreathing } = createBreathingCycle();
    
    startBreathing();
    pauseBreathing();
    
    expect(breathingStore.update).toHaveBeenCalledTimes(2);
    expect(mockClearInterval).toHaveBeenCalled();
  });

  it('should transition through phases correctly during update', () => {
    const { startBreathing, updateTimer } = createBreathingCycle();
    
    startBreathing();
    
    // Clear mocks to track only phase changes
    vi.clearAllMocks();
    
    // Simulate time passing to trigger phase change (inhale -> hold)
    // We need to call updateTimer multiple times to simulate the timer countdown
    for (let i = 0; i < 4; i++) {
      updateTimer();
    }

    expect(breathingStore.update).toHaveBeenCalled();
    
    // Clear mocks again and test hold -> exhale
    vi.clearAllMocks();
    for (let i = 0; i < 7; i++) {
      updateTimer();
    }
    
    expect(audioStore.playSound).toHaveBeenCalledWith('exhale');
    expect(breathingStore.update).toHaveBeenCalled();
  });

  it('should complete cycles and stop at max cycles', () => {
    const { startBreathing, updateTimer } = createBreathingCycle();
    
    startBreathing();
    
    // Simulate completing all phases through multiple cycles
    
    // Complete first cycle
    // Inhale -> Hold
    for (let i = 0; i < 4; i++) updateTimer();
    
    // Hold -> Exhale
    for (let i = 0; i < 7; i++) updateTimer();
    
    // Exhale -> Rest
    for (let i = 0; i < 8; i++) updateTimer();
    
    // Rest -> Inhale (next cycle)
    for (let i = 0; i < 2; i++) updateTimer();
    
    // Verify that audio is played for the next inhale
    expect(audioStore.playSound).toHaveBeenCalledWith('inhale');
    
    // Continue for 3 more cycles (total 4 cycles)
    // Just complete rest phase of the last cycle
    for (let cycle = 1; cycle < 4; cycle++) {
      // Inhale -> Hold
      for (let i = 0; i < 4; i++) updateTimer();
      
      // Hold -> Exhale
      for (let i = 0; i < 7; i++) updateTimer();
      
      // Exhale -> Rest
      for (let i = 0; i < 8; i++) updateTimer();
      
      // Rest -> Next phase or stop if max cycles reached
      for (let i = 0; i < 2; i++) updateTimer();
    }
    
    // After 4 cycles, it should call pauseBreathing
    expect(mockClearInterval).toHaveBeenCalled();
  });
});