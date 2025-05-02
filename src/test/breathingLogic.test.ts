/// <reference types="vitest" />

import { describe, it, expect, vi, beforeEach } from 'vitest';

type Phase = typeof PHASE[keyof typeof PHASE];

const PHASE = {
  INHALE: 'INHALE',
  HOLD: 'HOLD',
  EXHALE: 'EXHALE',
  REST: 'REST',
  PAUSED: 'PAUSED'
} as const;

interface BreathingState {
  currentPhase: Phase;
  timeRemaining: number;
  isRunning: boolean;
  currentCycle: number;
}

interface BreathingOptions {
  inhaleDuration?: number;
  holdDuration?: number;
  exhaleDuration?: number;
  restDuration?: number;
  maxCycles?: number;
}

function createBreathingCycleController(options: BreathingOptions = {}) {
  const {
    inhaleDuration = 4,
    holdDuration = 7,
    exhaleDuration = 8,
    restDuration = 2,
    maxCycles = 4
  } = options;
  
  let currentPhase: keyof typeof PHASE = PHASE.PAUSED as keyof typeof PHASE;
  let timeRemaining = 0;
  let isRunning = false;
  let currentCycle = 0;
  
  // Start the breathing cycle
  function startBreathing(): BreathingState {
    if (isRunning) return {
      currentPhase,
      timeRemaining,
      isRunning,
      currentCycle
    };
    
    isRunning = true;
    
    // Only reset cycle count when starting a new session, not when resuming from pause
    if (currentPhase !== PHASE.PAUSED) {
      currentCycle = 0;
    }
    
    currentPhase = PHASE.INHALE;
    timeRemaining = inhaleDuration;
    
    return {
      currentPhase,
      timeRemaining,
      isRunning,
      currentCycle
    };
  }
  
  // Pause the breathing cycle
  function pauseBreathing(): BreathingState {
    isRunning = false;
    currentPhase = PHASE.PAUSED;
    
    return {
      currentPhase,
      timeRemaining,
      isRunning,
      currentCycle
    };
  }
  
  // Update the timer and handle phase transitions
  function updateTimer(): BreathingState {
    if (!isRunning) {
      return {
        currentPhase,
        timeRemaining,
        isRunning,
        currentCycle
      };
    }
    
    timeRemaining -= 1;
    
    if (timeRemaining <= 0) {
      // Move to next phase
      switch (currentPhase) {
        case PHASE.INHALE:
          currentPhase = PHASE.HOLD;
          timeRemaining = holdDuration;
          break;
        case PHASE.HOLD:
          currentPhase = PHASE.EXHALE;
          timeRemaining = exhaleDuration;
          break;
        case PHASE.EXHALE:
          currentPhase = PHASE.REST;
          timeRemaining = restDuration;
          break;
        case PHASE.REST:
          // Completed one full cycle
          currentCycle += 1;
          
          // Check if we've reached max cycles (if max is set > 0)
          if (maxCycles > 0 && currentCycle >= maxCycles) {
            return pauseBreathing();
          }
          
          currentPhase = PHASE.INHALE;
          timeRemaining = inhaleDuration;
          break;
      }
    }
    
    return {
      currentPhase,
      timeRemaining,
      isRunning,
      currentCycle
    };
  }
  
  function getState(): BreathingState {
    return {
      currentPhase,
      timeRemaining,
      isRunning,
      currentCycle
    };
  }

  // Return the controller object
  return {
    startBreathing,
    pauseBreathing,
    updateTimer,
    getState
  };
}

describe('Breathing Cycle Logic', () => {
  it('should start in paused state', () => {
    const controller = createBreathingCycleController();
    const initialState = controller.getState();
    
    expect(initialState.currentPhase).toBe(PHASE.PAUSED);
    expect(initialState.isRunning).toBe(false);
  });
  
  it('should start breathing cycle with inhale phase', () => {
    const controller = createBreathingCycleController();
    const state = controller.startBreathing();
    
    expect(state.currentPhase).toBe(PHASE.INHALE);
    expect(state.timeRemaining).toBe(4); // Default inhale duration
    expect(state.isRunning).toBe(true);
  });
  
  it('should transition from inhale to hold phase', () => {
    const controller = createBreathingCycleController();
    controller.startBreathing();
    
    // Exhaust inhale phase (4 seconds)
    for (let i = 0; i < 4; i++) {
      controller.updateTimer();
    }
    
    const state = controller.getState();
    expect(state.currentPhase).toBe(PHASE.HOLD);
    expect(state.timeRemaining).toBe(7); // Default hold duration
  });
  
  it('should complete a full cycle and increment cycle count', () => {
    const controller = createBreathingCycleController();
    controller.startBreathing();
    
    // Exhaust a full breathing cycle
    // Inhale (4) + Hold (7) + Exhale (8) + Rest (2) = 21 seconds
    for (let i = 0; i < 21; i++) {
      controller.updateTimer();
    }
    
    const state = controller.getState();
    expect(state.currentCycle).toBe(1);
    expect(state.currentPhase).toBe(PHASE.INHALE); // Back to inhale for cycle 2
  });
  
  it('should stop after reaching max cycles', () => {
    const controller = createBreathingCycleController({ maxCycles: 2 });
    controller.startBreathing();
    
    // Complete two full cycles (21 seconds each)
    for (let i = 0; i < 42; i++) {
      controller.updateTimer();
    }
    
    const state = controller.getState();
    expect(state.currentCycle).toBe(2);
    expect(state.isRunning).toBe(false);
    expect(state.currentPhase).toBe(PHASE.PAUSED);
  });
  
  it('should pause breathing when requested', () => {
    const controller = createBreathingCycleController();
    controller.startBreathing();
    
    // Advance a few seconds
    controller.updateTimer();
    controller.updateTimer();
    
    // Pause
    const state = controller.pauseBreathing();
    
    expect(state.isRunning).toBe(false);
    expect(state.currentPhase).toBe(PHASE.PAUSED);
  });
  
  it('should resume from paused state without resetting cycle count', () => {
    const controller = createBreathingCycleController();
    controller.startBreathing();
    
    // Complete one full cycle
    for (let i = 0; i < 21; i++) {
      controller.updateTimer();
    }
    
    // Pause in the middle of cycle 2
    controller.pauseBreathing();
    
    // Resume
    const state = controller.startBreathing();
    
    expect(state.isRunning).toBe(true);
    expect(state.currentCycle).toBe(1); // Should still be on cycle 2 (index 1)
  });
});