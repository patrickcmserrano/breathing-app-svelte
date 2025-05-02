<script lang="ts">
  import { Switch } from '@skeletonlabs/skeleton-svelte';
  import IconMoon from '@lucide/svelte/icons/moon';
  import IconSun from '@lucide/svelte/icons/sun';
  import { onMount } from 'svelte';
  import { _ } from 'svelte-i18n';

  let isDarkMode = $state(true);

  // Função para definir o tema
  function setTheme(mode: 'dark' | 'light') {
    document.documentElement.setAttribute('data-mode', mode);
    localStorage.setItem('mode', mode);
    isDarkMode = mode === 'dark';
  }

  // Aplicar tema escuro imediatamente durante SSR e client-side
  setTheme('dark');

  onMount(() => {
    const savedMode = localStorage.getItem('mode') || 'dark';
    setTheme(savedMode as 'dark' | 'light');
  });

  function handleThemeChange(checked: boolean) {
    setTheme(checked ? 'dark' : 'light');
  }
</script>

<div class="rounded-md overflow-hidden" title={$_('theme.toggle')}>
  <Switch
    name="theme"
    checked={isDarkMode}
    onCheckedChange={(e) => handleThemeChange(e.checked)}
    controlActive="bg-surface-200"
  >
    {#snippet inactiveChild()}
      <IconMoon size="20" />
    {/snippet}
    {#snippet activeChild()}
      <IconSun size="20" />
    {/snippet}
  </Switch>
</div>