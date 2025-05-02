<script>
  import BlobAnimation from '../components/BlobAnimation.svelte';
  import ThemeToggle from '../components/ThemeToggle.svelte';
</script>

<div class="page-container">
  <!-- Background animation -->
  <BlobAnimation baseRadius={150} blurRadius={35} />
  
  <div class="menu grid">
    <div class="menu-content">
      <nav>
        <ul>
          <li><a href="#/">Home</a></li>
          <li><a href="#/about">About</a></li>
          <li><strong>Copyright</strong></li>
        </ul>
      </nav>  
    </div>
    <div class="theme-switch">
      <ThemeToggle />
    </div>
  </div>

  <main class="container content-page">
    <article>
      <header>
        <h1>Copyright Information</h1>
      </header>
      <section>
        <h3>Important Notes</h3>
        <ul>
          <li>Attribution is not required but appreciated.</li>
          <li>You can use the audio files in commercial and non-commercial projects.</li>
          <li>You cannot resell or redistribute the audio files.</li>
          <li>Some audio files may have additional restrictions specified on the download page (e.g., non-commercial use only).</li>
        </ul>
        
        <h3>Audio Tracks Used in This Project</h3>
        <ul>
          <li>Meditation Spiritual Music</li>
          <li>Middle East Oriental Music</li>
          <li>Irish Harp</li>
          <li>Voice of the Oud</li>
          <li>Tibetan Singing Bowl</li>
        </ul>
        
        <p>
          All audio tracks are provided by 
          <a href="https://pixabay.com/" target="_blank" rel="noopener">Pixabay</a>.
        </p>
        <p>
          For full license details, visit the 
          <a href="https://pixabay.com/service/terms/" target="_blank" rel="noopener">Pixabay Terms of Service</a>.
        </p>
      </section>
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