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
          <li><strong>{$_('nav.about')}</strong></li>
          <li><a href="#/copyright">{$_('nav.copyright')}</a></li>
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
        <h1>{$_('about.title')}</h1>
      </header>
      <section>
        <p>{$_('about.content')}</p>
        
        <h3>Features</h3>
        <ul>
          <li>Visual and audio guidance for the 4-7-8 breathing technique</li>
          <li>Customizable background sounds for enhanced relaxation</li>
          <li>Dark/light theme support</li>
          <li>Responsive design for all devices</li>
          <li>Multiple language support</li>
        </ul>

        <h3>Developer</h3>
        <p>Created by Patrick CM Serrano</p>
        
        <h3>Source Code</h3>
        <p>This project is open source and available on GitHub. Feel free to contribute, report issues, or fork the repository:</p>
        <p><a href="https://github.com/patrickcmserrano/breathing-app" target="_blank" rel="noopener">View on GitHub</a></p>
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

  h2 {
    font-size: 1.5rem;
    margin: 1.5rem 0 1rem;
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