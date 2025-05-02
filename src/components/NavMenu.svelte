<script lang="ts">
  import { _ } from 'svelte-i18n';
  import ThemeToggle from './ThemeToggle.svelte';
  import LanguageSelector from './LanguageSelector.svelte';
  
  // Prop para a página atual, para destacar o item de menu correto
  export let currentPage: 'home' | 'about' | 'copyright' = 'home';
</script>

<div class="menu">
  <div class="menu-left">
    <ThemeToggle />
    <div class="settings-icon ml-2">
      <slot name="rightContent"></slot>
    </div>
  </div>
  <div class="menu-center">
    <nav>
      <ul>
        <li>
          {#if currentPage === 'home'}
            <strong>{$_('nav.home')}</strong>
          {:else}
            <a href="#/">{$_('nav.home')}</a>
          {/if}
        </li>
        <li>
          {#if currentPage === 'about'}
            <strong>{$_('nav.about')}</strong>
          {:else}
            <a href="#/about">{$_('nav.about')}</a>
          {/if}
        </li>
        <li>
          {#if currentPage === 'copyright'}
            <strong>{$_('nav.copyright')}</strong>
          {:else}
            <a href="#/copyright">{$_('nav.copyright')}</a>
          {/if}
        </li>
      </ul>
    </nav>  
  </div>
  <div class="menu-right">
    <LanguageSelector />
  </div>
</div>

<style>
  .menu {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    position: relative;
    z-index: 10;
    width: 100%;
    height: 64px; /* Altura fixa para o menu */
  }

  .menu-left {
    flex: 1;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 1.2rem;
    height: 100%; /* Garantir altura total */
  }

  .menu-center {
    flex: 2;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%; /* Garantir altura total */
  }

  .menu-right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 100%; /* Garantir altura total */
  }
  
  .settings-icon {
    margin-left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  /* Estilo específico para o botão de configurações */
  :global(.settings-icon .icon-btn) {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    width: 40px;
    padding: 0;
  }

  /* Estilo para padronizar o tamanho dos ícones */
  :global(.menu-left svg),
  :global(.menu-right svg) {
    width: 24px;
    height: 24px;
  }

  nav {
    height: 100%;
    display: flex;
    align-items: center;
  }

  nav ul {
    display: flex;
    list-style: none;
    gap: 2rem;
    margin: 0;
    padding: 0;
    align-items: center;
    height: 100%;
  }

  nav li {
    display: flex;
    align-items: center;
    height: 100%;
  }

  nav a, nav strong {
    color: var(--color-text);
    text-decoration: none;
    font-weight: 600;
    display: flex;
    align-items: center;
    height: 100%;
  }

  nav a:hover {
    text-decoration: underline;
  }

  @media (max-width: 768px) {
    .menu {
      padding: 1rem;
      height: auto;
    }
    
    nav ul {
      gap: 1rem;
    }
  }

  @media (max-width: 480px) {
    .menu {
      flex-direction: column;
      align-items: center;
    }
    
    .menu-left, .menu-center, .menu-right {
      width: 100%;
      justify-content: center;
      margin-bottom: 0.8rem;
    }
    
    .menu-left {
      order: 1;
    }
    
    .menu-center {
      order: 2;
    }
    
    .menu-right {
      order: 3;
    }
    
    nav ul {
      gap: 0.8rem;
      justify-content: center;
    }
  }
</style>