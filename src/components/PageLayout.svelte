<script lang="ts">
  import BlobAnimation from './BlobAnimation.svelte';
  import NavMenu from './NavMenu.svelte';
  
  export let title: string = '';
  export let currentPage: 'home' | 'about' | 'copyright' | 'privacy' = 'home';
</script>

<div class="page-container">
  <!-- Animação de fundo comum a todas as páginas -->
  <BlobAnimation baseRadius={150} blurRadius={35} />
  
  <!-- Menu de navegação compartilhado -->
  <NavMenu {currentPage}>
    <svelte:fragment slot="rightContent">
      <slot name="rightContent" />
    </svelte:fragment>
  </NavMenu>

  <!-- Container de conteúdo -->
  <main class="content-container">
    {#if title}
      <h1>{title}</h1>
    {/if}
    
    <!-- Conteúdo da página será inserido aqui -->
    <slot />
  </main>
</div>

<style>
  /* Garantir que o container principal não bloqueie a animação de fundo */
  .page-container {
    position: relative;
    min-height: 100vh;
    z-index: 1;
    background-color: transparent;
  }

  .content-container {
    max-width: 800px;
    margin: 2rem auto;
    padding: 2rem;
    background-color: transparent; /* Removido o background opaco */
    border-radius: 8px;
    box-shadow: none; /* Removido para não criar um bloco opaco */
    position: relative;
    z-index: 2;
  }
  
  h1 {
    font-size: 2rem;
    margin-bottom: 1.5rem;
    color: var(--color-primary-500);
  }

  @media (max-width: 768px) {
    .content-container {
      padding: 1.5rem;
      margin: 1rem;
    }
  }
</style>