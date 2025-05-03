<script context="module" lang="ts">
  // Breathing phases as string constants
  export const PHASE = {
    INHALE: 'inhale',
    HOLD: 'hold',
    EXHALE: 'exhale',
    REST: 'rest',
    PAUSED: 'paused'
  } as const;

  export type PhaseType = typeof PHASE[keyof typeof PHASE];
</script>

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Tween } from 'svelte/motion';
  import { breathingStore } from '../stores/breathingStore';
  import { audioStore } from '../stores/audioStore';
  import { userSessionStore } from '../stores/userSessionStore';
  import { _ } from 'svelte-i18n';

  // Default durations in seconds
  export let inhaleDuration = 4;
  export let holdDuration = 7;
  export let exhaleDuration = 8;
  export let restDuration = 2;
  export let maxCycles = 4; // Accept maxCycles as a prop with default of 4

  let currentPhase: PhaseType = PHASE.PAUSED;
  let timeRemaining = 0;
  let isRunning = false;
  let currentCycle = 0;
  let timer: number;
  let mantra = ''; // Store user's mantra
  let sessionCompleted = false;

  // Use Tween for smooth animation scale transitions
  const animationScale = new Tween<number>(1, {
    duration: 300,
    easing: (t) => t,
    interpolate: (a, b) => (t: number) => a * (1 - t) + b * t
  });

  // Subscribe to the breathing store to get settings and update local variables
  const breathingUnsubscribe = breathingStore.subscribe(state => {
    // Update maxCycles from state
    if (state.settings.maxCycles !== maxCycles) {
      maxCycles = state.settings.maxCycles;
    }
    
    // Update durations if they changed
    inhaleDuration = state.settings.inhaleDuration;
    holdDuration = state.settings.holdDuration;
    exhaleDuration = state.settings.exhaleDuration;
    restDuration = state.settings.restDuration;
    
    // Update cycle count if it changed in the store
    if (currentCycle !== state.currentCycle) {
      currentCycle = state.currentCycle;
    }
  });

  // Subscribe to user session store to get the mantra
  const userSessionUnsubscribe = userSessionStore.subscribe(state => {
    mantra = state.mantra;
  });

  onDestroy(() => {
    if (breathingUnsubscribe) breathingUnsubscribe();
    if (userSessionUnsubscribe) userSessionUnsubscribe();
  });

  // Start the breathing cycle
  export function startBreathing() {
    if (isRunning) return;
    
    isRunning = true;
    sessionCompleted = false;
    
    // Only reset cycle count when starting a new session, not when resuming from pause
    // For paused state, we'll just continue from the current cycle
    if (currentPhase !== PHASE.PAUSED) {
      currentCycle = 0;
    }
    
    currentPhase = PHASE.INHALE;
    timeRemaining = inhaleDuration;
    
    // Play inhale sound
    audioStore.playSound('inhale');
    
    // Update store with current state
    breathingStore.update(state => ({
      ...state,
      currentPhase,
      isRunning,
      timeRemaining,
      currentCycle
    }));
    
    timer = window.setInterval(updateTimer, 1000);
  }

  // Pause the breathing cycle
  export function pauseBreathing() {
    isRunning = false;
    currentPhase = PHASE.PAUSED;
    
    // Update store
    breathingStore.update(state => ({
      ...state,
      currentPhase,
      isRunning
    }));
    
    clearInterval(timer);
  }

  // Update the timer and handle phase transitions
  function updateTimer() {
    timeRemaining -= 1;
    
    // Update the breathing store
    breathingStore.update(state => ({
      ...state,
      timeRemaining
    }));
    
    if (timeRemaining <= 0) {
      // Move to next phase
      switch (currentPhase) {
        case PHASE.INHALE:
          currentPhase = PHASE.HOLD;
          timeRemaining = holdDuration;
          // audioStore.playSound('hold');
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
          // Completed one full cycle
          currentCycle += 1;
          
          // Check if we've reached max cycles (if max is set > 0)
          if (maxCycles > 0 && currentCycle >= maxCycles) {
            completeSession();
            return;
          }
          
          currentPhase = PHASE.INHALE;
          timeRemaining = inhaleDuration;
          audioStore.playSound('inhale');
          break;
      }
      
      // Update store with new phase and cycle count
      breathingStore.update(state => ({
        ...state,
        currentPhase,
        timeRemaining,
        currentCycle
      }));
    }
  }

  // Complete the breathing session and update session count
  function completeSession() {
    pauseBreathing();
    sessionCompleted = true;
    userSessionStore.completeSession();
  }

  // Map phase to translation key
  function getPhaseTranslationKey(phase: PhaseType): string {
    switch(phase) {
      case PHASE.INHALE:
        return 'breathing.inhale';
      case PHASE.HOLD:
        return 'breathing.hold';
      case PHASE.EXHALE:
        return 'breathing.exhale';
      case PHASE.PAUSED:
        return 'breathing.pause';
      default:
        return 'breathing.' + phase;
    }
  }

  // Update animation scale based on the current phase
  $: {
    if (currentPhase === PHASE.INHALE) {
      animationScale.target = 1 + ((inhaleDuration - timeRemaining) / inhaleDuration) * 0.5;
    } else if (currentPhase === PHASE.HOLD) {
      animationScale.target = 1.5;
    } else if (currentPhase === PHASE.EXHALE) {
      animationScale.target = 1.5 - ((exhaleDuration - timeRemaining) / exhaleDuration) * 0.5;
    } else if (currentPhase === PHASE.REST) {
      animationScale.target = 1;
    } else {
      animationScale.target = 1;
    }
  }

  // Clean up interval on component destruction
  onDestroy(() => {
    if (timer) clearInterval(timer);
  });
