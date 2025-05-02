import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Definir mocks explícitos
const mountMock = vi.fn();

// Mock das dependências
vi.mock('svelte', () => ({
  mount: mountMock
}));

vi.mock('./App.svelte', () => ({
  default: 'MockAppComponent'
}));

// Mock para estilos e i18n (módulos sem exports)
vi.mock('./styles/global.css', () => ({}), { virtual: true });
vi.mock('./lib/i18n', () => ({}), { virtual: true });

describe('main.ts', () => {
  const mockAppElement = document.createElement('div');
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock do getElementById
    vi.spyOn(document, 'getElementById').mockReturnValue(mockAppElement);
    
    // Resetar módulos para forçar a re-execução do main.ts
    vi.resetModules();
  });
  
  it('should mount the App component to the DOM', async () => {
    // Importar o main.ts para executá-lo
    await import('./main');
    
    // Verificar se document.getElementById foi chamado com 'app'
    expect(document.getElementById).toHaveBeenCalledWith('app');
    
    // Verificar se o mock de mount foi chamado com os parâmetros corretos
    expect(mountMock).toHaveBeenCalledWith('MockAppComponent', {
      target: mockAppElement
    });
  });
});