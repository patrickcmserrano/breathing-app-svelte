<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { breathingStore } from '../stores/breathingStore';
  import { audioStore } from '../stores/audioStore';
  
  let showSettings = false;
  let settings = {
    inhaleDuration: 4,
    holdDuration: 7,
    exhaleDuration: 8,
    soundsEnabled: true,
    volume: 0.7
  };
  
  // Handle Escape key press
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && showSettings) {
      showSettings = false;
    }
  }
  
  // Subscribe to the breathingStore to get current settings
  onMount(() => {
    // Add keyboard event listener
    window.addEventListener('keydown', handleKeydown);
    
    const unsubscribe = breathingStore.subscribe(state => {
      settings = { ...state.settings };
    });
    
    return () => {
      // Remove keyboard event listener
      window.removeEventListener('keydown', handleKeydown);
      unsubscribe();
    };
  });
  
  // Save settings to store
  function saveSettings() {
    breathingStore.updateSettings(settings);
    
    // Update audio settings
    if (settings.soundsEnabled !== undefined) {
      audioStore.setVolume(settings.volume);
    }
    
    // Close settings modal
    showSettings = false;
  }
  
  // Toggle settings modal
  function toggleSettings() {
    showSettings = !showSettings;
  }
</script>

<div>
  <button 
    on:click={toggleSettings} 
    class="btn variant-ghost-surface"
    aria-label="Settings"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
    <span class="ml-2">Settings</span>
  </button>
  
  {#if showSettings}
    <div class="settings-modal">
      <div class="settings-content card p-6 rounded-lg shadow-lg variant-filled-surface">
        <h2 class="text-2xl font-bold mb-4">Breathing Settings</h2>
        
        <div class="settings-section mb-4">
          <h3 class="text-xl font-semibold mb-2">Breathing Duration (seconds)</h3>
          
          <div class="form-field mb-2">
            <label for="inhaleDuration" class="label font-medium">Inhale:</label>
            <input 
              type="number" 
              id="inhaleDuration" 
              bind:value={settings.inhaleDuration} 
              min="1" 
              max="10" 
              class="input variant-form-material"
            />
          </div>
          
          <div class="form-field mb-2">
            <label for="holdDuration" class="label font-medium">Hold:</label>
            <input 
              type="number" 
              id="holdDuration" 
              bind:value={settings.holdDuration} 
              min="1" 
              max="15" 
              class="input variant-form-material"
            />
          </div>
          
          <div class="form-field mb-2">
            <label for="exhaleDuration" class="label font-medium">Exhale:</label>
            <input 
              type="number" 
              id="exhaleDuration" 
              bind:value={settings.exhaleDuration} 
              min="1" 
              max="15" 
              class="input variant-form-material"
            />
          </div>
        </div>
        
        <div class="settings-section mb-4">
          <h3 class="text-xl font-semibold mb-2">Sound Settings</h3>
          
          <div class="form-field mb-2">
            <label for="soundsEnabled" class="label font-medium">Enable Sounds:</label>
            <input 
              type="checkbox" 
              id="soundsEnabled" 
              bind:checked={settings.soundsEnabled} 
              class="checkbox"
            />
          </div>
          
          <div class="form-field mb-2">
            <label for="volume" class="label font-medium">Volume:</label>
            <input 
              type="range" 
              id="volume" 
              bind:value={settings.volume} 
              min="0" 
              max="1" 
              step="0.1" 
              class="range variant-form-material"
              disabled={!settings.soundsEnabled}
            />
          </div>
        </div>
        
        <div class="buttons-container flex justify-end space-x-2 mt-4">
          <button 
            on:click={() => showSettings = false} 
            class="btn variant-soft-surface"
          >
            Cancel
          </button>
          <button 
            on:click={saveSettings} 
            class="btn variant-filled-primary"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .settings-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
  }
  
  .settings-content {
    max-width: 90%;
    width: 400px;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .form-field {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }
  
  .form-field label {
    min-width: 100px;
  }
  
  .input, .range {
    width: 200px;
  }

  /* Melhorar contraste e legibilidade dos inputs */
  :global(.input), :global(.range) {
    background-color: var(--color-surface-200);
    color: var(--color-surface-900);
    border: 1px solid var(--color-surface-400);
  }

  /* Estilo para dark mode */
  :global(.dark) .settings-content {
    background-color: var(--color-surface-800);
    color: var(--color-surface-50);
  }
</style>