</script>

<div class="flex flex-col items-center justify-center">
  <div 
    class="breathing-circle transition-all duration-300"
    style="transform: scale({animationScale.current})"
  >
    <div class="inner-circle flex items-center justify-center">
      <span class="font-bold text-lg">{$_(getPhaseTranslationKey(currentPhase)).toUpperCase()}</span>
    </div>
  </div>

  {#if mantra && isRunning}
    <div class="mantra-container mt-2 mb-4">
      <p class="text-center italic p-2">{mantra}</p>
    </div>
  {/if}
  
  <div class="mt-4 text-center">
    <p class="text-2xl font-bold">{timeRemaining}</p>
    <p class="text-lg capitalize">{$_(getPhaseTranslationKey(currentPhase))}</p>
    {#if maxCycles > 0}
      <p class="text-sm mt-1">{$_('breathing.cycle')}: {currentCycle + 1}/{maxCycles}</p>
    {:else if currentCycle > 0}
      <p class="text-sm mt-1">{$_('breathing.cycle')}: {currentCycle + 1}/∞</p>
    {/if}
  </div>
  
  <div class="mt-6">
    {#if isRunning}
      <button on:click={pauseBreathing} class="btn variant-filled-primary">
        {$_('breathing.pause')}
      </button>
    {:else if sessionCompleted}
      <div class="flex flex-col items-center">
        <p class="text-success-500 font-semibold mb-2">{$_('breathing.sessionCompleted')}</p>
        <button on:click={startBreathing} class="btn variant-filled-primary">
          {$_('breathing.startNew')}
        </button>
      </div>
    {:else}
      <button on:click={startBreathing} class="btn variant-filled-primary">
        {$_('breathing.start')}
      </button>
    {/if}
  </div>
</div>

<style>
  .breathing-circle {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: radial-gradient(circle, var(--color-primary-500) 0%, var(--color-primary-300) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 2rem;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
    transition: transform 300ms ease-out;
  }

  .inner-circle {
    width: 70%;
    height: 70%;
    border-radius: 50%;
    background-color: var(--color-surface-100);
    color: var(--color-primary-700);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.05);
  }

  .mantra-container {
    max-width: 80%;
    background-color: rgba(var(--color-surface-500-rgb), 0.1);
    border-radius: 0.5rem;
    padding: 0.5rem;
  }

  /* Adicionar responsividade */
  @media (max-width: 768px) {
    .breathing-circle {
      width: 160px;
      height: 160px;
      margin-bottom: 1.5rem;
    }
  }

  @media (max-width: 480px) {
    .breathing-circle {
      width: 140px;
      height: 140px;
      margin-bottom: 1rem;
    }
  }
</style>