<script lang="ts">
  import { locale } from '../lib/i18n';
  
  function setLanguage(lang: string) {
    locale.set(lang);
    // Optionally save preference to localStorage
    localStorage.setItem('preferredLanguage', lang);
  }

  // Get the current language
  let currentLocale: string;
  locale.subscribe(value => {
    currentLocale = value;
  });
</script>

<div class="language-selector">
  <button 
    class={currentLocale === 'en' ? 'active' : ''} 
    on:click={() => setLanguage('en')}
  >
    EN
  </button>
  <button 
    class={currentLocale === 'pt' ? 'active' : ''} 
    on:click={() => setLanguage('pt')}
  >
    PT
  </button>
</div>

<style>
  .language-selector {
    display: flex;
    gap: 0.5rem;
    margin: 0.5rem;
  }

  button {
    background: transparent;
    border: 1px solid #ccc;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  button.active {
    background: #eee;
    font-weight: bold;
  }

  :global(.dark) button.active {
    background: #333;
  }
</style>