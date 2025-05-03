<script lang="ts">
  import { onMount } from 'svelte';
  import { userSessionStore } from '../stores/userSessionStore';
  import { _ } from 'svelte-i18n';
  
  let mantra = '';
  
  // Subscribe to the store to get current mantra
  const unsubscribe = userSessionStore.subscribe(state => {
    mantra = state.mantra;
  });
  
  // Clean up subscription
  onMount(() => {
    return () => {
      unsubscribe();
    };
  });
  
  // Save mantra to store
  function saveMantra() {
    userSessionStore.saveMantra(mantra);
  }
</script>

<div class="card p-4 mb-4">
  <header class="card-header">
    <h2 class="h3">{$_('settings.mantra')}</h2>
  </header>
  
  <section class="p-4">
    <label class="label mb-2">
      <span>{$_('settings.yourMantra')}</span>
      <textarea 
        bind:value={mantra} 
        class="textarea w-full h-32 p-2"
        placeholder={$_('settings.mantraPlaceholder')}
      ></textarea>
    </label>
    
    <div class="flex justify-end mt-2">
      <button class="btn variant-filled-primary" on:click={saveMantra}>
        {$_('common.save')}
      </button>
    </div>
    
    <div class="text-sm mt-4 opacity-70">
      <p>{$_('settings.mantraDescription')}</p>
    </div>
  </section>
</div>