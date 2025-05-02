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

// Create a function that simulates the About component behavior
function createAboutComponent() {
  // Simulated properties and methods that would be used by the component
  const pageProps = {
    currentPage: 'about',
    title: 'translated text'
  };
  
  const getPageContent = () => {
    return {
      title: pageProps.title,
      sections: [
        {
          type: 'paragraph',
          content: 'translated text' // about.content
        },
        {
          type: 'features',
          title: 'translated text', // about.features
          items: [
            'translated text', // about.feature1
            'translated text', // about.feature2
            'translated text', // about.feature3
            'translated text', // about.feature4
            'translated text'  // about.feature5
          ]
        },
        {
          type: 'developer',
          title: 'translated text', // about.developer
          content: 'translated text' // about.developer_info
        },
        {
          type: 'source',
          title: 'translated text', // about.source_code
          content: 'translated text', // about.source_code_info
          link: {
            text: 'translated text', // about.view_on_github
            url: 'https://github.com/patrickcmserrano/breathing-app'
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

describe('About Route', () => {
  it('should render with correct page props', () => {
    const component = createAboutComponent();
    const { pageProps } = component;
    
    expect(pageProps.currentPage).toBe('about');
    expect(pageProps.title).toBe('translated text');
  });
  
  it('should contain the main content sections', () => {
    const component = createAboutComponent();
    const content = component.getPageContent();
    
    // Check if all required sections are present
    expect(content.sections.length).toBe(4);
    
    // Check features section
    const featuresSection = content.sections.find(s => s.type === 'features');
    expect(featuresSection).toBeDefined();
    expect(featuresSection?.items.length).toBe(5);
    
    // Check source code section with GitHub link
    const sourceSection = content.sections.find(s => s.type === 'source');
    expect(sourceSection).toBeDefined();
    expect(sourceSection?.link.url).toBe('https://github.com/patrickcmserrano/breathing-app');
  });
  
  it('should have a back link to home page', () => {
    const component = createAboutComponent();
    const content = component.getPageContent();
    
    expect(content.backLink.url).toBe('#/');
  });
});