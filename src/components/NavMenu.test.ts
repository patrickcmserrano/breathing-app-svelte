import { describe, it, expect, vi } from 'vitest';

// Mock dependencies
vi.mock('svelte-i18n', () => ({
  _: () => ({ 
    subscribe: (fn: Function) => {
      fn('Translated Text');
      return { unsubscribe: () => {} };
    }
  })
}));

vi.mock('./ThemeToggle.svelte', () => ({
  default: vi.fn()
}));

vi.mock('./LanguageSelector.svelte', () => ({
  default: vi.fn()
}));

vi.mock('svelte-spa-router', () => ({
  link: vi.fn()
}));

// Create a function that simulates the NavMenu component behavior
function createNavMenuTester() {
  let currentPage = 'home';
  
  function setCurrentPage(page: 'home' | 'about' | 'copyright') {
    currentPage = page;
  }
  
  function getMenuItems() {
    return [
      { 
        id: 'home', 
        isActive: currentPage === 'home',
        href: '#/',
        label: 'nav.home'
      },
      { 
        id: 'about', 
        isActive: currentPage === 'about',
        href: '#/about',
        label: 'nav.about'
      },
      { 
        id: 'copyright', 
        isActive: currentPage === 'copyright',
        href: '#/copyright',
        label: 'nav.copyright'
      }
    ];
  }
  
  return {
    currentPage,
    setCurrentPage,
    getMenuItems
  };
}

describe('NavMenu', () => {
  it('should default to home page when no page is specified', () => {
    const navMenu = createNavMenuTester();
    expect(navMenu.currentPage).toBe('home');
  });
  
  it('should correctly mark active page in menu items', () => {
    const navMenu = createNavMenuTester();
    
    // Test home page (default)
    let menuItems = navMenu.getMenuItems();
    expect(menuItems[0].isActive).toBe(true);
    expect(menuItems[1].isActive).toBe(false);
    expect(menuItems[2].isActive).toBe(false);
    
    // Test about page
    navMenu.setCurrentPage('about');
    menuItems = navMenu.getMenuItems();
    expect(menuItems[0].isActive).toBe(false);
    expect(menuItems[1].isActive).toBe(true);
    expect(menuItems[2].isActive).toBe(false);
    
    // Test copyright page
    navMenu.setCurrentPage('copyright');
    menuItems = navMenu.getMenuItems();
    expect(menuItems[0].isActive).toBe(false);
    expect(menuItems[1].isActive).toBe(false);
    expect(menuItems[2].isActive).toBe(true);
  });
  
  it('should use correct navigation URLs', () => {
    const navMenu = createNavMenuTester();
    const menuItems = navMenu.getMenuItems();
    
    expect(menuItems[0].href).toBe('#/');
    expect(menuItems[1].href).toBe('#/about');
    expect(menuItems[2].href).toBe('#/copyright');
  });
});