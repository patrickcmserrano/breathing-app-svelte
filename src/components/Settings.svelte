<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import IconSettings from '@lucide/svelte/icons/settings';
  import { breathingStore } from '../stores/breathingStore';
  import { audioStore } from '../stores/audioStore';
  import { _ } from 'svelte-i18n';
  
  let showSettings = false;
  let settings = {
    inhaleDuration: 4,
    holdDuration: 7,
    exhaleDuration: 8,
    restDuration: 2,
    soundsEnabled: true,
    volume: 0.7
  };
  
  // Handle Escape key press
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && showSettings) {
      showSettings = false;
    }
  }
  
  // Close settings modal when clicking on backdrop
  function handleBackdropClick(event: MouseEvent) {
    // Only close if clicking directly on the backdrop element, not its children
    if (event.target === event.currentTarget) {
      showSettings = false;
    }
  }
  
  // Handle keyboard events for the backdrop
  function handleBackdropKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
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
    class="icon-btn"
    aria-label={$_('settings.button')}
  >
    <IconSettings size="20" />
  </button>
  
  {#if showSettings}
    <div 
      class="modal-backdrop" 
      on:click={handleBackdropClick} 
      on:keydown={handleBackdropKeydown} 
      tabindex="0" 
      role="button"
      aria-label={$_('settings.close')}
    >
      <div class="settings-content card p-6 rounded-lg shadow-lg variant-filled-surface">
        <h2 class="text-2xl font-bold mb-4">{$_('settings.title')}</h2>
        
        <div class="settings-section mb-4">
          <h3 class="text-xl font-semibold mb-2">{$_('settings.breathing_duration')}</h3>
          
          <div class="form-field mb-2">
            <label for="inhaleDuration" class="label font-medium">{$_('settings.inhale')}:</label>
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
            <label for="holdDuration" class="label font-medium">{$_('settings.hold')}:</label>
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
            <label for="exhaleDuration" class="label font-medium">{$_('settings.exhale')}:</label>
            <input 
              type="number" 
              id="exhaleDuration" 
              bind:value={settings.exhaleDuration} 
              min="1" 
              max="15" 
              class="input variant-form-material"
            />
          </div>

          <div class="form-field mb-2">
            <label for="restDuration" class="label font-medium">{$_('settings.rest')}:</label>
            <input 
              type="number" 
              id="restDuration" 
              bind:value={settings.restDuration} 
              min="0" 
              max="10" 
              class="input variant-form-material"
            />
          </div>
        </div>
        
        <div class="settings-section mb-4">
          <h3 class="text-xl font-semibold mb-2">{$_('settings.sound_settings')}</h3>
          
          <div class="form-field mb-2">
            <label for="soundsEnabled" class="label font-medium">{$_('settings.enable_sounds')}:</label>
            <input 
              type="checkbox" 
              id="soundsEnabled" 
              bind:checked={settings.soundsEnabled} 
              class="checkbox"
            />
          </div>
          
          <div class="form-field mb-2">
            <label for="volume" class="label font-medium">{$_('settings.volume')}:</label>
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
            {$_('settings.cancel')}
          </button>
          <button 
            on:click={saveSettings} 
            class="btn variant-filled-primary"
          >
            {$_('settings.save')}
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
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
  :global([data-mode="dark"]) .settings-content {
    background-color: var(--color-surface-800);
    color: var(--color-surface-50);
  }
</style>