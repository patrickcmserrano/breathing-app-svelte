<script lang="ts">
  import { onMount } from 'svelte';
  import './app.css';
  import './styles/global.css';
  import ThemeToggle from './components/ThemeToggle.svelte';
  import BreathingCycle from './components/BreathingCycle.svelte';
  import Settings from './components/Settings.svelte';
  import BlobAnimation from './components/BlobAnimation.svelte';
  import { audioStore } from './stores/audioStore';
  import { breathingStore, type BreathingState } from './stores/breathingStore';

  // Reference to the breathing cycle component
  let breathingCycleComponent: BreathingCycle;
  let breathingSettings: BreathingState['settings'];

  // Initialize audio and subscribe to breathing store
  onMount(() => {
    // Initialize audio elements
    audioStore.initialize();
    
    // Subscribe to breathing settings
    const unsubscribe = breathingStore.subscribe(state => {
      breathingSettings = state.settings;
    });
    
    return unsubscribe;
  });

  // Handle start breathing click
  function startBreathing() {
    if (breathingCycleComponent) {
      breathingCycleComponent.startBreathing();
    }
  }
</script>

<!-- Componente de animação posicionado fora do container principal -->
<BlobAnimation baseRadius={150} blurRadius={35} />

<main class="container mx-auto p-4 flex flex-col items-center min-h-screen relative z-10">
  <div class="flex justify-between w-full mb-8">
    <div class="theme-toggle">
      <ThemeToggle />
    </div>
    <div class="settings">
      <Settings />
    </div>
  </div>
  
  <div class="flex flex-col items-center justify-center flex-grow">
    <h1 class="text-3xl font-bold text-center mb-8">4-7-8 Breathing App</h1>
    
    {#if breathingSettings}
      <BreathingCycle 
        bind:this={breathingCycleComponent}
        inhaleDuration={breathingSettings.inhaleDuration}
        holdDuration={breathingSettings.holdDuration}
        exhaleDuration={breathingSettings.exhaleDuration}
      />
    {:else}
      <div class="loading">Loading settings...</div>
    {/if}
  </div>
  
  <footer class="mt-auto py-4 text-center">
    <p class="text-sm text-gray-500">
      Take a moment to breathe and relax.
    </p>
  </footer>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    transition: background-color 0.3s ease, color 0.3s ease;
    overflow-x: hidden;
    position: relative;
  }

  :global(.dark) {
    --color-primary-300: #7dd3fc;
    --color-primary-500: #0ea5e9;
    --color-primary-700: #0369a1;
    --color-surface-100: #1e293b;
    background-color: #0f172a;
    color: #f8fafc;
  }

  :global(.light) {
    --color-primary-300: #93c5fd;
    --color-primary-500: #3b82f6;
    --color-primary-700: #1d4ed8;
    --color-surface-100: #ffffff;
    background-color: #f8fafc;
    color: #0f172a;
  }
</style>
