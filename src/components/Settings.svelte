<script lang="ts">
  import { onMount } from 'svelte';
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
  
  // Subscribe to the breathingStore to get current settings
  onMount(() => {
    const unsubscribe = breathingStore.subscribe(state => {
      settings = { ...state.settings };
    });
    
    return unsubscribe;
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
      <div class="settings-content p-6 rounded-lg shadow-lg">
        <h2 class="text-xl font-bold mb-4">Breathing Settings</h2>
        
        <div class="settings-section mb-4">
          <h3 class="text-lg font-semibold mb-2">Breathing Duration (seconds)</h3>
          
          <div class="form-field mb-2">
            <label for="inhaleDuration">Inhale:</label>
            <input 
              type="number" 
              id="inhaleDuration" 
              bind:value={settings.inhaleDuration} 
              min="1" 
              max="10" 
              class="input p-2 rounded"
            />
          </div>
          
          <div class="form-field mb-2">
            <label for="holdDuration">Hold:</label>
            <input 
              type="number" 
              id="holdDuration" 
              bind:value={settings.holdDuration} 
              min="1" 
              max="15" 
              class="input p-2 rounded"
            />
          </div>
          
          <div class="form-field mb-2">
            <label for="exhaleDuration">Exhale:</label>
            <input 
              type="number" 
              id="exhaleDuration" 
              bind:value={settings.exhaleDuration} 
              min="1" 
              max="15" 
              class="input p-2 rounded"
            />
          </div>
        </div>
        
        <div class="settings-section mb-4">
          <h3 class="text-lg font-semibold mb-2">Sound Settings</h3>
          
          <div class="form-field mb-2">
            <label for="soundsEnabled">Enable Sounds:</label>
            <input 
              type="checkbox" 
              id="soundsEnabled" 
              bind:checked={settings.soundsEnabled} 
              class="checkbox"
            />
          </div>
          
          <div class="form-field mb-2">
            <label for="volume">Volume:</label>
            <input 
              type="range" 
              id="volume" 
              bind:value={settings.volume} 
              min="0" 
              max="1" 
              step="0.1" 
              class="range"
              disabled={!settings.soundsEnabled}
            />
          </div>
        </div>
        
        <div class="buttons-container flex justify-end space-x-2 mt-4">
          <button 
            on:click={() => showSettings = false} 
            class="btn variant-ghost"
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
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .settings-content {
    background-color: var(--color-surface-100);
    max-width: 90%;
    width: 400px;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .form-field {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .form-field label {
    min-width: 100px;
  }
  
  .input, .range {
    width: 200px;
  }
</style>