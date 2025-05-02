import { mount } from 'svelte'
import App from './App.svelte'
import './styles/global.css'
import './lib/i18n' // Import i18n configuration
import { location } from 'svelte-spa-router'

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

// Track the initial route
sendPageView(window.location.hash || '#/');

// Listen for route changes
location.subscribe((route) => {
  sendPageView('#/' + route);
});

export default app
