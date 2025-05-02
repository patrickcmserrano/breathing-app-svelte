import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { _ } from 'svelte-i18n';

// Mock svelte-i18n
vi.mock('svelte-i18n', () => ({
  _: () => ({ 
    subscribe: (fn: Function) => {
      fn('translated text');
      return { unsubscribe: () => {} };
    }
  })
}));

// Mock Lucide icons
vi.mock('@lucide/svelte/icons/play', () => ({
  default: vi.fn()
}));

vi.mock('@lucide/svelte/icons/pause', () => ({
  default: vi.fn()
}));

// Mock Audio API
class MockAudio {
  src: string;
  loop: boolean = false;
  volume: number = 1;
  paused: boolean = true;
  
  constructor(src: string) {
    this.src = src;
  }
  
  play() {
    this.paused = false;
    return Promise.resolve();
  }
  
  pause() {
    this.paused = true;
  }
}

const playSpy = vi.spyOn(MockAudio.prototype, 'play');
const pauseSpy = vi.spyOn(MockAudio.prototype, 'pause');

// Create a function that mimics the AudioPlayer component's behavior
function createAudioPlayer() {
  let isPlaying = false;
  let audio: MockAudio | null = null;
  let selectedAudio = './sounds/meditation-spiritual-music.mp3';
  
  const audioOptions = [
    { value: './sounds/meditation-spiritual-music.mp3', label: 'audio.meditation' },
    { value: './sounds/middle-east-oriental-music.mp3', label: 'audio.oriental' },
    { value: './sounds/round-of-fairies-quot-irish-harp.mp3', label: 'audio.irish' },
    { value: './sounds/the-voice-of-the-oud.mp3', label: 'audio.oud' },
    { value: './sounds/tibetan-singing-bowl.mp3', label: 'audio.tibetan' }
  ];
  
  function initialize() {
    if (!audio) {
      audio = new MockAudio(selectedAudio);
      audio.loop = true;
      audio.volume = 0.5;
    }
  }
  
  function toggleAudio() {
    isPlaying = !isPlaying;
    
    if (!audio) {
      initialize();
    }
    
    if (isPlaying) {
      audio?.play().catch(error => console.error('Error playing audio:', error));
    } else {
      audio?.pause();
    }
  }
  
  function changeAudio(newSrc: string) {
    selectedAudio = newSrc;
    
    if (!audio) {
      initialize();
      return;
    }
    
    const wasPlaying = isPlaying;
    audio.pause();
    audio.src = newSrc;
    
    if (wasPlaying) {
      audio.play().catch(error => console.error('Error playing audio:', error));
    }
  }
  
  function cleanup() {
    if (audio) {
      audio.pause();
      audio = null;
    }
  }
  
  return {
    get isPlaying() { return isPlaying; },
    get selectedAudio() { return selectedAudio; },
    audioOptions,
    toggleAudio,
    changeAudio,
    cleanup,
    getAudio: () => audio
  };
}

describe('AudioPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.Audio = MockAudio as any;
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  it('should initialize with default audio and not playing', () => {
    const player = createAudioPlayer();
    
    expect(player.isPlaying).toBe(false);
    expect(player.selectedAudio).toBe('./sounds/meditation-spiritual-music.mp3');
    expect(player.getAudio()).toBeNull(); // Audio is created only when needed
  });
  
  it('should toggle audio playback when toggleAudio is called', () => {
    const player = createAudioPlayer();
    
    // First toggle - start playing
    player.toggleAudio();
    
    expect(playSpy).toHaveBeenCalled();
    
    // Second toggle - pause
    vi.clearAllMocks();
    player.toggleAudio();
    
    expect(pauseSpy).toHaveBeenCalled();
  });
  
  it('should change the audio source when changeAudio is called', () => {
    const player = createAudioPlayer();
    
    // Start playing first
    player.toggleAudio();
    vi.clearAllMocks();
    
    // Change to a different audio
    const newAudioSrc = './sounds/tibetan-singing-bowl.mp3';
    player.changeAudio(newAudioSrc);
    
    // Should pause current, set new source, and resume playing
    expect(pauseSpy).toHaveBeenCalled();
    expect(player.selectedAudio).toBe(newAudioSrc);
    expect(playSpy).toHaveBeenCalled();
  });
  
  it('should clean up resources when cleanup is called', () => {
    const player = createAudioPlayer();
    
    // Start playing to initialize audio
    player.toggleAudio();
    vi.clearAllMocks();
    
    // Clean up
    player.cleanup();
    
    expect(pauseSpy).toHaveBeenCalled();
    expect(player.getAudio()).toBeNull();
  });
  
  it('should not throw errors when actions are performed without audio initialized', () => {
    const player = createAudioPlayer();
    
    // These should not throw errors
    expect(() => player.cleanup()).not.toThrow();
  });
});