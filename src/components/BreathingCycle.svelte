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
  import { _ } from 'svelte-i18n';

  // Default durations in seconds
  export let inhaleDuration = 4;
  export let holdDuration = 7;
  export let exhaleDuration = 8;
  export let restDuration = 2;

  let currentPhase: PhaseType = PHASE.PAUSED;
  let timeRemaining = 0;
  let isRunning = false;
  let timer: number;

  // Use Tween for smooth animation scale transitions
  const animationScale = new Tween<number>(1, {
    duration: 300,
    easing: (t) => t,
    interpolate: (a, b) => (t: number) => a * (1 - t) + b * t
  });

  // Start the breathing cycle
  export function startBreathing() {
    if (isRunning) return;
    
    isRunning = true;
    currentPhase = PHASE.INHALE;
    timeRemaining = inhaleDuration;
    
    // Play inhale sound
    audioStore.playSound('inhale');
    
    // Update store with current state
    breathingStore.update(state => ({
      ...state,
      currentPhase,
      isRunning,
      timeRemaining
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
          currentPhase = PHASE.INHALE;
          timeRemaining = inhaleDuration;
          audioStore.playSound('inhale');
          break;
      }
      
      // Update store with new phase
      breathingStore.update(state => ({
        ...state,
        currentPhase,
        timeRemaining
      }));
    }
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
  
  <div class="mt-4 text-center">
    <p class="text-2xl font-bold">{timeRemaining}</p>
    <p class="text-lg capitalize">{$_(getPhaseTranslationKey(currentPhase))}</p>
  </div>
  
  <div class="mt-6">
    {#if isRunning}
      <button on:click={pauseBreathing} class="btn variant-filled-primary">
        {$_('breathing.pause')}
      </button>
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
    margin-bottom: 4rem; /* Aumentado de 2rem para 4rem para criar maior distanciamento */
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

  /* Adicionar responsividade */
  @media (max-width: 768px) {
    .breathing-circle {
      width: 160px;
      height: 160px;
      margin-bottom: 3rem; /* Aumentado para manter a proporção em tablets */
    }
  }

  @media (max-width: 480px) {
    .breathing-circle {
      width: 140px;
      height: 140px;
      margin-bottom: 2.5rem; /* Aumentado para manter a proporção em celulares */
    }
  }
</style>