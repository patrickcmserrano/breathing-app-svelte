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
    aria-label="English"
  >
    EN
  </button>
  <button 
    class={currentLocale === 'pt' ? 'active' : ''} 
    on:click={() => setLanguage('pt')}
    aria-label="Português"
  >
    PT
  </button>
  <button 
    class={currentLocale === 'es' ? 'active' : ''} 
    on:click={() => setLanguage('es')}
    aria-label="Español"
  >
    ES
  </button>
  <button 
    class={currentLocale === 'zh' ? 'active' : ''} 
    on:click={() => setLanguage('zh')}
    aria-label="中文"
  >
    ZH
  </button>
  <button 
    class={currentLocale === 'hi' ? 'active' : ''} 
    on:click={() => setLanguage('hi')}
    aria-label="हिन्दी"
  >
    HI
  </button>
  <button 
    class={currentLocale === 'ar' ? 'active' : ''} 
    on:click={() => setLanguage('ar')}
    aria-label="العربية"
  >
    AR
  </button>
  <button 
    class={currentLocale === 'fr' ? 'active' : ''} 
    on:click={() => setLanguage('fr')}
    aria-label="Français"
  >
    FR
  </button>
</div>

<style>
  .language-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem; /* Aumentando o espaçamento entre os botões */
    justify-content: center;
    align-items: center;
    height: 100%; /* Garantir altura total */
  }

  button {
    background: transparent;
    border: 1px solid var(--color-surface-300);
    padding: 0.3rem 0.6rem; /* Aumentando o padding */
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.85rem; /* Aumentando o tamanho da fonte */
    min-width: 2.2rem; /* Aumentando a largura mínima */
    height: 2rem; /* Aumentando a altura */
    display: flex;
    align-items: center;
    justify-content: center;
  }

  button.active {
    background: var(--color-surface-200);
    font-weight: bold;
    border-color: var(--color-primary-500);
  }

  :global(.dark) button {
    border-color: var(--color-surface-600);
  }

  :global(.dark) button.active {
    background: var(--color-surface-700);
  }

  @media (max-width: 480px) {
    .language-selector {
      margin: 0;
    }
    
    button {
      padding: 0.25rem 0.45rem;
      min-width: 2rem;
      height: 1.8rem;
      font-size: 0.8rem;
    }
  }
</style>