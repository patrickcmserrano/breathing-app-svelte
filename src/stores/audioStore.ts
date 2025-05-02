import { writable, derived } from 'svelte/store';
import { breathingStore } from './breathingStore';

// Define sound paths - these will need to be present in the public/sounds directory
const soundPaths = {
  inhale: './sounds/inhale.mp3',
  hold: './sounds/hold.mp3',
  exhale: './sounds/exhale.mp3'
};

// Audio store type
interface AudioState {
  soundsEnabled: boolean;
  volume: number;
  sounds: {
    [key: string]: HTMLAudioElement | null;
  };
  loaded: boolean;
}

// Create and initialize the audio store
const createAudioStore = () => {
  // Initial state
  const initialState: AudioState = {
    soundsEnabled: true,
    volume: 0.7,
    sounds: {
      inhale: null,
      hold: null,
      exhale: null
    },
    loaded: false
  };

  const { subscribe, set, update } = writable<AudioState>(initialState);

  // Initialize audio elements
  const initialize = () => {
    if (typeof window === 'undefined') return; // Skip on SSR

    update(state => {
      const newSounds: {[key: string]: HTMLAudioElement} = {};
      
      // Create audio elements for each sound
      for (const [key, path] of Object.entries(soundPaths)) {
        const audio = new Audio(path);
        audio.preload = 'auto';
        newSounds[key] = audio;
      }
      
      return {
        ...state,
        sounds: newSounds,
        loaded: true
      };
    });
  };

  // Play a specific sound
  const playSound = (soundKey: string) => {
    if (typeof window === 'undefined') return; // Skip on SSR

    update(state => {
      // Don't play if sounds are disabled
      if (!state.soundsEnabled || !state.loaded) return state;

      const sound = state.sounds[soundKey];
      if (sound) {
        sound.currentTime = 0;
        sound.volume = state.volume;
        sound.play().catch(e => console.error(`Error playing sound: ${e}`));
      }
      
      return state;
    });
  };

  // Set volume for all sounds
  const setVolume = (volume: number) => {
    update(state => {
      for (const sound of Object.values(state.sounds)) {
        if (sound) {
          sound.volume = volume;
        }
      }
      
      return {
        ...state,
        volume
      };
    });
  };

  // Toggle sounds enabled/disabled
  const toggleSounds = () => {
    update(state => {
      // Update breathing store sound setting as well
      breathingStore.updateSettings({ soundsEnabled: !state.soundsEnabled });
      
      return {
        ...state,
        soundsEnabled: !state.soundsEnabled
      };
    });
  };

  // Sync with breathing store settings
  derived(breathingStore, $breathingStore => {
    update(state => ({
      ...state,
      soundsEnabled: $breathingStore.settings.soundsEnabled,
      volume: $breathingStore.settings.volume
    }));
    return $breathingStore;
  }).subscribe(() => {});

  return {
    subscribe,
    initialize,
    playSound,
    setVolume,
    toggleSounds
  };
};

export const audioStore = createAudioStore();