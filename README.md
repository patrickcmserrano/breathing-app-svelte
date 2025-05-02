# WebOasis 4-7-8 - Aplicativo de Respiração

Um aplicativo web moderno para técnicas de respiração, construído com Svelte 5, TypeScript e Vite. O aplicativo implementa a técnica de respiração 4-7-8, conhecida por ajudar a reduzir ansiedade e melhorar o sono.

![Captura de tela do WebOasis 4-7-8](./public/screenshot.png)

## Funcionalidades

- ✨ **Animação de respiração visual** - Guia visual para a técnica 4-7-8
- 🔊 **Guia de áudio** - Indicações sonoras para cada fase da respiração
- 🌙 **Modo claro/escuro** - Troca de tema adaptável às suas preferências
- 🎵 **Música de fundo** - Escolha entre diferentes sons relaxantes
- 🌐 **Suporte multilíngue** - Disponível em 7 idiomas (EN, PT, ES, FR, ZH, HI, AR)
- ⚙️ **Configurações personalizáveis** - Ajuste a duração de cada fase da respiração
- 📱 **Design responsivo** - Funciona em dispositivos móveis, tablets e desktops

## Tecnologias Utilizadas

- **Frontend**: Svelte 5, TypeScript, TailwindCSS
- **Estilização**: Skeleton UI, CSS personalizado
- **Internacionalização**: svelte-i18n
- **Roteamento**: svelte-spa-router
- **Animações**: Animações SVG personalizadas, Svelte Tweens
- **Ferramentas**: Vite, ESLint, TypeScript
- **Deploy**: GitHub Pages

## Configuração Svelte 5

Este projeto utiliza Svelte 5, que introduz várias melhorias significativas em relação às versões anteriores:

### Recursos do Svelte 5 implementados:

1. **Reativos com `$state`, `$derived` e `$effect`**
   ```svelte
   <!-- Exemplo de uso -->
   <script lang="ts">
     let count = $state(0);
     let doubled = $derived(count * 2);
     
     $effect(() => {
       console.log(`Count mudou para ${count}, dobrado é ${doubled}`);
     });
   </script>
   ```

2. **Sistema de "snippets" para conteúdo reutilizável**
   ```svelte
   <!-- Em ThemeToggle.svelte -->
   {#snippet activeChild()}
     <IconSun size="24" />
   {/snippet}
   ```

3. **Melhor desempenho** com compilador otimizado e atualizações granulares
  
4. **Integração TypeScript aprimorada** com inferência de tipos mais precisa

### Configuração do Svelte:

O arquivo `svelte.config.js` configura o pré-processador Svelte:

```js
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

export default {
  preprocess: vitePreprocess(),
}
```

Esta configuração permite:
- Processamento de TypeScript
- Suporte a PostCSS/TailwindCSS
- Carregamento de módulos CSS

## Estrutura do Projeto

```
📦 breathing-app-svelte
├── 📂 public/
│   ├── 📂 sounds/           # Arquivos de áudio para respiração e música de fundo
│   └── favicon.ico
├── 📂 src/
│   ├── 📂 components/       # Componentes reutilizáveis
│   │   ├── AudioPlayer.svelte
│   │   ├── BlobAnimation.svelte
│   │   ├── BreathingCycle.svelte
│   │   ├── LanguageSelector.svelte
│   │   ├── NavMenu.svelte
│   │   ├── PageLayout.svelte
│   │   ├── Settings.svelte
│   │   └── ThemeToggle.svelte
│   ├── 📂 lib/              # Bibliotecas e utilidades
│   │   ├── 📂 locales/      # Arquivos de tradução
│   │   │   ├── ar.ts        # Árabe
│   │   │   ├── en.ts        # Inglês
│   │   │   ├── es.ts        # Espanhol
│   │   │   ├── fr.ts        # Francês
│   │   │   ├── hi.ts        # Hindi
│   │   │   ├── pt.ts        # Português
│   │   │   └── zh.ts        # Chinês
│   │   └── i18n.ts          # Configuração de internacionalização
│   ├── 📂 routes/           # Componentes de página
│   │   ├── About.svelte
│   │   ├── Copyright.svelte
│   │   └── Home.svelte
│   ├── 📂 stores/           # Gerenciamento de estado
│   │   ├── audioStore.ts
│   │   └── breathingStore.ts
│   ├── 📂 styles/           # Estilos globais
│   │   └── global.css
│   ├── App.svelte           # Componente raiz
│   └── main.ts              # Ponto de entrada da aplicação
└── ... (arquivos de configuração)
```

## Deploy com GitHub Pages

O projeto está configurado para deploy automático no GitHub Pages usando GitHub Actions. O workflow realiza as seguintes etapas:

1. **Checkout do código**
2. **Setup do Node.js** (versão 20)
3. **Instalação de dependências**
4. **Build do projeto**
5. **Deploy para GitHub Pages**

### Configuração do workflow:

O arquivo `.github/workflows/deploy.yml` define o processo automatizado:

