import React, { useEffect, useRef, useState } from 'react';
import { CharacterId } from '../types/game';
import { CHARACTERS } from '../utils/constants';
import { sound } from '../utils/audio';
import { ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';

interface GameCanvasProps {
  characterId: CharacterId;
  totalPuzzles: number;
  currentPuzzleIndex: number;
  isPuzzleActive: boolean;
  onTriggerPuzzle: (puzzleIndex: number) => void;
  onCollectStar: (points: number) => void;
  onCompleteAdventure: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

interface StarItem {
  id: number;
  x: number;
  y: number;
  collected: boolean;
  bobOffset: number;
}

interface CheckpointAltar {
  puzzleIndex: number;
  x: number;
  triggered: boolean;
  cleared: boolean;
  name: string;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  characterId,
  totalPuzzles,
  currentPuzzleIndex,
  isPuzzleActive,
  onTriggerPuzzle,
  onCollectStar,
  onCompleteAdventure,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Touch controls states for mobile & tablet
  const [isMobileControlsVisible, setIsMobileControlsVisible] = useState(false);

  // References for game loop state (independent of React renders for clean 60fps)
  const gameStateRef = useRef({
    // World coordinates
    worldLength: 3600, // Total path length in pixels
    cameraX: 0,
    viewportWidth: 1200,
    viewportHeight: 600,

    // Player physics
    player: {
      x: 80,
      y: 0,
      vx: 0,
      vy: 0,
      width: 52,
      height: 64,
      isGrounded: true,
      facing: 1 as 1 | -1,
      runCycle: 0,
      squash: 1,
      stretch: 1,
      coyoteTime: 0,
      jumpBuffer: 0,
    },

    // Inputs
    heldKeys: {
      left: false,
      right: false,
      jump: false,
    },

    // Checkpoints / Altars
    altars: [] as CheckpointAltar[],

    // Collectibles
    stars: [] as StarItem[],

    // Visual particles
    particles: [] as Particle[],
    fireflies: [] as { x: number; y: number; baseSpeed: number; size: number; phase: number }[],

    // Loop control
    lastTime: performance.now(),
    animationFrameId: 0,
    isDestroyed: false,
  });

  // Setup initial altars and collectibles based on totalPuzzles
  useEffect(() => {
    const state = gameStateRef.current;
    state.worldLength = 800 + totalPuzzles * 650;

    // Distribute puzzle altars evenly along the trail
    const altars: CheckpointAltar[] = [];
    for (let i = 0; i < totalPuzzles; i++) {
      const altarX = 550 + i * 650;
      altars.push({
        puzzleIndex: i,
        x: altarX,
        triggered: i < currentPuzzleIndex,
        cleared: i < currentPuzzleIndex,
        name: `Gerbang #${i + 1}`,
      });
    }
    state.altars = altars;

    // Distribute star collectibles between checkpoints
    const stars: StarItem[] = [];
    for (let x = 200; x < state.worldLength - 200; x += 110) {
      // Don't place stars right on the altar
      const nearAltar = altars.some(a => Math.abs(a.x - x) < 60);
      if (!nearAltar) {
        stars.push({
          id: x,
          x,
          y: 350 - (Math.sin(x * 0.05) > 0.4 ? 60 : 0),
          collected: false,
          bobOffset: Math.random() * Math.PI * 2,
        });
      }
    }
    state.stars = stars;

    // Ambient fireflies in the jungle
    const fireflies = [];
    for (let f = 0; f < 35; f++) {
      fireflies.push({
        x: Math.random() * state.worldLength,
        y: Math.random() * 500,
        baseSpeed: 0.3 + Math.random() * 0.5,
        size: 2 + Math.random() * 3,
        phase: Math.random() * Math.PI * 2,
      });
    }
    state.fireflies = fireflies;
  }, [totalPuzzles, currentPuzzleIndex]);

  // Sync puzzle cleared status
  useEffect(() => {
    const state = gameStateRef.current;
    state.altars.forEach(altar => {
      if (altar.puzzleIndex < currentPuzzleIndex) {
        altar.cleared = true;
        altar.triggered = true;
      }
    });
  }, [currentPuzzleIndex]);

  // Keyboard and Window Blur Listeners
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isPuzzleActive) return;
      const state = gameStateRef.current;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        state.heldKeys.left = true;
      }
      if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        state.heldKeys.right = true;
      }
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        state.heldKeys.jump = true;
        state.player.jumpBuffer = 0.15; // 150ms buffer
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const state = gameStateRef.current;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') state.heldKeys.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') state.heldKeys.right = false;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') state.heldKeys.jump = false;
    };

    const onBlur = () => {
      const state = gameStateRef.current;
      state.heldKeys.left = false;
      state.heldKeys.right = false;
      state.heldKeys.jump = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    // Detect touch capability
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setIsMobileControlsVisible(true);
    }

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [isPuzzleActive]);

  // 60FPS Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const charConfig = CHARACTERS[characterId] || CHARACTERS.kancil;
    const state = gameStateRef.current;
    state.isDestroyed = false;

    // Handle high DPI crisp rendering
    const handleResize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      state.viewportWidth = rect.width;
      state.viewportHeight = rect.height;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const groundY = 480;
    const gravity = 28;

    const gameLoop = (currentTime: number) => {
      if (state.isDestroyed) return;

      // Clamped delta time for smooth simulation
      const rawDt = (currentTime - state.lastTime) / 1000;
      const dt = Math.min(rawDt, 0.05);
      state.lastTime = currentTime;

      const player = state.player;

      // Only update player physics if not in puzzle modal
      if (!isPuzzleActive) {
        // Horizontal Movement
        let moveDir = 0;
        if (state.heldKeys.left) moveDir -= 1;
        if (state.heldKeys.right) moveDir += 1;

        const maxSpeed = charConfig.speed * 68;
        const accel = 600;
        const friction = 800;

        if (moveDir !== 0) {
          player.vx += moveDir * accel * dt;
          if (Math.abs(player.vx) > maxSpeed) {
            player.vx = Math.sign(player.vx) * maxSpeed;
          }
          player.facing = moveDir as 1 | -1;
          player.runCycle += dt * 14;

          // Spawn sparkling leaf/dust trail when moving on ground
          if (player.isGrounded && Math.random() > 0.4) {
            state.particles.push({
              x: player.x + (player.facing === 1 ? -10 : 10),
              y: player.y + player.height - 4,
              vx: -player.facing * (Math.random() * 30 + 10),
              vy: -Math.random() * 25,
              color: Math.random() > 0.5 ? '#34D399' : '#FBBF24',
              size: Math.random() * 4 + 2,
              alpha: 0.8,
              life: 0,
              maxLife: 0.35,
            });
          }
        } else {
          // Apply friction
          if (player.vx > 0) {
            player.vx = Math.max(0, player.vx - friction * dt);
          } else if (player.vx < 0) {
            player.vx = Math.min(0, player.vx + friction * dt);
          }
        }

        // Coyote Time & Jump Buffering
        if (player.isGrounded) {
          player.coyoteTime = 0.12;
        } else {
          player.coyoteTime = Math.max(0, player.coyoteTime - dt);
        }

        player.jumpBuffer = Math.max(0, player.jumpBuffer - dt);

        // Jump Execution
        if (player.jumpBuffer > 0 && player.coyoteTime > 0) {
          player.vy = -charConfig.jumpPower * 38;
          player.isGrounded = false;
          player.coyoteTime = 0;
          player.jumpBuffer = 0;
          player.squash = 0.8;
          player.stretch = 1.3;
          sound.playJump();

          // Jump burst particles
          for (let p = 0; p < 8; p++) {
            state.particles.push({
              x: player.x,
              y: player.y + player.height,
              vx: (Math.random() - 0.5) * 60,
              vy: -Math.random() * 40,
              color: '#6EE7B7',
              size: 3,
              alpha: 0.9,
              life: 0,
              maxLife: 0.3,
            });
          }
        }

        // Variable jump height
        if (!state.heldKeys.jump && player.vy < -100) {
          player.vy += 300 * dt;
        }

        // Gravity
        player.vy += gravity * 28 * dt;

        // Position Integration
        player.x += player.vx * dt;
        player.y += player.vy * dt;

        // Boundaries
        if (player.x < 30) player.x = 30;
        if (player.x > state.worldLength - 40) {
          player.x = state.worldLength - 40;
          // Completed entire level!
          if (!isPuzzleActive && currentPuzzleIndex >= totalPuzzles) {
            onCompleteAdventure();
          }
        }

        // Floor collision
        if (player.y + player.height >= groundY) {
          if (!player.isGrounded) {
            // Landing impact squash
            player.squash = 1.25;
            player.stretch = 0.8;
          }
          player.y = groundY - player.height;
          player.vy = 0;
          player.isGrounded = true;
        }

        // Smooth recovery of squash and stretch
        player.squash += (1 - player.squash) * 12 * dt;
        player.stretch += (1 - player.stretch) * 12 * dt;

        // Checkpoint / Altar Collisions
        for (const altar of state.altars) {
          if (!altar.cleared && !altar.triggered) {
            const dist = Math.abs(player.x - altar.x);
            if (dist < 60) {
              // Stop player and trigger puzzle
              altar.triggered = true;
              player.vx = 0;
              onTriggerPuzzle(altar.puzzleIndex);
              break;
            }
          }
        }

        // Star Collectibles Collision
        for (const star of state.stars) {
          if (!star.collected) {
            const dx = player.x - star.x;
            const dy = (player.y + player.height / 2) - (star.y + Math.sin(currentTime * 0.004 + star.bobOffset) * 6);
            if (Math.hypot(dx, dy) < 42) {
              star.collected = true;
              sound.playCollect();
              onCollectStar(50);

              // Burst of gold stars
              for (let i = 0; i < 10; i++) {
                state.particles.push({
                  x: star.x,
                  y: star.y,
                  vx: (Math.random() - 0.5) * 140,
                  vy: (Math.random() - 0.5) * 140,
                  color: '#FCD34D',
                  size: Math.random() * 5 + 2,
                  alpha: 1,
                  life: 0,
                  maxLife: 0.45,
                });
              }
            }
          }
        }
      }

      // Smooth Camera tracking
      const targetCamX = player.x - state.viewportWidth * 0.35;
      state.cameraX += (targetCamX - state.cameraX) * 8 * dt;
      state.cameraX = Math.max(0, Math.min(state.cameraX, state.worldLength - state.viewportWidth));

      // Render Frame
      render(ctx, state, charConfig, currentTime, groundY);

      state.animationFrameId = requestAnimationFrame(gameLoop);
    };

    state.lastTime = performance.now();
    state.animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      state.isDestroyed = true;
      cancelAnimationFrame(state.animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [characterId, isPuzzleActive, totalPuzzles, currentPuzzleIndex, onTriggerPuzzle, onCollectStar, onCompleteAdventure]);

  // Drawing Routine
  const render = (
    ctx: CanvasRenderingContext2D,
    state: typeof gameStateRef.current,
    char: (typeof CHARACTERS)['kancil'],
    time: number,
    groundY: number
  ) => {
    const { viewportWidth, viewportHeight, cameraX } = state;

    // Clear Screen
    ctx.clearRect(0, 0, viewportWidth, viewportHeight);

    // 1. Deep Parallax Jungle Sky & Canopy (Slowest: 0.1x)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, viewportHeight);
    skyGrad.addColorStop(0, '#041d15');
    skyGrad.addColorStop(0.5, '#063023');
    skyGrad.addColorStop(1, '#0b4734');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, viewportWidth, viewportHeight);

    // Distant Mountain Silhouettes & Tree Canopy
    ctx.save();
    ctx.fillStyle = 'rgba(6, 40, 29, 0.6)';
    ctx.beginPath();
    const bgOffset1 = -(cameraX * 0.12) % 400;
    for (let bx = bgOffset1 - 400; bx < viewportWidth + 400; bx += 220) {
      ctx.arc(bx + 110, 220, 180, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.restore();

    // 2. Midground Jungle Trees & Hanging Vines (0.4x)
    ctx.save();
    ctx.fillStyle = 'rgba(8, 58, 41, 0.75)';
    const bgOffset2 = -(cameraX * 0.35) % 600;
    for (let tx = bgOffset2 - 600; tx < viewportWidth + 600; tx += 300) {
      // Tree trunks
      ctx.fillRect(tx + 60, 160, 40, groundY - 160);
      // Leaves dome
      ctx.beginPath();
      ctx.arc(tx + 80, 150, 90, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 3. Glowing Ambient Fireflies
    ctx.save();
    state.fireflies.forEach(ff => {
      const screenX = ff.x - cameraX * 0.7;
      if (screenX > -20 && screenX < viewportWidth + 20) {
        const pulse = 0.5 + 0.5 * Math.sin(time * 0.003 + ff.phase);
        ctx.fillStyle = `rgba(167, 243, 208, ${0.4 * pulse})`;
        ctx.beginPath();
        ctx.arc(screenX, ff.y + Math.sin(time * 0.002 + ff.phase) * 15, ff.size * pulse, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.restore();

    // 4. Ground Terrain (Foreground: 1.0x)
    ctx.save();
    ctx.translate(-cameraX, 0);

    // Mossy ground layers
    const groundGrad = ctx.createLinearGradient(0, groundY, 0, viewportHeight);
    groundGrad.addColorStop(0, '#064e3b');
    groundGrad.addColorStop(0.15, '#065f46');
    groundGrad.addColorStop(0.5, '#042f2e');
    groundGrad.addColorStop(1, '#021815');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, groundY, state.worldLength, viewportHeight - groundY);

    // Glowing moss edge
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(state.worldLength, groundY);
    ctx.stroke();

    // Decorative grass tufts along ground
    ctx.fillStyle = '#10b981';
    for (let gx = 40; gx < state.worldLength; gx += 80) {
      ctx.beginPath();
      ctx.moveTo(gx, groundY);
      ctx.lineTo(gx - 6, groundY - 12);
      ctx.lineTo(gx, groundY - 4);
      ctx.lineTo(gx + 6, groundY - 14);
      ctx.lineTo(gx + 10, groundY);
      ctx.fill();
    }

    // 5. Checkpoint Altars & Ancient Gates
    state.altars.forEach(altar => {
      const isCurrentTarget = altar.puzzleIndex === currentPuzzleIndex;
      ctx.save();
      ctx.translate(altar.x, groundY);

      // Stone Base
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-35, -90, 70, 90);
      ctx.strokeStyle = altar.cleared ? '#10b981' : isCurrentTarget ? '#f59e0b' : '#64748b';
      ctx.lineWidth = 3;
      ctx.strokeRect(-35, -90, 70, 90);

      // Altar Pillars & Runes
      ctx.fillStyle = altar.cleared ? '#34d399' : isCurrentTarget ? '#fbbf24' : '#94a3b8';
      ctx.beginPath();
      ctx.arc(0, -95, 22, 0, Math.PI * 2);
      ctx.fill();

      // Rune Symbol or Cleared Checkmark
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(altar.cleared ? '✓' : '?', 0, -95);

      // Floating Glow Ring when active
      if (isCurrentTarget) {
        ctx.strokeStyle = `rgba(245, 158, 11, ${0.6 + 0.4 * Math.sin(time * 0.008)})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, -95, 30 + Math.sin(time * 0.006) * 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Altar Label
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(altar.name, 0, 18);

      ctx.restore();
    });

    // 6. Collectible Star Gems
    state.stars.forEach(star => {
      if (!star.collected) {
        const floatY = star.y + Math.sin(time * 0.005 + star.bobOffset) * 6;
        ctx.save();
        ctx.translate(star.x, floatY);

        // Star halo
        const haloGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 20);
        haloGrad.addColorStop(0, 'rgba(251, 191, 36, 0.8)');
        haloGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();

        // 4-point star polygon
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const angle = (i * Math.PI) / 2 + (time * 0.002);
          ctx.lineTo(Math.cos(angle) * 12, Math.sin(angle) * 12);
          const innerAngle = angle + Math.PI / 4;
          ctx.lineTo(Math.cos(innerAngle) * 4, Math.sin(innerAngle) * 4);
        }
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }
    });

    // 7. Animal Protagonist Character
    const p = state.player;
    ctx.save();
    ctx.translate(p.x, p.y + p.height);
    ctx.scale(p.facing * p.squash, p.stretch);

    // Cute animated animal rendering
    const bob = Math.sin(p.runCycle) * 3;
    const legSwing = Math.sin(p.runCycle) * 8;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 20 * p.squash, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.fillStyle = char.id === 'fox' ? '#c2410c' : '#78350f';
    if (!p.isGrounded) {
      // In air jump pose
      ctx.fillRect(-10, -18, 6, 12);
      ctx.fillRect(4, -14, 6, 10);
    } else {
      ctx.fillRect(-10 + legSwing, -18, 6, 18);
      ctx.fillRect(4 - legSwing, -18, 6, 18);
    }

    // Body
    ctx.fillStyle = char.themeColor;
    ctx.beginPath();
    ctx.roundRect(-16, -46 + bob, 32, 32, 12);
    ctx.fill();

    // Chest fur
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.roundRect(-10, -42 + bob, 20, 20, 8);
    ctx.fill();

    // Explorer Leaf Satchel
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(8, -32 + bob, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#854d0e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-12, -42 + bob);
    ctx.lineTo(10, -28 + bob);
    ctx.stroke();

    // Head
    ctx.fillStyle = char.themeColor;
    ctx.beginPath();
    ctx.arc(2, -54 + bob, 16, 0, Math.PI * 2);
    ctx.fill();

    // Ears / Antlers (Kancil vs Fox)
    if (char.id === 'kancil') {
      // Mouse deer ears
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.ellipse(-6, -70 + bob, 5, 9, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(8, -70 + bob, 5, 9, 0.2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Fox pointy ears
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(-10, -66 + bob);
      ctx.lineTo(-6, -82 + bob);
      ctx.lineTo(0, -66 + bob);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(4, -66 + bob);
      ctx.lineTo(10, -82 + bob);
      ctx.lineTo(16, -66 + bob);
      ctx.fill();
    }

    // Friendly Big Eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(8, -55 + bob, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(10, -55 + bob, 3.5, 0, Math.PI * 2);
    ctx.fill();
    // Eye sparkle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(11, -57 + bob, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Cute Smile & Snout
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.arc(14, -50 + bob, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(17, -51 + bob, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // 8. Particles (Sparkles, dust, bursts)
    state.particles.forEach((pt, idx) => {
      pt.x += pt.vx * 0.016;
      pt.y += pt.vy * 0.016;
      pt.life += 0.016;
      pt.alpha = Math.max(0, 1 - pt.life / pt.maxLife);

      if (pt.life >= pt.maxLife) {
        state.particles.splice(idx, 1);
        return;
      }

      ctx.fillStyle = pt.color;
      ctx.globalAlpha = pt.alpha;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    ctx.restore(); // Restore camera translation

    // 9. Low-occlusion progress tracker at the bottom
    ctx.save();
    const trailWidth = 240;
    const trailX = (viewportWidth - trailWidth) / 2;
    const trailY = viewportHeight - 20;

    // Track line
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.beginPath();
    ctx.roundRect(trailX, trailY - 4, trailWidth, 8, 4);
    ctx.fill();

    // Progress bar
    const progress = Math.min(1, Math.max(0, p.x / state.worldLength));
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.roundRect(trailX, trailY - 4, trailWidth * progress, 8, 4);
    ctx.fill();

    // Checkpoint markers on progress bar
    state.altars.forEach(altar => {
      const markerX = trailX + (altar.x / state.worldLength) * trailWidth;
      ctx.fillStyle = altar.cleared ? '#34d399' : '#94a3b8';
      ctx.beginPath();
      ctx.arc(markerX, trailY, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Player marker
    const markerX = trailX + progress * trailWidth;
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(markerX, trailY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // Touch control handlers
  const handleTouchStart = (action: 'left' | 'right' | 'jump') => {
    const state = gameStateRef.current;
    if (action === 'left') state.heldKeys.left = true;
    if (action === 'right') state.heldKeys.right = true;
    if (action === 'jump') {
      state.heldKeys.jump = true;
      state.player.jumpBuffer = 0.15;
    }
  };

  const handleTouchEnd = (action: 'left' | 'right' | 'jump') => {
    const state = gameStateRef.current;
    if (action === 'left') state.heldKeys.left = false;
    if (action === 'right') state.heldKeys.right = false;
    if (action === 'jump') state.heldKeys.jump = false;
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden select-none bg-slate-950">
      <canvas ref={canvasRef} className="block w-full h-full touch-none" />

      {/* On-screen touch controls for tablets and mobile */}
      {isMobileControlsVisible && !isPuzzleActive && (
        <div className="absolute bottom-6 left-0 right-0 px-6 flex items-center justify-between pointer-events-none z-20">
          {/* Directional Pad */}
          <div className="flex items-center gap-3 pointer-events-auto">
            <button
              onPointerDown={() => handleTouchStart('left')}
              onPointerUp={() => handleTouchEnd('left')}
              onPointerCancel={() => handleTouchEnd('left')}
              className="w-14 h-14 rounded-2xl bg-slate-900/80 border-2 border-emerald-500/40 text-emerald-300 flex items-center justify-center active:scale-90 active:bg-emerald-950 transition-transform shadow-lg backdrop-blur-md"
              aria-label="Gerak Kiri"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <button
              onPointerDown={() => handleTouchStart('right')}
              onPointerUp={() => handleTouchEnd('right')}
              onPointerCancel={() => handleTouchEnd('right')}
              className="w-14 h-14 rounded-2xl bg-slate-900/80 border-2 border-emerald-500/40 text-emerald-300 flex items-center justify-center active:scale-90 active:bg-emerald-950 transition-transform shadow-lg backdrop-blur-md"
              aria-label="Gerak Kanan"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>

          {/* Jump Button */}
          <div className="pointer-events-auto">
            <button
              onPointerDown={() => handleTouchStart('jump')}
              onPointerUp={() => handleTouchEnd('jump')}
              onPointerCancel={() => handleTouchEnd('jump')}
              className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-600 to-amber-400 border-2 border-amber-300 text-slate-950 font-black flex items-center justify-center active:scale-90 shadow-xl transition-transform"
              aria-label="Lompat"
            >
              <ArrowUp className="w-8 h-8" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
