<script lang="ts">
  import Router from 'svelte-spa-router';
  import { push, location } from 'svelte-spa-router';
  import { onMount } from 'svelte';
  import CookieConsent from './components/CookieConsent.svelte';
  import { setupNotificationChecker, cleanupNotificationChecker } from './lib/notificationService';
  
  // Import routes
  import Home from './routes/Home.svelte';
  import About from './routes/About.svelte';
  import Copyright from './routes/Copyright.svelte';
  import Privacy from './routes/Privacy.svelte';
  
  // Define routes - using hash-based routing which works well with GitHub Pages
  const routes = {
    // Exact path
    '/': Home,
    
    // Using named parameters
    '/about': About,
    
    // Wildcard parameter
    '/copyright': Copyright,
    
    // Privacy policy page
    '/privacy': Privacy,
    
    // Catch-all, must be last
    '*': Home,
  };
  
  // Handle any initial routing issues and setup notifications
  onMount(() => {
    // If we're on GitHub Pages and somehow end up with an empty location
    // or if the location is missing the hash, redirect to home
    if ($location === '' || !window.location.hash) {
      push('/');
    }
    
    // Inicializa o sistema de notificações se a permissão já foi concedida
    if (window.Notification && Notification.permission === 'granted') {
      console.log('Initializing notification system on app start');
      setupNotificationChecker();
    }
    
    // Limpa o verificador de notificações quando o aplicativo é fechado
    return () => {
      cleanupNotificationChecker();
    };
  });
</script>

<Router {routes} />
<CookieConsent />

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    position: relative;
  }
</style>
