<script>
  import PageLayout from '../components/PageLayout.svelte';
  import { _ } from 'svelte-i18n';
</script>

<PageLayout currentPage="about" title={$_('about.title')}>
  <article>
    <section>
      <p>{$_('about.content')}</p>
      
      <h3>{$_('about.features')}</h3>
      <ul>
        <li>{$_('about.feature1')}</li>
        <li>{$_('about.feature2')}</li>
        <li>{$_('about.feature3')}</li>
        <li>{$_('about.feature4')}</li>
        <li>{$_('about.feature5')}</li>
      </ul>

      <h3>{$_('about.developer')}</h3>
      <p>{$_('about.developer_info')}</p>
      
      <h3>{$_('about.source_code')}</h3>
      <p>{$_('about.source_code_info')}</p>
      <p><a href="https://github.com/patrickcmserrano/breathing-app" target="_blank" rel="noopener">{$_('about.view_on_github')}</a></p>
    </section>
    
    <div class="back-link">
      <a href="#/">{$_('back')}</a>
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