<script lang="ts">
  import IconPlay from '@lucide/svelte/icons/play';
  import IconPause from '@lucide/svelte/icons/pause';

  let isPlaying = $state(false);
  let audio: HTMLAudioElement | null = $state(null);
  let selectedAudio = $state('/sounds/meditation-spiritual-music.mp3');

  // List of available background sounds
  const audioOptions = [
    { value: '/sounds/meditation-spiritual-music.mp3', label: 'Meditation Music' },
    { value: '/sounds/middle-east-oriental-music.mp3', label: 'Oriental Music' },
    { value: '/sounds/round-of-fairies-quot-irish-harp.mp3', label: 'Irish Harp' },
    { value: '/sounds/the-voice-of-the-oud.mp3', label: 'The Oud' },
    { value: '/sounds/tibetan-singing-bowl.mp3', label: 'Tibetan Bowl' }
  ];

  $effect(() => {
    if (!audio) {
      audio = new Audio(selectedAudio);
      audio.loop = true;
      audio.volume = 0.5;
    } else {
      // Update audio source if selection changes
      if (audio.src !== new URL(selectedAudio, window.location.href).href) {
        const wasPlaying = isPlaying;
        audio.pause();
        audio.src = selectedAudio;
        if (wasPlaying) {
          audio.play().catch(error => console.error('Error playing audio:', error));
        }
      }
    }

    if (isPlaying) {
      audio.play().catch(error => console.error('Error playing audio:', error));
    } else {
      audio.pause();
    }

    return () => {
      if (audio) audio.pause();
    };
  });

  function toggleAudio() {
    isPlaying = !isPlaying;
  }

  function handleAudioChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    selectedAudio = select.value;
  }
</script>

<div class="flex flex-col md:flex-row items-center gap-2 p-2 bg-surface-100 dark:bg-surface-800 rounded-lg shadow-md">
  <button
    class="btn variant-filled-primary px-3 py-2 rounded"
    onclick={toggleAudio}
  >
    {#if isPlaying}
      <IconPause size="16" />
    {:else}
      <IconPlay size="16" />
    {/if}
  </button>
  
  <div class="flex-1 mx-2">
    <select 
      class="select w-full bg-surface-200 dark:bg-surface-700 border border-surface-300 dark:border-surface-600 rounded"
      onchange={handleAudioChange}
      value={selectedAudio}
    >
      {#each audioOptions as option}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
  </div>
  
  <span class="text-sm">{isPlaying ? 'Playing' : 'Paused'}</span>
</div>

<style>
  select {
    padding: 0.4rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
  }
  
  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-primary-500);
    color: white;
    border: none;
    cursor: pointer;
    transition: var(--transition-standard);
  }
  
  button:hover {
    background-color: var(--color-primary-700);
  }
</style>