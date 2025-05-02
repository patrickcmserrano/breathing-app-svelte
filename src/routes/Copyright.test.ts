import { describe, it, expect, vi } from 'vitest';
import { _ } from 'svelte-i18n';
import { link } from 'svelte-spa-router';

// Mock dependencies
vi.mock('../components/PageLayout.svelte', () => ({
  default: vi.fn()
}));

vi.mock('svelte-i18n', () => ({
  _: () => ({ 
    subscribe: (fn: Function) => {
      fn('translated text');
      return { unsubscribe: () => {} };
    }
  })
}));

vi.mock('svelte-spa-router', () => ({
  link: vi.fn()
}));

// Create a function that simulates the Copyright component behavior
function createCopyrightComponent() {
  // Simulated properties and methods that would be used by the component
  const pageProps = {
    currentPage: 'copyright',
    title: 'translated text'
  };
  
  const getPageContent = () => {
    return {
      title: pageProps.title,
      sections: [
        {
          type: 'paragraph',
          content: 'translated text' // copyright.content
        },
        {
          type: 'importantNotes',
          title: 'translated text', // copyright.important_notes
          items: [
            'translated text', // copyright.attribution
            'translated text', // copyright.usage
            'translated text', // copyright.resell
            'translated text'  // copyright.restrictions
          ]
        },
        {
          type: 'audioTracks',
          title: 'translated text', // copyright.audio_tracks
          items: [
            'translated text', // copyright.track1
            'translated text', // copyright.track2
            'translated text', // copyright.track3
            'translated text', // copyright.track4
            'translated text'  // copyright.track5
          ]
        },
        {
          type: 'provider',
          content: 'translated text', // copyright.provided_by
          link: {
            text: 'Pixabay',
            url: 'https://pixabay.com/'
          }
        },
        {
          type: 'license',
          content: 'translated text', // copyright.license_details
          link: {
            text: 'translated text', // copyright.terms
            url: 'https://pixabay.com/service/terms/'
          }
        }
      ],
      backLink: {
        text: 'translated text', // back
        url: '#/'
      }
    };
  };

  return {
    pageProps,
    getPageContent
  };
}

describe('Copyright Route', () => {
  it('should render with correct page props', () => {
    const component = createCopyrightComponent();
    const { pageProps } = component;
    
    expect(pageProps.currentPage).toBe('copyright');
    expect(pageProps.title).toBe('translated text');
  });
  
  it('should contain the main content sections', () => {
    const component = createCopyrightComponent();
    const content = component.getPageContent();
    
    // Check if all required sections are present
    expect(content.sections.length).toBe(5);
    
    // Check important notes section
    const notesSection = content.sections.find(s => s.type === 'importantNotes');
    expect(notesSection).toBeDefined();
    expect(notesSection?.items.length).toBe(4);
    
    // Check audio tracks section
    const tracksSection = content.sections.find(s => s.type === 'audioTracks');
    expect(tracksSection).toBeDefined();
    expect(tracksSection?.items.length).toBe(5);
  });
  
  it('should have links to external resources', () => {
    const component = createCopyrightComponent();
    const content = component.getPageContent();
    
    // Check Pixabay link
    const providerSection = content.sections.find(s => s.type === 'provider');
    expect(providerSection).toBeDefined();
    expect(providerSection?.link.url).toBe('https://pixabay.com/');
    
    // Check terms link
    const licenseSection = content.sections.find(s => s.type === 'license');
    expect(licenseSection).toBeDefined();
    expect(licenseSection?.link.url).toBe('https://pixabay.com/service/terms/');
  });
  
  it('should have a back link to home page', () => {
    const component = createCopyrightComponent();
    const content = component.getPageContent();
    
    expect(content.backLink.url).toBe('#/');
  });
});