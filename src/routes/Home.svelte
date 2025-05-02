<script lang="ts">
  import { onMount } from 'svelte';
  import { _ } from 'svelte-i18n';
  import BreathingCycle from '../components/BreathingCycle.svelte';
  import Settings from '../components/Settings.svelte';
  import AudioPlayer from '../components/AudioPlayer.svelte';
  import PageLayout from '../components/PageLayout.svelte';
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

<PageLayout currentPage="home">
  <svelte:fragment slot="rightContent">
    <Settings />
  </svelte:fragment>
  
  <div class="home-content">
    <h1 class="text-3xl font-bold text-center mb-12">{$_('app.title')}</h1>
    
    <div class="breathing-container">
      {#if breathingSettings}
        <BreathingCycle 
          bind:this={breathingCycleComponent}
          inhaleDuration={breathingSettings.inhaleDuration}
          holdDuration={breathingSettings.holdDuration}
          exhaleDuration={breathingSettings.exhaleDuration}
          restDuration={breathingSettings.restDuration}
          maxCycles={breathingSettings.maxCycles}
        />
      {:else}
        <div class="loading">{$_('app.loading_settings')}</div>
      {/if}
    </div>
    
    <!-- Background music player -->
    <div class="music-player">
      <h3 class="text-lg font-medium mb-2">{$_('audio.player')}</h3>
      <AudioPlayer />
    </div>
    
    <footer class="mt-auto py-4 text-center">
      <p class="text-sm text-gray-500">
        {$_('app.breathe_relax')}
      </p>
    </footer>
  </div>
</PageLayout>

<style>
  .home-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 70vh;
    /* Remover qualquer background que possa estar bloqueando a animação */
    background-color: transparent;
  }
  
  .breathing-container {
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 2rem 0;
    background-color: transparent;
  }
  
  .music-player {
    width: 100%;
    max-width: 400px;
    margin-top: 2rem;
  }
  
  h1 {
    color: var(--color-primary-500);
  }
  
  @media (max-width: 768px) {
    .music-player {
      max-width: 100%;
      padding: 0 1rem;
    }
  }
</style>