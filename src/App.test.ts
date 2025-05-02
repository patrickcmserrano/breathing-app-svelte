import { describe, it, expect, vi, beforeEach } from 'vitest';

// Definir mocks explícitos
const pushMock = vi.fn();
const locationSubscribeMock = vi.fn();

// Mock das dependências
vi.mock('svelte-spa-router', () => ({
  default: vi.fn(),
  push: pushMock,
  location: {
    subscribe: locationSubscribeMock
  }
}));

vi.mock('./routes/Home.svelte', () => ({
  default: vi.fn()
}));

vi.mock('./routes/About.svelte', () => ({
  default: vi.fn()
}));

vi.mock('./routes/Copyright.svelte', () => ({
  default: vi.fn()
}));

// Mock de svelte onMount
vi.mock('svelte', () => ({
  onMount: vi.fn((callback) => callback())
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should correctly import route components', async () => {
    // Verificar se os componentes de rota foram importados
    const homeSpy = vi.mocked(await import('./routes/Home.svelte'));
    const aboutSpy = vi.mocked(await import('./routes/About.svelte'));
    const copyrightSpy = vi.mocked(await import('./routes/Copyright.svelte'));
    
    expect(homeSpy).toBeDefined();
    expect(aboutSpy).toBeDefined();
    expect(copyrightSpy).toBeDefined();
  });
});