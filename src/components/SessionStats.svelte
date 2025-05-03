<script lang="ts">
  import { onMount } from 'svelte';
  import { userSessionStore } from '../stores/userSessionStore';
  import { _ } from 'svelte-i18n';
  
  let sessionCount = 0;
  let frequency = 'daily';
  let startDate = '';
  let feedback = '';
  
  // Subscribe to the store
  const unsubscribe = userSessionStore.subscribe(state => {
    sessionCount = state.sessionCount;
    frequency = state.frequency;
    startDate = state.startDate;
    calculateProgress();
  });
  
  // Clean up subscription
  onMount(() => {
    return () => {
      unsubscribe();
    };
  });
  
  // Update frequency setting
  function updateFrequency(newFrequency: 'daily' | 'weekly' | 'custom') {
    userSessionStore.setFrequency(newFrequency);
  }
  
  // Calculate progress and generate feedback
  function calculateProgress() {
    const start = new Date(startDate);
    const today = new Date();
    
    // Calculate days since starting
    const diffTime = Math.abs(today.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Calculate expected sessions based on frequency
    let expectedSessions = 0;
    
    switch (frequency) {
      case 'daily':
        expectedSessions = diffDays;
        break;
      case 'weekly':
        expectedSessions = Math.max(1, Math.floor(diffDays / 7));
        break;
      default:
        expectedSessions = 1; // Minimum expectation
    }
    
    // Generate feedback
    if (sessionCount >= expectedSessions) {
      feedback = $_('stats.onTrack');
    } else if (sessionCount >= expectedSessions * 0.7) {
      feedback = $_('stats.almostOnTrack');
    } else {
      feedback = $_('stats.needsCatchup');
    }
  }
</script>

<div class="card p-4 mb-4">
  <header class="card-header">
    <h2 class="h3">{$_('stats.title')}</h2>
  </header>
  
  <section class="p-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div class="card p-4 text-center bg-primary-100 dark:bg-primary-900">
        <h3 class="h4 mb-2">{$_('stats.sessionsCompleted')}</h3>
        <p class="text-4xl font-bold">{sessionCount}</p>
      </div>
      
      <div class="card p-4 text-center">
        <h3 class="h4 mb-2">{$_('stats.yourProgress')}</h3>
        <p class="font-semibold">{feedback}</p>
      </div>
    </div>
    
    <div class="mt-4">
      <h3 class="h4 mb-2">{$_('stats.frequencySettings')}</h3>
      
      <!-- Feedback visual aprimorado para a seleção de frequência -->
      <div class="frequency-selector mb-3">
        <div class="grid grid-cols-2 gap-2">
          <div class="frequency-option {frequency === 'daily' ? 'selected' : ''}">
            <button 
              class="btn w-full {frequency === 'daily' ? 'variant-filled-primary' : 'variant-ghost'}"
              on:click={() => updateFrequency('daily')}
            >
              {$_('stats.daily')}
            </button>
            {#if frequency === 'daily'}
              <div class="check-indicator">
                <i class="fas fa-check-circle text-success-500"></i>
                <span class="text-sm text-success-500">{$_('stats.currentSelection')}</span>
              </div>
            {/if}
          </div>
          
          <div class="frequency-option {frequency === 'weekly' ? 'selected' : ''}">
            <button 
              class="btn w-full {frequency === 'weekly' ? 'variant-filled-primary' : 'variant-ghost'}"
              on:click={() => updateFrequency('weekly')}
            >
              {$_('stats.weekly')}
            </button>
            {#if frequency === 'weekly'}
              <div class="check-indicator">
                <i class="fas fa-check-circle text-success-500"></i>
                <span class="text-sm text-success-500">{$_('stats.currentSelection')}</span>
              </div>
            {/if}
          </div>
        </div>
      </div>
      
      <div class="alert {frequency === 'daily' ? 'variant-filled-primary' : 'variant-filled-secondary'} p-3">
        {#if frequency === 'daily'}
          <p>{$_('stats.dailyDescription')}</p>
        {:else if frequency === 'weekly'}
          <p>{$_('stats.weeklyDescription')}</p>
        {/if}
      </div>
      
      <p class="text-sm mt-4 opacity-70">
        {$_('stats.frequencyInfo')}
      </p>
    </div>
  </section>
</div>

<style>
  .frequency-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    padding-bottom: 1.5rem;
  }
  
  .frequency-option.selected {
    border-radius: 0.5rem;
    background-color: rgba(var(--color-primary-500-rgb), 0.1);
  }
  
  .check-indicator {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: center;
    margin-top: 0.25rem;
  }
</style>