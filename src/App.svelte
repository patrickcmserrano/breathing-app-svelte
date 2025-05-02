<script lang="ts">
  import Router from 'svelte-spa-router';
  
  // Import routes
  import Home from './routes/Home.svelte';
  import About from './routes/About.svelte';
  import Copyright from './routes/Copyright.svelte';
  
  // Get the base path from Vite environment if available
  const basePath = import.meta.env.BASE_URL || '/';
  
  // Define routes
  const routes = {
    // Exact path
    '/': Home,
    
    // Using named parameters
    '/about': About,
    
    // Wildcard parameter
    '/copyright': Copyright,
    
    // Catch-all, must be last
    '*': Home,
  };
</script>

<Router {routes} />

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    position: relative;
  }
</style>