```yml
name: Deploy Svelte App to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install and Build
        run: |
          npm ci
          npm run build

      - name: Create .nojekyll
        run: touch dist/.nojekyll

      - name: Upload Artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Configuração para GitHub Pages:

Para que o aplicativo funcione corretamente no GitHub Pages, o arquivo `vite.config.ts` inclui uma configuração especial para o caminho base:

```ts
export default defineConfig({
  plugins: [
    tailwindcss(),
    svelte(),
  ],
  base: process.env.NODE_ENV === 'production' ? '/weboasis/' : './',
});
```

Isso garante que os caminhos dos recursos (JavaScript, CSS, imagens, etc.) sejam gerados corretamente:
- Em desenvolvimento: caminhos relativos
- Em produção: caminhos prefixados com `/weboasis/`

Adicionalmente, o arquivo `404.html` está configurado para redirecionar corretamente as solicitações em caso de atualização da página ou acesso direto a uma rota:

```html
<script>
  // Redirect to index.html with hash routing
  const path = window.location.pathname;
  const repo = '/weboasis/';
  
  // Extract the path after the repo name to convert to hash route
  let route = '';
  if (path.indexOf(repo) !== -1) {
    route = path.slice(path.indexOf(repo) + repo.length);
    if (route.startsWith('/')) route = route.substring(1);
  }
  
  // Redirect to home with the hash route
  window.location.href = window.location.origin + repo + (route ? '#/' + route : '');
</script>
```

### Deploy Manual:

Para realizar um deploy manual do projeto:

```bash
# Compila o projeto para produção
npm run build

# Publica no GitHub Pages usando gh-pages
npm run deploy
```

O script `deploy` está configurado no package.json para utilizar o pacote `gh-pages`:

```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

## Técnica de Respiração 4-7-8

Este aplicativo implementa a técnica de respiração 4-7-8, desenvolvida pelo Dr. Andrew Weil:

1. **Inale** pelo nariz por 4 segundos
2. **Segure** a respiração por 7 segundos
3. **Exale** pela boca por 8 segundos
4. **Repita** o ciclo

Esta técnica simples pode ajudar a:
- Reduzir a ansiedade
- Melhorar o sono
- Controlar respostas emocionais
- Diminuir a frequência cardíaca

## Estratégia de Testes

Este projeto implementa uma estratégia de testes abrangente, utilizando diferentes níveis de testes para garantir a qualidade e robustez do aplicativo:

### Testes Unitários (Vitest)

Os testes unitários são implementados com [Vitest](https://vitest.dev/) e [@testing-library/svelte](https://testing-library.com/docs/svelte-testing-library/intro/), focando em componentes individuais e lógica de negócio isoladamente.

```bash
# Executar testes unitários em modo observador
npm test

# Executar testes unitários uma única vez
npm run test:run

# Gerar relatório de cobertura
npm run test:coverage
```

**Arquivos relevantes:**
- `vitest.config.ts` - Configuração do Vitest
- `src/test/setup.ts` - Configuração global dos testes
- `**/*.test.ts` - Arquivos de teste distribuídos ao lado dos componentes

### Testes End-to-End (Playwright)

Os testes E2E são implementados com [Playwright](https://playwright.dev/), simulando interações de usuário reais no aplicativo.

```bash
# Executar testes E2E
npm run e2e

# Executar testes E2E com interface visual
npm run e2e:ui

# Visualizar relatório de testes E2E
npm run e2e:report
```

**Arquivos relevantes:**
- `playwright.config.ts` - Configuração do Playwright
- `e2e-tests/` - Diretório contendo os testes E2E

### CI/CD com GitHub Actions

Os testes são executados automaticamente no pipeline de CI/CD a cada push ou pull request:

- **Fluxo de trabalho:** `.github/workflows/test-coverage.yml`
- **Ações realizadas:**
  - Execução de testes unitários
  - Geração de relatório de cobertura
  - Execução de testes E2E
  - Upload de relatórios como artefatos
  - Publicação de relatório de cobertura no GitHub Pages

### Estratégia de Mocks

Para testes mais eficientes e isolados, utilizamos diferentes estratégias de mocking:

- **Componentes:** Mocks de componentes filhos quando testamos componentes pais
- **Stores Svelte:** Mocks de stores para testar componentes que dependem deles
- **APIs do navegador:** Mocks de APIs como Audio, localStorage, etc.
- **Internacionalização:** Mocks das funções i18n

### Boas Práticas Implementadas

- **Arquivos de teste próximos ao código:** Facilita a navegação e manutenção
- **Cobertura de código:** Monitoramento de cobertura para identificar áreas não testadas
- **Testing Library:** Uso de queries baseadas em acessibilidade
- **Testes isolados:** Cada teste é independente e não depende do estado de outros testes

## Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev        # Inicia servidor de desenvolvimento

# Build para produção
npm run build      # Gera versão otimizada para produção

# Preview
npm run preview    # Visualiza a versão de produção localmente

# Verifica tipos TypeScript
npm run check      # Executa verificação de tipos

# Deploy para GitHub Pages
npm run deploy     # Publica no GitHub Pages

# Testes
npm test           # Executa testes unitários em modo observador
npm run test:run   # Executa testes unitários uma única vez
npm run test:coverage # Gera relatório de cobertura
npm run e2e        # Executa testes E2E
npm run e2e:ui     # Executa testes E2E com interface visual
npm run e2e:report # Visualiza relatório de testes E2E
npm run test:all   # Executa testes unitários e E2E sequencialmente
```

## Como Começar

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/breathing-app-svelte.git
   cd breathing-app-svelte
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

4. **Acesse o projeto**
   O aplicativo estará disponível em `http://localhost:5173`

## Deploy

O aplicativo está configurado para deploy automático no GitHub Pages usando GitHub Actions.
Cada push para a branch `main` aciona uma build e deploy automático.

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.

## Créditos

- Áudios utilizados neste projeto são fornecidos por [Pixabay](https://pixabay.com/)
- Desenvolvido por Patrick CM Serrano
