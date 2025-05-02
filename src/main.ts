import { mount } from 'svelte'
import App from './App.svelte'
import './styles/global.css'
import './lib/i18n' // Import i18n configuration
import { location } from 'svelte-spa-router'
import { locale } from 'svelte-i18n'
import { SUPPORTED_LANGUAGES } from './lib/i18n'

const app = mount(App, {
  target: document.getElementById('app')!,
})

// Define the gtag function for TypeScript
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Function to send page views to GA4
function sendPageView(path: string) {
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: document.title,
    });
  }
}

// Metadata translations for different languages
const metaTranslations = {
  en: {
    title: "WebOasis 4-7-8: Breathe and Relax",
    description: "Ease anxiety and improve sleep with the 4-7-8 breathing technique. Minimalist, elegant, and fast, with support for 9 languages and relaxing music."
  },
  pt: {
    title: "WebOasis 4-7-8: Respire e Relaxe",
    description: "Alivie a ansiedade e melhore o sono com a técnica de respiração 4-7-8. Minimalista, elegante e rápido, com suporte para 9 idiomas e música relaxante."
  },
  es: {
    title: "WebOasis 4-7-8: Respira y Relájate",
    description: "Alivia la ansiedad y mejora el sueño con la técnica de respiración 4-7-8. Minimalista, elegante y rápido, con soporte para 9 idiomas y música relajante."
  },
  zh: {
    title: "WebOasis 4-7-8: 呼吸与放松",
    description: "通过4-7-8呼吸技巧缓解焦虑并改善睡眠。简约、优雅、快速，支持9种语言和放松音乐。"
  },
  hi: {
    title: "WebOasis 4-7-8: सांस लें और आराम करें",
    description: "4-7-8 श्वास तकनीक के साथ चिंता कम करें और नींद में सुधार करें। सरल, सुंदर और तेज़, 9 भाषाओं और आरामदायक संगीत के साथ।"
  },
  ar: {
    title: "WebOasis 4-7-8: تنفس واسترخ",
    description: "خفف القلق وحسن النوم مع تقنية التنفس 4-7-8. بسيط وأنيق وسريع، مع دعم لـ 9 لغات وموسيقى مريحة."
  },
  fr: {
    title: "WebOasis 4-7-8: Respirez et Détendez-vous",
    description: "Soulagez l'anxiété et améliorez votre sommeil avec la technique de respiration 4-7-8. Minimaliste, élégant et rapide, avec prise en charge de 9 langues et de la musique relaxante."
  },
  ja: {
    title: "WebOasis 4-7-8: 呼吸とリラックス",
    description: "4-7-8の呼吸法で不安を和らげ、睡眠を改善しましょう。ミニマルでエレガント、高速で、9つの言語とリラックス音楽をサポートしています。"
  },
  de: {
    title: "WebOasis 4-7-8: Atmen und Entspannen",
    description: "Lindern Sie Angstzustände und verbessern Sie den Schlaf mit der 4-7-8-Atemtechnik. Minimalistisch, elegant und schnell, mit Unterstützung für 9 Sprachen und entspannender Musik."
  }
};

// Function to update metadata based on the current language
function updateMetadata(lang: string) {
  const validLang = SUPPORTED_LANGUAGES.includes(lang as any) ? lang : 'en';
  const meta = metaTranslations[validLang as keyof typeof metaTranslations] || metaTranslations.en;
  
  // Update document title
  document.title = meta.title;
  
  // Update meta tags
  updateMetaTag('description', meta.description);
  
  // Update Open Graph tags
  updateMetaTag('og:title', meta.title);
  updateMetaTag('og:description', meta.description);
  
  // Update Twitter Card tags
  updateMetaTag('twitter:title', meta.title);
  updateMetaTag('twitter:description', meta.description);
  
  // Update html lang attribute
  document.documentElement.setAttribute('lang', validLang);
}

// Helper function to update meta tags
function updateMetaTag(name: string, content: string) {
  let metaTag: HTMLMetaElement | null = null;
  
  if (name.startsWith('og:')) {
    metaTag = document.querySelector(`meta[property="${name}"]`);
  } else {
    metaTag = document.querySelector(`meta[name="${name}"]`);
  }
  
  if (metaTag) {
    metaTag.setAttribute('content', content);
  } else {
    metaTag = document.createElement('meta');
    
    if (name.startsWith('og:')) {
      metaTag.setAttribute('property', name);
    } else {
      metaTag.setAttribute('name', name);
    }
    
    metaTag.setAttribute('content', content);
    document.head.appendChild(metaTag);
  }
}

// Subscribe to locale changes to update metadata
locale.subscribe(lang => {
  if (lang) {
    updateMetadata(lang);
  }
});

// Track the initial route
sendPageView(window.location.hash || '#/');

// Listen for route changes
location.subscribe((route) => {
  sendPageView('#/' + route);
});

export default app
