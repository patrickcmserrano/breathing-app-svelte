<script lang="ts">
  import { _ } from '../lib/i18n';
  import PageLayout from '../components/PageLayout.svelte';
  import { push } from 'svelte-spa-router';

  function resetCookieConsent() {
    localStorage.removeItem('cookiesConsent');
    window.location.reload();
  }
</script>

<PageLayout>
  <main class="p-6 max-w-4xl mx-auto space-y-6">
    <h1 class="text-3xl font-bold">{$_('privacy.title')}</h1>
    
    <p class="text-lg">
      {$_('privacy.content')} 
      <a 
        href="https://www.google.com/policies/privacy/partners/" 
        target="_blank" 
        class="text-primary hover:underline"
      >
        Google Privacy Policy
      </a>.
    </p>
    
    <div class="space-y-4">
      <h2 class="text-2xl font-semibold">{$_('privacy.data_title')}</h2>
      <p>{$_('privacy.data_content')}</p>
      
      <h2 class="text-2xl font-semibold">{$_('privacy.cookies_title')}</h2>
      <p>{$_('privacy.cookies_content')}</p>
      
      <h2 class="text-2xl font-semibold">{$_('privacy.opt_out_title')}</h2>
      <p>{$_('privacy.opt_out_content')}</p>
    </div>
    
    <div class="mt-8 flex gap-4">
      <button 
        on:click={() => push('/')} 
        class="inline-block px-5 py-2 bg-primary rounded hover:bg-opacity-90"
      >
        {$_('back')}
      </button>
      
      <!-- Botão para resetar o consentimento de cookies (apenas para desenvolvimento) -->
      <button 
        on:click={resetCookieConsent} 
        class="inline-block px-5 py-2 bg-red-600 text-white rounded hover:bg-opacity-90"
      >
        Reset Cookie Consent
      </button>
    </div>
  </main>
</PageLayout>