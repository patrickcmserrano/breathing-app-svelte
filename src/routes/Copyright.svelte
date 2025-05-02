<script>
  import BlobAnimation from '../components/BlobAnimation.svelte';
  import ThemeToggle from '../components/ThemeToggle.svelte';
  import LanguageSelector from '../components/LanguageSelector.svelte';
  import { _ } from 'svelte-i18n';
</script>

<div class="page-container">
  <!-- Background animation -->
  <BlobAnimation baseRadius={150} blurRadius={35} />
  
  <div class="menu grid">
    <div class="theme-switch">
      <ThemeToggle />
    </div>
    <div class="menu-content">
      <nav>
        <ul>
          <li><a href="#/">{$_('nav.home')}</a></li>
          <li><a href="#/about">{$_('nav.about')}</a></li>
          <li><strong>{$_('nav.copyright')}</strong></li>
        </ul>
      </nav>  
    </div>
    <div class="language-selector">
      <LanguageSelector />
    </div>
  </div>

  <main class="container content-page">
    <article>
      <header>
        <h1>{$_('copyright.title')}</h1>
      </header>
      <section>
        <p>{$_('copyright.content')}</p>
        
        <h3>{$_('copyright.important_notes')}</h3>
        <ul>
          <li>{$_('copyright.attribution')}</li>
          <li>{$_('copyright.usage')}</li>
          <li>{$_('copyright.resell')}</li>
          <li>{$_('copyright.restrictions')}</li>
        </ul>
        
        <h3>{$_('copyright.audio_tracks')}</h3>
        <ul>
          <li>{$_('copyright.track1')}</li>
          <li>{$_('copyright.track2')}</li>
          <li>{$_('copyright.track3')}</li>
          <li>{$_('copyright.track4')}</li>
          <li>{$_('copyright.track5')}</li>
        </ul>
        
        <p>
          {$_('copyright.provided_by')} 
          <a href="https://pixabay.com/" target="_blank" rel="noopener">Pixabay</a>.
        </p>
        <p>
          {$_('copyright.license_details')} 
          <a href="https://pixabay.com/service/terms/" target="_blank" rel="noopener">{$_('copyright.terms')}</a>.
        </p>
      </section>
      
      <div class="back-link">
        <a href="#/">{$_('back')}</a>
      </div>
    </article>
  </main>
</div>

<style>
  .page-container {
    position: relative;
    min-height: 100vh;
    z-index: 1;
  }

  .menu {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    position: relative;
    z-index: 10;
  }

  .menu-content {
    flex-grow: 1;
    display: flex;
    justify-content: center;
  }
  
  .language-selector {
    display: flex;
    align-items: center;
  }

  nav ul {
    display: flex;
    list-style: none;
    gap: 2rem;
    margin: 0;
    padding: 0;
  }

  nav a, nav strong {
    color: var(--color-text);
    text-decoration: none;
    font-weight: 600;
  }

  nav a:hover {
    text-decoration: underline;
  }

  .content-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    background: var(--color-surface-100);
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    position: relative;
    z-index: 10;
  }
  
  .back-link {
    margin-top: 2rem;
    text-align: center;
  }

  h1, h2, h3 {
    color: var(--color-primary-500);
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 1.5rem;
  }

  h3 {
    font-size: 1.2rem;
    margin: 1.5rem 0 0.75rem;
  }

  p, ul {
    margin-bottom: 1rem;
    line-height: 1.6;
  }

  a {
    color: var(--color-primary-500);
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  @media (max-width: 768px) {
    .menu {
      padding: 1rem;
    }
    
    .content-page {
      padding: 1.5rem;
    }
  }

  @media (max-width: 480px) {
    nav ul {
      gap: 1rem;
    }
  }
</style>