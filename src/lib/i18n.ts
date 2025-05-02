import { addMessages, init, getLocaleFromNavigator, locale, _ } from 'svelte-i18n';

// Define translations inline to avoid import issues
const en = {
  "app.title": "4-7-8 Breathing App",
  "theme.toggle": "Toggle Theme",
  "breathing.inhale": "Inhale",
  "breathing.hold": "Hold",
  "breathing.exhale": "Exhale",
  "breathing.start": "Start",
  "breathing.pause": "Pause",
  "audio.playing": "Playing",
  "audio.paused": "Paused",
  "nav.home": "Home",
  "nav.about": "About",
  "nav.copyright": "Copyright",
  "about.title": "About the 4-7-8 Breathing App",
  "about.content": "The 4-7-8 Breathing App helps reduce anxiety and improve sleep through guided breathing exercises. Created by Patrick CM Serrano.",
  "copyright.title": "Copyright Notice",
  "copyright.content": "© 2025 Patrick CM Serrano. All rights reserved. This app is licensed under the MIT License.",
  "copyright.important_notes": "Important Notes",
  "copyright.attribution": "Attribution is not required but appreciated.",
  "copyright.usage": "You can use the audio files in both commercial and non-commercial projects.",
  "copyright.resell": "You cannot resell or redistribute the audio files.",
  "copyright.restrictions": "Some audio files may have additional restrictions specified on the download page (e.g., non-commercial use only).",
  "copyright.audio_tracks": "Audio Tracks Used in This Project",
  "copyright.track1": "Meditation Spiritual Music",
  "copyright.track2": "Middle East Oriental Music",
  "copyright.track3": "Irish Harp",
  "copyright.track4": "The Voice of the Oud",
  "copyright.track5": "Tibetan Singing Bowl",
  "copyright.provided_by": "All audio tracks are provided by",
  "copyright.license_details": "For full license details, visit the",
  "copyright.terms": "Pixabay Terms of Service",
  "back": "Back to Home"
};

const pt = {
  "app.title": "Aplicativo de Respiração 4-7-8",
  "theme.toggle": "Alternar Tema",
  "breathing.inhale": "Inspirar",
  "breathing.hold": "Segurar",
  "breathing.exhale": "Expirar",
  "breathing.start": "Iniciar",
  "breathing.pause": "Pausar",
  "audio.playing": "Reproduzindo",
  "audio.paused": "Pausado",
  "nav.home": "Início",
  "nav.about": "Sobre",
  "nav.copyright": "Direitos Autorais",
  "about.title": "Sobre o Aplicativo de Respiração 4-7-8",
  "about.content": "O Aplicativo de Respiração 4-7-8 ajuda a reduzir a ansiedade e melhorar o sono por meio de exercícios de respiração guiados. Criado por Patrick CM Serrano.",
  "copyright.title": "Aviso de Direitos Autorais",
  "copyright.content": "© 2025 Patrick CM Serrano. Todos os direitos reservados. Este aplicativo é licenciado sob a Licença MIT.",
  "copyright.important_notes": "Notas Importantes",
  "copyright.attribution": "Atribuição não é obrigatória, mas apreciada.",
  "copyright.usage": "Você pode usar os arquivos de áudio em projetos comerciais e não comerciais.",
  "copyright.resell": "Você não pode revender ou redistribuir os arquivos de áudio.",
  "copyright.restrictions": "Alguns arquivos de áudio podem ter restrições adicionais especificadas na página de download (por exemplo, apenas para uso não comercial).",
  "copyright.audio_tracks": "Faixas de Áudio Utilizadas Neste Projeto",
  "copyright.track1": "Música Espiritual de Meditação",
  "copyright.track2": "Música Oriental do Oriente Médio",
  "copyright.track3": "Harpa Irlandesa",
  "copyright.track4": "Voz do Oud",
  "copyright.track5": "Tigela Tibetana",
  "copyright.provided_by": "Todas as faixas de áudio são fornecidas por",
  "copyright.license_details": "Para detalhes completos da licença, visite os",
  "copyright.terms": "Termos de Serviço do Pixabay",
  "back": "Voltar ao Início"
};

// Function to get the initial locale based on browser or localStorage
function getInitialLocale() {
  if (typeof window === 'undefined') {
    return 'en';
  }
  
  // Check if a preferred language is stored in localStorage
  const savedLocale = localStorage.getItem('preferredLanguage');
  
  if (savedLocale) {
    return savedLocale;
  }
  
  // Fallback to browser language if available
  const browserLocale = navigator.language.split('-')[0];
  return browserLocale === 'pt' ? 'pt' : 'en'; // Only support en and pt for now
}

// Add messages to the dictionary
addMessages('en', en);
addMessages('pt', pt);

// Initialize i18n with appropriate settings
function setupI18n() {
  const initialLocale = getInitialLocale();
  
  init({
    fallbackLocale: 'en',
    initialLocale: initialLocale,
  });
}

// Setup on load
setupI18n();

export { _, locale };