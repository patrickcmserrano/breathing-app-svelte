<script lang="ts">
  import { onMount } from 'svelte';
  import { _ } from 'svelte-i18n';
  import ThemeToggle from '../components/ThemeToggle.svelte';
  import BreathingCycle from '../components/BreathingCycle.svelte';
  import Settings from '../components/Settings.svelte';
  import BlobAnimation from '../components/BlobAnimation.svelte';
  import AudioPlayer from '../components/AudioPlayer.svelte';
  import LanguageSelector from '../components/LanguageSelector.svelte';
  import { audioStore } from '../stores/audioStore';
  import { breathingStore, type BreathingState } from '../stores/breathingStore';

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
    <div class="flex items-center">
      <LanguageSelector />
      <div class="settings ml-2">
        <Settings />
      </div>
    </div>
  </div>

  <div class="menu-content">
    <nav>
      <ul class="flex gap-8 justify-center mb-8">
        <li><strong>{$_('nav.home')}</strong></li>
        <li><a href="#/about">{$_('nav.about')}</a></li>
        <li><a href="#/copyright">{$_('nav.copyright')}</a></li>
      </ul>
    </nav>  
  </div>
  
  <div class="flex flex-col items-center flex-grow">
    <h1 class="text-3xl font-bold text-center mb-12">{$_('app.title')}</h1>
    
    <div class="breathing-container flex-grow flex items-center justify-center">
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
    
    <!-- Background music player -->
    <div class="mt-8 w-full max-w-md">
      <h3 class="text-lg font-medium mb-2">Background Music</h3>
      <AudioPlayer />
    </div>
  </div>
  
  <footer class="mt-auto py-4 text-center">
    <p class="text-sm text-gray-500">
      Take a moment to breathe and relax.
    </p>
  </footer>
</main>

<style>
  nav ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  nav a, nav strong {
    color: var(--color-text);
    text-decoration: none;
    font-weight: 600;
  }

  nav a:hover {
    text-decoration: underline;
  }
</style>