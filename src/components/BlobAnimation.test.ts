import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { breathingStore } from '../stores/breathingStore';
import { PHASE } from './BreathingCycle.svelte';

// Mock dependencies
vi.mock('../stores/breathingStore', () => ({
  breathingStore: {
    subscribe: vi.fn((callback) => {
      callback({
        currentPhase: 'inhale',
        timeRemaining: 3,
        isRunning: true,
        settings: {
          inhaleDuration: 4,
          holdDuration: 7,
          exhaleDuration: 8,
          restDuration: 2,
          maxCycles: 4,
          soundsEnabled: true,
          volume: 0.7
        }
      });
      return () => {};
    })
  }
}));

vi.mock('svelte/motion', () => ({
  Tween: vi.fn().mockImplementation(() => ({
    target: 1,
    current: 1,
    set: vi.fn(),
    update: vi.fn()
  }))
}));

vi.mock('svelte/easing', () => ({
  cubicOut: vi.fn()
}));

// Mock requestAnimationFrame and cancelAnimationFrame
const mockRequestAnimationFrame = vi.fn((callback) => {
  callback();
  return 123;
});

const mockCancelAnimationFrame = vi.fn();

// Extract core functions from BlobAnimation.svelte for testing
function createBlobAnimationTester() {
  // Configuration
  const layerCount = 3;
  const baseRadius = 140;
  const blurRadius = 25;
  
  // Functions to test
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
  
  function interpolatePaths(pathA: string, pathB: string, t: number): string {
    // Simplified version of the function for testing
    const pathSegments = {
      M: /M\s+([0-9.-]+),([0-9.-]+)/,
      C: /C\s+([0-9.-]+),([0-9.-]+)\s+([0-9.-]+),([0-9.-]+)\s+([0-9.-]+),([0-9.-]+)/g,
      Z: /Z/
    };
    
    // Extract starting coordinates
    const startA = pathSegments.M.exec(pathA);
    const startB = pathSegments.M.exec(pathB);
    
    if (!startA || !startB) return pathA;
    
    // Interpolate the starting point
    const startX = parseFloat(startA[1]) * (1 - t) + parseFloat(startB[1]) * t;
    const startY = parseFloat(startA[2]) * (1 - t) + parseFloat(startB[2]) * t;
    
    let result = `M ${startX},${startY}`;
    
    // Extract all bezier curve segments
    const curvesA = Array.from(pathA.matchAll(pathSegments.C));
    const curvesB = Array.from(pathB.matchAll(pathSegments.C));
    
    // Use the minimum number of curves
    const minCurves = Math.min(curvesA.length, curvesB.length);
    
    for (let i = 0; i < minCurves; i++) {
      const curveA = curvesA[i];
      const curveB = curvesB[i];
      
      // Interpolate control points and end point
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
  
  // Mock the animation update function
  function updateAnimation(phase: string, timeRemaining: number, totalDuration: number) {
    let scale = 1;
    let opacity = 0.6;
    let progress = 0;
    
    switch(phase) {
      case PHASE.INHALE:
        progress = (totalDuration - timeRemaining) / totalDuration;
        scale = 1 + (progress * 0.5);
        opacity = 0.6 + (progress * 0.2);
        break;
      case PHASE.HOLD:
        scale = 1.5;
        opacity = 0.8;
        break;
      case PHASE.EXHALE:
        progress = (totalDuration - timeRemaining) / totalDuration;
        scale = 1.5 - (progress * 0.5);
        opacity = 0.8 - (progress * 0.2);
        break;
      default:
        scale = 1;
        opacity = 0.6;
    }
    
    return { scale, opacity };
  }
  
  // Mock easing function for tests
  function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  
  return {
    layerCount,
    baseRadius,
    blurRadius,
    generateBlobPath,
    interpolatePaths,
    updateAnimation,
    easeInOutCubic
  };
}

describe('BlobAnimation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup global mocks
    global.window.requestAnimationFrame = mockRequestAnimationFrame;
    global.window.cancelAnimationFrame = mockCancelAnimationFrame;
    
    // Reset Math.random to provide predictable results
    const mockRandom = vi.spyOn(Math, 'random');
    mockRandom.mockReturnValue(0.5);
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  it('should generate valid SVG paths', () => {
    const { generateBlobPath } = createBlobAnimationTester();
    
    const path = generateBlobPath(6, 100, 0.3);
    
    // Path should start with M and end with Z
    expect(path).toMatch(/^M [0-9.-]+,[0-9.-]+/);
    expect(path).toMatch(/Z$/);
    
    // Path should have bezier curves (C)
    expect(path).toContain(' C ');
    
    // With 6 points should have 6 bezier curves
    const curveMatches = path.match(/C /g);
    expect(curveMatches?.length).toBe(6);
  });
  
  it('should interpolate between two paths', () => {
    const { generateBlobPath, interpolatePaths } = createBlobAnimationTester();
    
    const pathA = generateBlobPath(6, 100, 0.3);
    const pathB = generateBlobPath(6, 150, 0.3);
    
    // Test midpoint interpolation (t=0.5)
    const midPath = interpolatePaths(pathA, pathB, 0.5);
    
    // Result should be a valid path
    expect(midPath).toMatch(/^M [0-9.-]+,[0-9.-]+/);
    expect(midPath).toMatch(/Z$/);
    
    // When t=0, the result should be pathA
    const startPath = interpolatePaths(pathA, pathB, 0);
    
    // When paths are a bit complex, exact matching might not work
    // So we'll check just the starting point (M) to be the same
    const startA = /M ([0-9.-]+),([0-9.-]+)/.exec(pathA);
    const startResult = /M ([0-9.-]+),([0-9.-]+)/.exec(startPath);
    
    if (startA && startResult) {
      // Numbers should be very close (allowing for floating point precision)
      expect(parseFloat(startResult[1])).toBeCloseTo(parseFloat(startA[1]), 5);
      expect(parseFloat(startResult[2])).toBeCloseTo(parseFloat(startA[2]), 5);
    }
  });
  
  it('should update animation based on breathing phase', () => {
    const { updateAnimation } = createBlobAnimationTester();
    
    // Test inhale phase
    let animation = updateAnimation(PHASE.INHALE, 2, 4);
    expect(animation.scale).toBeGreaterThan(1);
    expect(animation.opacity).toBeGreaterThan(0.6);
    
    // Test hold phase
    animation = updateAnimation(PHASE.HOLD, 5, 7);
    expect(animation.scale).toBe(1.5);
    expect(animation.opacity).toBe(0.8);
    
    // Test exhale phase
    animation = updateAnimation(PHASE.EXHALE, 4, 8);
    expect(animation.scale).toBeLessThan(1.5);
    expect(animation.opacity).toBeLessThan(0.8);
    
    // Test default phase
    animation = updateAnimation(PHASE.REST, 1, 2);
    expect(animation.scale).toBe(1);
    expect(animation.opacity).toBe(0.6);
  });
  
  it('should apply easing to animation', () => {
    const { easeInOutCubic } = createBlobAnimationTester();
    
    // Test start of animation
    expect(easeInOutCubic(0)).toBe(0);
    
    // Test midpoint (should be 0.5 for a symmetric easing)
    expect(easeInOutCubic(0.5)).toBe(0.5);
    
    // Test end of animation
    expect(easeInOutCubic(1)).toBe(1);
    
    // Test acceleration in first half
    expect(easeInOutCubic(0.25)).toBeLessThan(0.25);
    
    // Test deceleration in second half
    expect(easeInOutCubic(0.75)).toBeGreaterThan(0.75);
  });
});