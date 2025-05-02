<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { breathingStore } from '../stores/breathingStore';
  import { PHASE } from './BreathingCycle.svelte';
  
  // Props
  export let layerCount = 3;
  export let baseRadius = 140; // Increased from 100
  export let blurRadius = 25; // Reduced for sharper edges
  
  // Animation state
  let container: SVGSVGElement;
  let blobs: {
    element: SVGPathElement;
    currentPath: string;
    targetPath: string;
    morphProgress: number;
  }[] = [];
  let animationFrame: number;
  
  // Reactive values for animation using Tween
  const scale = new Tween<number>(1, {
    duration: 300,
    easing: cubicOut,
    interpolate: (a, b) => (t: number) => a * (1 - t) + b * t
  });
  
  const opacity = new Tween<number>(0.6, {
    duration: 300,
    easing: cubicOut,
    interpolate: (a, b) => (t: number) => a * (1 - t) + b * t
  });
  
  // Helper functions for SVG path generation
  function generateBlobPath(complexity = 8, radius = 100, irregularity = 0.5) {
    const points = [];
    const angleStep = (Math.PI * 2) / complexity;
    
    // Generate points in a circle with variation
    for (let i = 0; i < complexity; i++) {
      const angle = i * angleStep;
      const randomRadius = radius * (1 + (Math.random() * irregularity - irregularity/2));
      const x = 400 + Math.cos(angle) * randomRadius;
      const y = 300 + Math.sin(angle) * randomRadius;
      points.push({ x, y });
    }
    
    // Build SVG path using Bézier curves
    let path = `M ${points[0].x},${points[0].y}`;
    
    for (let i = 0; i < points.length; i++) {
      const current = points[i];
      const next = points[(i + 1) % points.length];
      const nextNext = points[(i + 2) % points.length];
      
      // Calculate control points for smooth curves
      const controlX1 = current.x + (next.x - current.x) / 2;
      const controlY1 = current.y + (next.y - current.y) / 2;
      const controlX2 = next.x + (nextNext.x - next.x) / 2;
      const controlY2 = next.y + (nextNext.y - next.y) / 2;
      
      path += ` C ${controlX1},${controlY1} ${controlX2},${controlY2} ${next.x},${next.y}`;
    }
    
    return path + " Z";
  }
  
  // Interpolate between two SVG paths
  function interpolatePaths(pathA: string, pathB: string, t: number): string {
    // Uma implementação real para morphing entre dois SVG paths
    // Esta versão simplificada cria um efeito de morphing visual melhor do que simplesmente alternar
    
    // Para demonstração, usamos uma abordagem de mesclagem de strings
    // Nomes das partes do SVG path que precisamos identificar
    const pathSegments = {
      M: /M\s+([0-9.-]+),([0-9.-]+)/,
      C: /C\s+([0-9.-]+),([0-9.-]+)\s+([0-9.-]+),([0-9.-]+)\s+([0-9.-]+),([0-9.-]+)/g,
      Z: /Z/
    };
    
    // Extrair as coordenadas iniciais (ponto M)
    const startA = pathSegments.M.exec(pathA);
    const startB = pathSegments.M.exec(pathB);
    
    if (!startA || !startB) return pathA;
    
    // Interpolar o ponto inicial
    const startX = parseFloat(startA[1]) * (1 - t) + parseFloat(startB[1]) * t;
    const startY = parseFloat(startA[2]) * (1 - t) + parseFloat(startB[2]) * t;
    
    let result = `M ${startX},${startY}`;
    
    // Extrair todos os segmentos de curva de bezier
    const curvesA = Array.from(pathA.matchAll(pathSegments.C));
    const curvesB = Array.from(pathB.matchAll(pathSegments.C));
    
    // Usamos o número mínimo de curvas para garantir que temos pares para interpolar
    const minCurves = Math.min(curvesA.length, curvesB.length);
    
    for (let i = 0; i < minCurves; i++) {
      const curveA = curvesA[i];
      const curveB = curvesB[i];
      
      // Interpolar os pontos de controle e o ponto final
      const x1 = parseFloat(curveA[1]) * (1 - t) + parseFloat(curveB[1]) * t;
      const y1 = parseFloat(curveA[2]) * (1 - t) + parseFloat(curveB[2]) * t;
      const x2 = parseFloat(curveA[3]) * (1 - t) + parseFloat(curveB[3]) * t;
      const y2 = parseFloat(curveA[4]) * (1 - t) + parseFloat(curveB[4]) * t;
      const x = parseFloat(curveA[5]) * (1 - t) + parseFloat(curveB[5]) * t;
      const y = parseFloat(curveA[6]) * (1 - t) + parseFloat(curveB[6]) * t;
      
      result += ` C ${x1},${y1} ${x2},${y2} ${x},${y}`;
    }
    
    return result + " Z";
  }
  
  // Create the blobs
  function createBlobs() {
    if (!container) return;
    
    // Clear any existing blobs
    const group = container.querySelector('g');
    if (group) {
      group.innerHTML = '';
      
      // Create new blobs
      for (let i = 0; i < layerCount; i++) {
        const blob = document.createElementNS("http://www.w3.org/2000/svg", "path");
        blob.classList.add("blob", `blob-${i}`);
        
        const initialPath = generateBlobPath(8 + i, baseRadius + i * 25, 0.4 + i * 0.15); // Increased complexity and irregularity
        blob.setAttribute("d", initialPath);
        
        // Maior opacidade para melhor visibilidade
        blob.style.opacity = `${0.6 - (i * 0.1)}`;
        blob.style.transformOrigin = 'center center';
        
        group.appendChild(blob);
        
        blobs.push({
          element: blob,
          currentPath: initialPath,
          targetPath: generateBlobPath(8 + i, baseRadius + i * 25, 0.4 + i * 0.15), // Matching changes
          morphProgress: 0
        });
      }
    }
  }
  
  // Update animation based on breathing phase
  function updateAnimation() {
    const state = $breathingStore;
    const { currentPhase, timeRemaining, isRunning, settings } = state;
    let progress = 0;
    
    if (isRunning) {
      switch(currentPhase) {
        case PHASE.INHALE:
          progress = (settings.inhaleDuration - timeRemaining) / settings.inhaleDuration;
          scale.target = 1 + (progress * 0.5); // Increased scale range
          opacity.target = 0.6 + (progress * 0.2);
          break;
        case PHASE.HOLD:
          scale.target = 1.5; // Increased max scale
          opacity.target = 0.8;
          break;
        case PHASE.EXHALE:
          progress = (settings.exhaleDuration - timeRemaining) / settings.exhaleDuration;
          scale.target = 1.5 - (progress * 0.5); // Adjusted for new scale range
          opacity.target = 0.8 - (progress * 0.2);
          break;
        default:
          scale.target = 1;
          opacity.target = 0.6;
      }
    }
    
    // Update each blob
    blobs.forEach((blob, index) => {
      // Aumentar substancialmente a velocidade de morphing para tornar a animação claramente visível
      blob.morphProgress += 0.015;
      
      if (blob.morphProgress >= 1) {
        // Generate new target path when current one is reached
        blob.currentPath = blob.targetPath;
        // Aumentar a irregularidade para formas mais dramáticas
        blob.targetPath = generateBlobPath(
          6 + index, 
          baseRadius + index * 20, 
          0.6 + index * 0.1
        );
        blob.morphProgress = 0;
      }
      
      // Interpolate between paths
      const morphedPath = interpolatePaths(
        blob.currentPath, 
        blob.targetPath, 
        // Usar uma função de easing para movimento mais orgânico
        easeInOutCubic(blob.morphProgress)
      );
      
      // Apply the path and scale with maior amplitude
      if (blob.element) {
        blob.element.setAttribute("d", morphedPath);
        
        // Use current value from tween for scale
        const blobScale = index === 0 ? scale.current : 1 + (scale.current - 1) * 0.7;
        blob.element.style.transform = `scale(${blobScale})`;
      }
    });
    
    // Função de easing para movimento mais natural
    function easeInOutCubic(t: number): number {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    // Continue animation loop
    animationFrame = requestAnimationFrame(updateAnimation);
  }
  
  // Setup and cleanup
  onMount(() => {
    createBlobs();
    animationFrame = requestAnimationFrame(updateAnimation);
    
    // Handle window resize for mobile optimization
    function handleResize() {
      const isMobile = window.innerWidth < 768;
      if (container) {
        const blurElement = container.querySelector('#blur feGaussianBlur');
        if (blurElement) {
          blurElement.setAttribute('stdDeviation', isMobile ? '15' : String(blurRadius));
        }
      }
    }
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });
  
  onDestroy(() => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  });
</script>

<div class="blob-container">
  <svg bind:this={container} viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#blur)"></g>
    <defs>
      <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation={blurRadius} />
      </filter>
    </defs>
  </svg>
</div>

<style>
  .blob-container {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    overflow: hidden;
    z-index: 0; /* Alterado de -1 para 0 */
    pointer-events: none; /* Garante que cliques passem através da animação */
  }
  
  svg {
    width: 100%;
    height: 100%;
    position: absolute;
  }
  
  :global(.blob) {
    fill: var(--color-primary-500, rgba(64, 125, 255, 0.5));
    opacity: 0.5;
    transition: transform 0.3s ease-out;
  }
  
  :global(.dark .blob) {
    fill: var(--color-primary-700, rgba(100, 149, 237, 0.4));
  }
  
  /* Mobile optimization */
  @media (max-width: 768px) {
    :global(.blob) {
      transform-origin: center center;
    }
  }
</style>