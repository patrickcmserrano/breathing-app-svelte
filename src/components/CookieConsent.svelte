<script lang="ts">
  import { onMount } from 'svelte';
  import { _ } from '../lib/i18n';
  
  let show = false;
  let cookiesAccepted = false;
  
  onMount(() => {
    // Verifica se o usuário já deu consentimento anteriormente
    const consent = localStorage.getItem('cookiesConsent');
    cookiesAccepted = consent === 'accepted';
    
    // Se não houver consentimento prévio, mostra o banner
    if (!cookiesAccepted) {
      show = true;
    } else {
      // Se já aceitou, ativa o Google Analytics
      enableGoogleAnalytics();
    }
  });
  
  function acceptCookies() {
    localStorage.setItem('cookiesConsent', 'accepted');
    cookiesAccepted = true;
    show = false;
    enableGoogleAnalytics();
  }
  
  function declineCookies() {
    localStorage.setItem('cookiesConsent', 'declined');
    cookiesAccepted = false;
    show = false;
    disableGoogleAnalytics();
  }
  
  function enableGoogleAnalytics() {
    // Ativa o Google Analytics
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });
    }
  }
  
  function disableGoogleAnalytics() {
    // Desativa o Google Analytics
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'denied'
      });
    }
  }
</script>

{#if show}
  <div class="fixed bottom-0 left-0 right-0 bg-slate-900 dark:bg-slate-800 text-white shadow-lg z-50 p-4 md:p-6 rounded-t-xl border-t border-primary">
    <div class="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <div>
        <h2 class="text-lg font-bold mb-2">{$_('cookies.title')}</h2>
        <p class="text-sm md:text-base">
          {$_('cookies.description')} 
          <a href="#/privacy" class="text-primary hover:underline">{$_('cookies.privacy_link')}</a>
        </p>
      </div>
      <div class="flex gap-3">
        <button 
          on:click={declineCookies} 
          class="px-4 py-2 rounded border border-primary hover:bg-primary hover:bg-opacity-10 transition-colors"
        >
          {$_('cookies.decline')}
        </button>
        <button 
          on:click={acceptCookies} 
          class="px-4 py-2 rounded bg-primary text-white hover:bg-opacity-90 transition-colors"
        >
          {$_('cookies.accept')}
        </button>
      </div>
    </div>
  </div>
{/if}