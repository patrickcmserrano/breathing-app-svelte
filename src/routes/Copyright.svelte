<script>
  import PageLayout from '../components/PageLayout.svelte';
  import { _ } from 'svelte-i18n';
  import { link } from 'svelte-spa-router';
</script>

<PageLayout currentPage="copyright" title={$_('copyright.title')}>
  <article>
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
      <a href="#/" use:link>{$_('back')}</a>
    </div>
  </article>
</PageLayout>

<style>
  .back-link {
    margin-top: 2rem;
    text-align: center;
  }

  h3 {
    color: var(--color-primary-500);
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
</style>