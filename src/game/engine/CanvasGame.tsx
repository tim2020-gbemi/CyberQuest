import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SectorId, CharacterSkin } from '../types';
import { sound } from '../audio';
import { voice } from '../speech';
import { InputManager } from './InputManager';
import { SECTORS } from '../data/curriculum';
import { 
  Heart, 
  Shield, 
  Zap, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Volume1,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  Mic,
  MicOff
} from 'lucide-react';

interface CanvasGameProps {
  sectorId: SectorId;
  character: CharacterSkin;
  onExit: () => void;
  onPause: () => void;
  onComplete: (score: number, stars: number) => void;
  onGameOver: (score: number, reason?: string) => void;
  onOpenQuiz: () => void;
}


interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  vy: number;
  alpha: number;
  color: string;
}

export const CanvasGame: React.FC<CanvasGameProps> = ({
  sectorId,
  character,
  onExit,
  onPause,
  onComplete,
  onGameOver,
  onOpenQuiz,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<InputManager>(new InputManager());

  // Game state held in refs for 60fps simulation
  const sectorMeta = SECTORS.find(s => s.id === sectorId) || SECTORS[0];

  // UI state updated conservatively so React doesn't re-render 60fps
  const [hudScore, setHudScore] = useState(0);
  const [hudHealth, setHudHealth] = useState(3);
  const [hudObjective, setHudObjective] = useState('');
  const [hudProgress, setHudProgress] = useState(0);
  const [isSoundMuted, setIsSoundMuted] = useState(sound.getIsMuted());
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(voice.isVoiceEnabled());
  const [tipMessage, setTipMessage] = useState<string | null>(null);

  // Simulation references
  const gameStateRef = useRef({
    score: 0,
    health: 3,
    maxHealth: 3,
    objective: '',
    progress: 0,
    cameraX: 0,
    cameraY: 0,
    cameraShake: 0,
    hitstop: 0,
    time: 0,
    isComplete: false,
    isOver: false,
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    nextTextId: 1,

    // Player state
    player: {
      x: 80,
      y: 350,
      vx: 0,
      vy: 0,
      width: 36,
      height: 48,
      grounded: false,
      coyoteTime: 0,
      jumpBuffer: 0,
      facing: 1 as 1 | -1,
      shieldActive: false,
      shieldTimer: 0,
      invulnerableTimer: 0,
      squash: 1,
      stretch: 1,
    },

    // Sector-specific game objects
    sectorData: {
      // Sector 1: Hardware pieces to collect in order
      s1: {
        collectedCpu: false,
        collectedRam: false,
        collectedSsd: false,
        collectedInput: false,
        collectedOutput: false,
        powerRestored: false,
        items: [
          { type: 'cpu', label: 'CPU (The Brain)', x: 420, y: 320, collected: false, color: '#06b6d4' },
          { type: 'ram', label: 'RAM (Fast Memory)', x: 920, y: 240, collected: false, color: '#3b82f6' },
          { type: 'ssd', label: 'Storage (Long-term Vault)', x: 1480, y: 280, collected: false, color: '#8b5cf6' },
          { type: 'io', label: 'Input/Output Hub', x: 2050, y: 320, collected: false, color: '#10b981' },
          { type: 'core', label: 'Motherboard Core (Finish)', x: 2600, y: 310, collected: false, color: '#f59e0b' },
        ],
        platforms: [
          { x: 0, y: 460, w: 600, h: 50 },
          { x: 680, y: 400, w: 400, h: 40 },
          { x: 850, y: 300, w: 200, h: 30 },
          { x: 1180, y: 440, w: 500, h: 50 },
          { x: 1400, y: 340, w: 220, h: 30 },
          { x: 1780, y: 420, w: 400, h: 40 },
          { x: 1980, y: 360, w: 220, h: 30 },
          { x: 2300, y: 450, w: 600, h: 60 },
        ],
        hazards: [
          { x: 620, y: 480, w: 50, h: 20, type: 'dust' },
          { x: 1100, y: 480, w: 70, h: 20, type: 'dust' },
          { x: 1700, y: 480, w: 70, h: 20, type: 'spark' },
          { x: 2200, y: 480, w: 90, h: 20, type: 'dust' },
        ],
        dataBits: [
          { x: 240, y: 410, taken: false },
          { x: 300, y: 410, taken: false },
          { x: 740, y: 350, taken: false },
          { x: 800, y: 350, taken: false },
          { x: 1260, y: 390, taken: false },
          { x: 1320, y: 390, taken: false },
          { x: 1840, y: 370, taken: false },
          { x: 1900, y: 370, taken: false },
          { x: 2450, y: 400, taken: false },
          { x: 2510, y: 400, taken: false },
        ]
      },

      // Sector 2: Algorithm logic runner & puzzle nodes
      s2: {
        currentNode: 0,
        nodes: [
          { id: 1, label: '1. Step: Receive Input', x: 350, y: 300, solved: false, codeTip: 'Algorithms start with inputs like mouse clicks or sensor data.' },
          { id: 2, label: '2. Step: Process & Loop', x: 850, y: 220, solved: false, codeTip: 'Computers repeat steps in loops millions of times without tiring.' },
          { id: 3, label: '3. Step: Creative Output', x: 1400, y: 280, solved: false, codeTip: 'Software turns algorithms into art, music, 3D games, and animations!' },
          { id: 4, label: '4. Step: Autonomous Launch', x: 1950, y: 240, solved: false, codeTip: 'Robots and spacecraft use algorithms to steer safely in deep space.' },
          { id: 5, label: 'Matrix Gateway (Complete)', x: 2500, y: 320, solved: false, codeTip: 'You have mastered the algorithmic core of software!' },
        ],
        platforms: [
          { x: 0, y: 450, w: 550, h: 50 },
          { x: 620, y: 380, w: 420, h: 40 },
          { x: 1120, y: 420, w: 480, h: 40 },
          { x: 1680, y: 360, w: 450, h: 40 },
          { x: 2220, y: 440, w: 550, h: 50 },
        ],
        codeCubes: [
          { x: 200, y: 400, collected: false },
          { x: 720, y: 330, collected: false },
          { x: 1240, y: 370, collected: false },
          { x: 1800, y: 310, collected: false },
        ]
      },

      // Sector 3: Cyber Highway Defender (Horizontal scrolling data highway)
      s3: {
        highwaySpeed: 180,
        distanceTraveled: 0,
        targetDistance: 3200,
        laneY: 340,
        projectiles: [] as Array<{ x: number; y: number; vx: number; radius: number }>,
        incomingOrbs: [
          { id: 1, x: 700, y: 280, type: 'safe', label: 'https://kids-science.org (Safe HTTPS)', speed: 140, hit: false },
          { id: 2, x: 1050, y: 380, type: 'phish', label: 'WIN FREE ROBUX CLICK! (Scam)', speed: 170, hit: false },
          { id: 3, x: 1450, y: 260, type: 'safe', label: 'https://school-library.edu (Secure)', speed: 150, hit: false },
          { id: 4, x: 1850, y: 360, type: 'danger', label: 'GIVE HOME ADDRESS! (Danger)', speed: 180, hit: false },
          { id: 5, x: 2250, y: 300, type: 'phish', label: 'CLAIM $1,000 GIFT CARD! (Fake)', speed: 190, hit: false },
          { id: 6, x: 2650, y: 260, type: 'safe', label: 'https://nasa.gov/kids (Official)', speed: 160, hit: false },
          { id: 7, x: 3000, y: 360, type: 'safe', label: 'https://cyber-citadel.org (Goal)', speed: 150, hit: false },
        ],
        malwareBots: [
          { id: 1, x: 1200, y: 320, hp: 2, active: true },
          { id: 2, x: 2000, y: 320, hp: 2, active: true },
          { id: 3, x: 2750, y: 320, hp: 3, active: true },
        ]
      },

      // Sector 4: Digital Citizen Village & Netiquette Garden
      s4: {
        encountersDone: 0,
        targetEncounters: 3,
        encounters: [
          {
            id: 1,
            x: 550,
            y: 350,
            npc: 'Pip the Bunny',
            problem: 'Someone is teasing me in the school group chat...',
            options: [
              { text: 'Be an Upstander: support Pip & report to teacher', correct: true, feedback: 'Wonderful! You stood up for a classmate and stopped cyberbullying.' },
              { text: 'Laugh and ignore it', correct: false, feedback: 'Ignoring cruelty lets cyberbullies hurt others. Always support your friends!' },
            ],
            resolved: false,
          },
          {
            id: 2,
            x: 1250,
            y: 350,
            npc: 'Bobi the Panda',
            problem: 'I have played video games for 6 hours straight. My eyes sting!',
            options: [
              { text: 'Take a break! Go outside, stretch, and rest your eyes', correct: true, feedback: 'Spot on! Balancing screen time keeps your body and eyes energized.' },
              { text: 'Put on sunglasses and play for 4 more hours', correct: false, feedback: 'Your body needs real exercise, sunshine, and offline sleep!' },
            ],
            resolved: false,
          },
          {
            id: 3,
            x: 1950,
            y: 350,
            npc: 'Foxy the Scout',
            problem: 'Look at this viral rumor! Should I immediately send it to everyone?',
            options: [
              { text: 'Wait! Fact-check with trusted sources first', correct: true, feedback: 'Excellent wisdom! Checking facts prevents the spread of fake news.' },
              { text: 'Share it immediately to get likes', correct: false, feedback: 'Never spread unverified rumors. Think before you share!' },
            ],
            resolved: false,
          },
        ],
        goldenLeaves: [
          { x: 300, y: 370, collected: false },
          { x: 850, y: 370, collected: false },
          { x: 1550, y: 370, collected: false },
          { x: 2300, y: 370, collected: false },
        ],
        platforms: [
          { x: 0, y: 440, w: 2600, h: 60 },
          { x: 700, y: 340, w: 200, h: 25 },
          { x: 1400, y: 340, w: 200, h: 25 },
        ]
      }
    }
  });

  // Spawn floating feedback text
  const addFloatingText = useCallback((text: string, x: number, y: number, color = '#38bdf8') => {
    const s = gameStateRef.current;
    s.floatingTexts.push({
      id: s.nextTextId++,
      text,
      x,
      y,
      vy: -1.4,
      alpha: 1,
      color,
    });
  }, []);

  // Spawn burst of particles
  const spawnParticles = useCallback((x: number, y: number, count: number, color: string) => {
    const s = gameStateRef.current;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1;
      s.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        color,
        alpha: 1,
        life: 0,
        maxLife: Math.random() * 25 + 20,
      });
    }
  }, []);

  // Trigger brief simulation hitstop and camera shake for game feel
  const triggerImpact = useCallback((durationMs: number = 50, shake: number = 8) => {
    const s = gameStateRef.current;
    s.hitstop = durationMs / 1000;
    s.cameraShake = shake;
  }, []);

  // Handle Encounter Dialog Choice (Sector 4)
  const handleEncounterChoice = useCallback((encounterId: number, isCorrect: boolean, feedback: string) => {
    const s = gameStateRef.current;
    const enc = s.sectorData.s4.encounters.find(e => e.id === encounterId);
    if (!enc || enc.resolved) return;

    enc.resolved = true;
    if (isCorrect) {
      sound.playSuccess();
      s.score += 300;
      s.sectorData.s4.encountersDone++;
      spawnParticles(enc.x, enc.y - 30, 20, '#10b981');
      addFloatingText('+300 Kind Citizen!', enc.x, enc.y - 40, '#10b981');
      setTipMessage(`✨ ${feedback}`);

      // Voice explanation based on encounter
      if (encounterId === 1) voice.explainUpstander();
      else if (encounterId === 2) voice.explainScreenTime();
      else if (encounterId === 3) voice.explainFactCheck();
    } else {
      sound.playError();
      s.health = Math.max(1, s.health - 1);
      triggerImpact(80, 10);
      spawnParticles(enc.x, enc.y - 30, 12, '#ef4444');
      addFloatingText('Oops! Try again next time', enc.x, enc.y - 40, '#f87171');
      setTipMessage(`💡 Lesson: ${feedback}`);
      voice.speak(feedback);
    }


    setTimeout(() => {
      setTipMessage(null);
    }, 4500);

    // Check completion for Sector 4
    if (s.sectorData.s4.encountersDone >= s.sectorData.s4.targetEncounters) {
      setTimeout(() => {
        sound.playVictory();
        s.isComplete = true;
        onComplete(s.score, 3);
      }, 1200);
    }
  }, [addFloatingText, onComplete, spawnParticles, triggerImpact]);

  // Main 60fps Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const input = inputRef.current;
    input.attach();

    // Set initial objective
    const sim = gameStateRef.current;
    if (sectorId === 'sector_1') {
      sim.objective = 'Collect CPU, RAM, and Storage to activate the Motherboard!';
    } else if (sectorId === 'sector_2') {
      sim.objective = 'Program the Algorithm nodes and discover computer capabilities!';
    } else if (sectorId === 'sector_3') {
      sim.objective = 'Deflect Phishing hooks with Space (Shield), blast Malware with F/X!';
    } else if (sectorId === 'sector_4') {
      sim.objective = 'Help the cyber villagers and leave a glowing, kind digital footprint!';
    }

    let animationFrameId: number;
    let lastTime = performance.now();

    // High DPI Canvas resize handler
    const resizeCanvas = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Audio start on user interaction
    sound.startMusic();

    const loop = (currentTime: number) => {
      const rawDt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      const dt = Math.min(rawDt, 0.05); // Clamp dt to prevent tunneling on frame hitch

      const s = gameStateRef.current;
      s.time += dt;

      // Handle pause key
      if (input.isJustPressed('pause')) {
        sound.playClick();
        onPause();
      }

      // Check hitstop
      if (s.hitstop > 0) {
        s.hitstop -= dt;
      } else if (!s.isComplete && !s.isOver) {
        // === 1. SIMULATION TICK ===
        const p = s.player;

        // Invulnerability timer decay
        if (p.invulnerableTimer > 0) {
          p.invulnerableTimer -= dt;
        }

        // Shield logic (Space bar)
        if (input.isHeld('action')) {
          if (!p.shieldActive && (sectorId === 'sector_3' || sectorId === 'sector_1')) {
            sound.playShield();
            spawnParticles(p.x + p.width / 2, p.y + p.height / 2, 6, '#38bdf8');
          }
          p.shieldActive = true;
          p.shieldTimer += dt;
        } else {
          p.shieldActive = false;
          p.shieldTimer = 0;
        }

        // Laser / Firewall blaster (Sector 3)
        if (sectorId === 'sector_3' && input.isJustPressed('laser')) {
          sound.playLaser();
          s.sectorData.s3.projectiles.push({
            x: p.x + p.width + 10,
            y: p.y + p.height / 2,
            vx: 550,
            radius: 5,
          });
          spawnParticles(p.x + p.width, p.y + p.height / 2, 8, '#f59e0b');
        }

        // Sector 3 has free vertical + horizontal flight movement along the data highway
        if (sectorId === 'sector_3') {
          const moveSpeed = 320;
          p.vx = 0;
          p.vy = 0;
          if (input.isHeld('left')) p.vx = -moveSpeed * 0.7;
          if (input.isHeld('right')) p.vx = moveSpeed;
          if (input.isHeld('up')) p.vy = -moveSpeed;
          if (input.isHeld('down')) p.vy = moveSpeed;

          p.x += p.vx * dt;
          p.y += p.vy * dt;

          // Clamping bounds
          p.x = Math.max(40, Math.min(p.x, 700));
          p.y = Math.max(120, Math.min(p.y, 480));

          // Highway progression
          const s3 = s.sectorData.s3;
          s3.distanceTraveled += s3.highwaySpeed * dt;
          s.cameraX = s3.distanceTraveled;

          // Update projectiles
          for (let i = s3.projectiles.length - 1; i >= 0; i--) {
            const proj = s3.projectiles[i];
            proj.x += proj.vx * dt;

            // Check collision with malware bots
            for (const bot of s3.malwareBots) {
              if (bot.active && Math.abs(proj.x - (bot.x - s.cameraX + 400)) < 30 && Math.abs(proj.y - bot.y) < 30) {
                bot.hp--;
                s3.projectiles.splice(i, 1);
                sound.playHit();
                spawnParticles(proj.x, proj.y, 14, '#ef4444');
                addFloatingText('-1 Virus!', proj.x, proj.y - 10, '#ef4444');
                if (bot.hp <= 0) {
                  bot.active = false;
                  s.score += 250;
                  sound.playSuccess();
                  spawnParticles(proj.x, proj.y, 25, '#f59e0b');
                  addFloatingText('+250 Malware Neutralized!', proj.x, proj.y - 25, '#10b981');
                }
                break;
              }
            }

            if (proj.x > 1200) {
              s3.projectiles.splice(i, 1);
            }
          }

          // Check Orbs encounters
          for (const orb of s3.incomingOrbs) {
            if (orb.hit) continue;
            const screenOrbX = orb.x - s.cameraX + 400;
            const dist = Math.hypot(p.x + p.width / 2 - screenOrbX, p.y + p.height / 2 - orb.y);

            if (dist < 38) {
              orb.hit = true;
              if (orb.type === 'safe') {
                sound.playCollect();
                s.score += 150;
                voice.explainSafeSite();
                spawnParticles(screenOrbX, orb.y, 15, '#10b981');
                addFloatingText('+150 Safe HTTPS Site!', screenOrbX, orb.y - 20, '#10b981');
              } else if (p.shieldActive) {
                // Blocked with shield!
                sound.playSuccess();
                s.score += 200;
                voice.explainPhishBlocked();
                triggerImpact(40, 6);
                spawnParticles(screenOrbX, orb.y, 18, '#38bdf8');
                addFloatingText('+200 Phish Blocked by Shield!', screenOrbX, orb.y - 20, '#38bdf8');
              } else if (p.invulnerableTimer <= 0) {
                // Hit by scam/danger without shield!
                sound.playError();
                s.health--;
                p.invulnerableTimer = 1.5;
                voice.explainPhishCaught();
                triggerImpact(70, 10);
                spawnParticles(screenOrbX, orb.y, 18, '#ef4444');
                addFloatingText('Phishing Trap Caught!', screenOrbX, orb.y - 20, '#ef4444');
                setTipMessage('⚠️ Cyber Tip: Strangers and scams promise free items to steal passwords. Always shield your private info!');
                setTimeout(() => setTipMessage(null), 4000);

                if (s.health <= 0) {
                  s.isOver = true;
                  onGameOver(s.score, "Byte ran out of shields! Game Over - Let's start again!");
                  return;
                }
              }

            }
          }

          // Check win condition for sector 3
          if (s3.distanceTraveled >= s3.targetDistance && !s.isComplete) {
            s.isComplete = true;
            sound.playVictory();
            onComplete(s.score, 3);
          }

        } else {
          // Standard Platformer Physics for Sector 1, 2, 4
          const gravity = 1100;
          const walkSpeed = 260;
          const jumpSpeed = -540;

          // Horizontal movement
          if (input.isHeld('left')) {
            p.vx = -walkSpeed;
            p.facing = -1;
          } else if (input.isHeld('right')) {
            p.vx = walkSpeed;
            p.facing = 1;
          } else {
            p.vx *= 0.75;
          }

          // Jump buffering & Coyote time
          if (p.grounded) {
            p.coyoteTime = 0.12;
          } else {
            p.coyoteTime = Math.max(0, p.coyoteTime - dt);
          }

          if (input.isJustPressed('action') || input.isJustPressed('up')) {
            p.jumpBuffer = 0.15;
          } else {
            p.jumpBuffer = Math.max(0, p.jumpBuffer - dt);
          }

          if (p.jumpBuffer > 0 && p.coyoteTime > 0) {
            p.vy = jumpSpeed;
            p.grounded = false;
            p.coyoteTime = 0;
            p.jumpBuffer = 0;
            p.squash = 0.8;
            p.stretch = 1.25;
            sound.playJump();
            spawnParticles(p.x + p.width / 2, p.y + p.height, 8, character.secondaryColor);
          }

          // Apply gravity
          p.vy += gravity * dt;

          // Move player
          p.x += p.vx * dt;
          p.y += p.vy * dt;

          // Restore squash and stretch
          p.squash += (1 - p.squash) * dt * 10;
          p.stretch += (1 - p.stretch) * dt * 10;

          // Collision with platforms
          p.grounded = false;
          let activePlatforms: Array<{ x: number; y: number; w: number; h: number }> = [];
          if (sectorId === 'sector_1') activePlatforms = s.sectorData.s1.platforms;
          if (sectorId === 'sector_2') activePlatforms = s.sectorData.s2.platforms;
          if (sectorId === 'sector_4') activePlatforms = s.sectorData.s4.platforms;

          for (const plat of activePlatforms) {
            if (
              p.x + p.width > plat.x &&
              p.x < plat.x + plat.w &&
              p.y + p.height >= plat.y &&
              p.y + p.height <= plat.y + plat.h + 16 &&
              p.vy >= 0
            ) {
              p.y = plat.y - p.height;
              p.vy = 0;
              p.grounded = true;
              break;
            }
          }

          // Pit Fall Check: If robot falls off platforms into the abyss / glitch pit
          if (p.y > 510 && !s.isOver && !s.isComplete) {
            s.isOver = true;
            s.health = 0;
            sound.playHit();
            triggerImpact(100, 15);
            voice.explainRobotFell();
            spawnParticles(p.x + p.width / 2, p.y, 25, '#ef4444');
            addFloatingText('Glitch Pit Fall! Game Over!', p.x, p.y - 30, '#ef4444');
            setTimeout(() => {
              onGameOver(s.score, "Byte fell into the glitch pit! Game Over - Let's start again!");
            }, 600);
            return;
          }

          // Sector 1: Collect hardware components & data bits
          if (sectorId === 'sector_1') {
            const s1 = s.sectorData.s1;

            // Data bits
            for (const bit of s1.dataBits) {
              if (!bit.taken && Math.hypot(p.x - bit.x, p.y - bit.y) < 32) {
                bit.taken = true;
                sound.playCollect();
                s.score += 50;
                spawnParticles(bit.x, bit.y, 8, '#38bdf8');
                addFloatingText('+50 Data Bit', bit.x, bit.y - 10, '#38bdf8');
              }
            }

            // Hazards (dust bunnies / rogue sparks)
            for (const haz of s1.hazards) {
              if (
                p.x + p.width > haz.x &&
                p.x < haz.x + haz.w &&
                p.y + p.height > haz.y &&
                p.y < haz.y + haz.h
              ) {
                if (p.invulnerableTimer <= 0) {
                  sound.playHit();
                  s.health--;
                  p.invulnerableTimer = 1.4;
                  p.vy = -350;
                  triggerImpact(60, 8);
                  spawnParticles(p.x, p.y, 16, '#f87171');
                  addFloatingText('Glitch Bump!', p.x, p.y - 15, '#ef4444');
                  if (s.health <= 0) {
                    s.isOver = true;
                    voice.speak("Game Over! Byte ran out of energy. Let's start again!");
                    onGameOver(s.score, "Byte ran out of shields! Game Over - Let's start again!");
                    return;
                  }
                }
              }
            }

            // Items in Sector 1 (CPU, RAM, SSD, I/O Hub, Core)
            for (const item of s1.items) {
              if (!item.collected && Math.hypot(p.x + p.width / 2 - item.x, p.y + p.height / 2 - item.y) < 45) {
                item.collected = true;
                sound.playSuccess();
                s.score += 250;
                spawnParticles(item.x, item.y, 25, item.color);
                addFloatingText(`+250 Found ${item.label}!`, item.x, item.y - 30, item.color);

                if (item.type === 'cpu') {
                  s1.collectedCpu = true;
                  setTipMessage('💡 CPU installed: The brain is running! It calculates instructions at billions of times a second.');
                  voice.explainCpu();
                } else if (item.type === 'ram') {
                  s1.collectedRam = true;
                  setTipMessage('💡 RAM active: Fast working memory desk! Holds apps open right now.');
                  voice.explainRam();
                } else if (item.type === 'ssd') {
                  s1.collectedSsd = true;
                  setTipMessage('💡 SSD Storage locked in: Permanent library vault! Keeps files safe when turned off.');
                  voice.explainSsd();
                } else if (item.type === 'io') {
                  s1.collectedInput = true;
                  s1.collectedOutput = true;
                  setTipMessage('💡 Input/Output ports online: Mouse, keyboard, and screen connected!');
                  voice.explainIO();
                } else if (item.type === 'core') {
                  // Final motherboard core
                  s1.powerRestored = true;
                  s.isComplete = true;
                  sound.playVictory();
                  voice.explainMotherboard();
                  setTimeout(() => {
                    onComplete(s.score, 3);
                  }, 1200);
                }
              }
            }
          }

          // Sector 2: Algorithm logic runner & code nodes
          if (sectorId === 'sector_2') {
            const s2 = s.sectorData.s2;

            // Code cubes
            for (const cube of s2.codeCubes) {
              if (!cube.collected && Math.hypot(p.x - cube.x, p.y - cube.y) < 32) {
                cube.collected = true;
                sound.playCollect();
                s.score += 75;
                spawnParticles(cube.x, cube.y, 10, '#10b981');
                addFloatingText('+75 Logic Byte', cube.x, cube.y - 10, '#10b981');
              }
            }

            // Algorithm step nodes
            for (const node of s2.nodes) {
              if (!node.solved && Math.hypot(p.x + p.width / 2 - node.x, p.y + p.height / 2 - node.y) < 45) {
                node.solved = true;
                sound.playSuccess();
                s.score += 200;
                spawnParticles(node.x, node.y, 20, '#10b981');
                addFloatingText(`+200 Algorithmic Step ${node.id}!`, node.x, node.y - 30, '#10b981');
                setTipMessage(`✨ Algorithm Rule: ${node.codeTip}`);
                voice.explainAlgorithm(node.codeTip);

                if (node.id === 5) {
                  s.isComplete = true;
                  sound.playVictory();
                  setTimeout(() => {
                    onComplete(s.score, 3);
                  }, 1200);
                }
              }
            }
          }


          // Sector 4: Digital Citizen Golden Leaves
          if (sectorId === 'sector_4') {
            const s4 = s.sectorData.s4;
            for (const leaf of s4.goldenLeaves) {
              if (!leaf.collected && Math.hypot(p.x - leaf.x, p.y - leaf.y) < 34) {
                leaf.collected = true;
                sound.playCollect();
                s.score += 60;
                spawnParticles(leaf.x, leaf.y, 12, '#fbbf24');
                addFloatingText('+60 Golden Footprint', leaf.x, leaf.y - 10, '#fbbf24');
              }
            }
          }

          // Smooth Camera tracking
          const targetCamX = p.x - 300;
          s.cameraX += (targetCamX - s.cameraX) * dt * 5;
          s.cameraX = Math.max(0, s.cameraX);
        }

        // Camera shake decay
        if (s.cameraShake > 0) {
          s.cameraShake -= dt * 20;
          if (s.cameraShake < 0) s.cameraShake = 0;
        }

        // Update particles
        for (let i = s.particles.length - 1; i >= 0; i--) {
          const pt = s.particles[i];
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.life++;
          pt.alpha = 1 - pt.life / pt.maxLife;
          if (pt.life >= pt.maxLife) {
            s.particles.splice(i, 1);
          }
        }

        // Update floating texts
        for (let i = s.floatingTexts.length - 1; i >= 0; i--) {
          const ft = s.floatingTexts[i];
          ft.y += ft.vy;
          ft.alpha -= dt * 0.9;
          if (ft.alpha <= 0) {
            s.floatingTexts.splice(i, 1);
          }
        }

        // Periodic conservative React HUD update (every 100ms)
        if (Math.floor(s.time * 10) % 2 === 0) {
          setHudScore(s.score);
          setHudHealth(s.health);
        }
      }

      // === 2. CANVAS RENDERING ===
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      ctx.save();
      // Apply camera shake
      const shakeOffsetX = (Math.random() - 0.5) * s.cameraShake;
      const shakeOffsetY = (Math.random() - 0.5) * s.cameraShake;
      ctx.translate(shakeOffsetX, shakeOffsetY);

      // Clear background with rich atmospheric cyber gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (sectorId === 'sector_1') {
        bgGrad.addColorStop(0, '#020617');
        bgGrad.addColorStop(0.5, '#082f49');
        bgGrad.addColorStop(1, '#0369a1');
      } else if (sectorId === 'sector_2') {
        bgGrad.addColorStop(0, '#022c22');
        bgGrad.addColorStop(0.5, '#064e3b');
        bgGrad.addColorStop(1, '#065f46');
      } else if (sectorId === 'sector_3') {
        bgGrad.addColorStop(0, '#1e1b4b');
        bgGrad.addColorStop(0.5, '#312e81');
        bgGrad.addColorStop(1, '#4338ca');
      } else {
        bgGrad.addColorStop(0, '#18181b');
        bgGrad.addColorStop(0.5, '#2e1065');
        bgGrad.addColorStop(1, '#4c1d95');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw background cyber grid & neon circuit traces
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      const gridShiftX = -(s.cameraX % gridSize);
      for (let x = gridShiftX; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Motherboard traces / neon data highway lines
      ctx.strokeStyle = sectorMeta.accentColor + '33';
      ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        const lineY = 140 + i * 60;
        ctx.beginPath();
        ctx.moveTo(0, lineY);
        ctx.lineTo(width, lineY);
        ctx.stroke();
      }
      ctx.restore();

      // Camera transformation
      ctx.save();
      ctx.translate(-s.cameraX, 0);

      // Render Sector 1 specific objects
      if (sectorId === 'sector_1') {
        const s1 = s.sectorData.s1;

        // Platforms (Motherboard green/cyan PCBs)
        for (const plat of s1.platforms) {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(plat.x, plat.y, plat.w, plat.h);

          // Neon glowing top edge
          ctx.fillStyle = '#06b6d4';
          ctx.fillRect(plat.x, plat.y, plat.w, 4);

          // Circuit pins pattern
          ctx.fillStyle = '#38bdf8';
          for (let px = plat.x + 10; px < plat.x + plat.w - 10; px += 24) {
            ctx.fillRect(px, plat.y + 8, 4, 10);
          }
        }

        // Hazards (Glitch sparks & dust)
        for (const haz of s1.hazards) {
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(haz.x, haz.y, haz.w, haz.h);
          ctx.fillStyle = '#fca5a5';
          ctx.font = '10px monospace';
          ctx.fillText('⚡ GLITCH', haz.x + 4, haz.y + 14);
        }

        // Data bits
        for (const bit of s1.dataBits) {
          if (!bit.taken) {
            const floatY = bit.y + Math.sin(s.time * 6 + bit.x) * 4;
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(bit.x, floatY, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(bit.x, floatY, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Hardware component sockets / items
        for (const item of s1.items) {
          const itemBobY = item.y + Math.sin(s.time * 4 + item.x) * 6;
          ctx.save();
          ctx.translate(item.x, itemBobY);

          if (!item.collected) {
            // Glowing pedestal
            ctx.fillStyle = item.color;
            ctx.shadowColor = item.color;
            ctx.shadowBlur = 15;
            ctx.fillRect(-22, -22, 44, 44);
            ctx.shadowBlur = 0;

            // Inner chip detail
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(-18, -18, 36, 36);

            // Label icon
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 11px Outfit, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(item.type.toUpperCase(), 0, 4);

            // Floating title tag
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.fillRect(-60, -42, 120, 18);
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px Outfit, sans-serif';
            ctx.fillText(item.label, 0, -30);
          } else {
            // Already collected checkmark
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 3;
            ctx.strokeRect(-16, -16, 32, 32);
            ctx.fillStyle = '#10b981';
            ctx.font = 'bold 14px Outfit, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('✓', 0, 5);
          }
          ctx.restore();
        }
      }

      // Render Sector 2 specific objects
      if (sectorId === 'sector_2') {
        const s2 = s.sectorData.s2;

        // Platforms (Matrix emerald circuits)
        for (const plat of s2.platforms) {
          ctx.fillStyle = '#064e3b';
          ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
          ctx.fillStyle = '#10b981';
          ctx.fillRect(plat.x, plat.y, plat.w, 4);
        }

        // Code cubes
        for (const cube of s2.codeCubes) {
          if (!cube.collected) {
            const cy = cube.y + Math.sin(s.time * 5 + cube.x) * 4;
            ctx.fillStyle = '#10b981';
            ctx.fillRect(cube.x - 7, cy - 7, 14, 14);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 8px monospace';
            ctx.fillText('01', cube.x - 5, cy + 3);
          }
        }

        // Algorithm step nodes
        for (const node of s2.nodes) {
          const ny = node.y + Math.sin(s.time * 3 + node.x) * 5;
          ctx.save();
          ctx.translate(node.x, ny);

          ctx.fillStyle = node.solved ? '#10b981' : '#34d399';
          ctx.beginPath();
          ctx.arc(0, 0, 22, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#022c22';
          ctx.beginPath();
          ctx.arc(0, 0, 17, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(node.solved ? '✓' : String(node.id), 0, 4);

          // Node label banner
          ctx.fillStyle = 'rgba(2, 44, 34, 0.9)';
          ctx.fillRect(-70, -38, 140, 20);
          ctx.fillStyle = '#6ee7b7';
          ctx.font = '10px Outfit, sans-serif';
          ctx.fillText(node.label, 0, -24);

          ctx.restore();
        }
      }

      // Render Sector 3 specific objects (Cyber Highway)
      if (sectorId === 'sector_3') {
        const s3 = s.sectorData.s3;

        // Highway data conduits
        ctx.strokeStyle = 'rgba(129, 140, 248, 0.3)';
        ctx.lineWidth = 3;
        for (let i = 0; i < 5; i++) {
          const laneY = 160 + i * 70;
          ctx.beginPath();
          ctx.moveTo(s.cameraX - 100, laneY);
          ctx.lineTo(s.cameraX + 1000, laneY);
          ctx.stroke();
        }

        // Incoming Orbs
        for (const orb of s3.incomingOrbs) {
          if (!orb.hit) {
            const ox = orb.x;
            const oy = orb.y;

            ctx.save();
            ctx.translate(ox, oy);

            const isSafe = orb.type === 'safe';
            const orbColor = isSafe ? '#10b981' : '#ef4444';

            // Pulsing aura
            ctx.fillStyle = orbColor;
            ctx.beginPath();
            ctx.arc(0, 0, 18, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(0, 0, 14, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(isSafe ? '🔒' : '⚠️', 0, 4);

            // Orb URL/Message pill
            ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
            ctx.fillRect(-90, -32, 180, 18);
            ctx.fillStyle = isSafe ? '#86efac' : '#fca5a5';
            ctx.font = '10px Outfit, sans-serif';
            ctx.fillText(orb.label, 0, -20);

            ctx.restore();
          }
        }

        // Malware Bots
        for (const bot of s3.malwareBots) {
          if (bot.active) {
            ctx.save();
            ctx.translate(bot.x, bot.y);

            // Red spikey malware virus bot
            ctx.fillStyle = '#dc2626';
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, Math.PI * 2);
            ctx.fill();

            // Virus spikes
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 3;
            for (let a = 0; a < 8; a++) {
              const ang = (a * Math.PI) / 4 + s.time * 2;
              ctx.beginPath();
              ctx.moveTo(Math.cos(ang) * 18, Math.sin(ang) * 18);
              ctx.lineTo(Math.cos(ang) * 28, Math.sin(ang) * 28);
              ctx.stroke();
            }

            // Health bar above bot
            ctx.fillStyle = '#450a0a';
            ctx.fillRect(-16, -34, 32, 5);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(-16, -34, (32 * bot.hp) / 3, 5);

            ctx.restore();
          }
        }

        // Projectiles (Blaster shots)
        for (const proj of s3.projectiles) {
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Render Sector 4 specific objects (Digital Citizen Village)
      if (sectorId === 'sector_4') {
        const s4 = s.sectorData.s4;

        // Ground platform
        for (const plat of s4.platforms) {
          ctx.fillStyle = '#2e1065';
          ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
          ctx.fillStyle = '#a855f7';
          ctx.fillRect(plat.x, plat.y, plat.w, 4);
        }

        // Golden leaves
        for (const leaf of s4.goldenLeaves) {
          if (!leaf.collected) {
            const ly = leaf.y + Math.sin(s.time * 4 + leaf.x) * 4;
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(leaf.x, ly, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fef3c7';
            ctx.font = '8px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('★', leaf.x, ly + 3);
          }
        }

        // Village NPC Encounters
        for (const enc of s4.encounters) {
          ctx.save();
          ctx.translate(enc.x, enc.y);

          // NPC Sprite / Beacon
          ctx.fillStyle = enc.resolved ? '#10b981' : '#c084fc';
          ctx.beginPath();
          ctx.arc(0, 0, 18, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#1e1b4b';
          ctx.beginPath();
          ctx.arc(0, 0, 14, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(enc.resolved ? '💖' : '💬', 0, 4);

          // Name tag
          ctx.fillStyle = 'rgba(30, 27, 75, 0.9)';
          ctx.fillRect(-50, -42, 100, 18);
          ctx.fillStyle = '#e9d5ff';
          ctx.font = '10px Outfit, sans-serif';
          ctx.fillText(enc.npc, 0, -30);

          ctx.restore();
        }
      }

      // Render Player Character
      const p = s.player;
      ctx.save();
      ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
      ctx.scale(p.facing * p.squash, p.stretch);

      // Flashing if invulnerable
      if (p.invulnerableTimer <= 0 || Math.floor(s.time * 20) % 2 === 0) {
        // Character Body (Stylized Cyber Robot / Chibi Avatar)
        ctx.fillStyle = character.color;
        // Head / Helmet
        ctx.beginPath();
        ctx.roundRect(-14, -22, 28, 22, [8, 8, 4, 4]);
        ctx.fill();

        // Visor Screen
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(-10, -18, 20, 13, [4, 4, 4, 4]);
        ctx.fill();

        // Glowing Friendly Eyes
        ctx.fillStyle = '#38bdf8';
        const eyeOffset = Math.sin(s.time * 2) * 1;
        ctx.fillRect(-7 + eyeOffset, -14, 4, 5);
        ctx.fillRect(3 + eyeOffset, -14, 4, 5);

        // Antenna / Star topper
        ctx.strokeStyle = character.secondaryColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -22);
        ctx.lineTo(0, -29);
        ctx.stroke();
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, -29, 3, 0, Math.PI * 2);
        ctx.fill();

        // Torso Armor
        ctx.fillStyle = character.secondaryColor;
        ctx.beginPath();
        ctx.roundRect(-11, 0, 22, 18, [3, 3, 3, 3]);
        ctx.fill();

        // Core power badge
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 9, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Legs / Thrusters
        ctx.fillStyle = '#334155';
        ctx.fillRect(-9, 18, 6, 7);
        ctx.fillRect(3, 18, 6, 7);
      }

      // Active Shield Aura if pressed
      if (p.shieldActive) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, 32, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      ctx.restore(); // End player transform

      // Render Particles
      for (const pt of s.particles) {
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = pt.alpha;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Render Floating Text
      for (const ft of s.floatingTexts) {
        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 13px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      ctx.restore(); // End camera transform

      // End frame edge-triggers
      input.endFrame();

      ctx.restore(); // End shake transform

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      input.detach();
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [character, onComplete, onGameOver, onPause, sectorId, sectorMeta, spawnParticles, addFloatingText, triggerImpact]);

  // Touch Virtual Control Handlers
  const handleVirtualDown = (key: 'left' | 'right' | 'up' | 'down' | 'action' | 'laser') => {
    inputRef.current.setVirtualKey(key, true);
  };
  const handleVirtualUp = (key: 'left' | 'right' | 'up' | 'down' | 'action' | 'laser') => {
    inputRef.current.setVirtualKey(key, false);
  };

  const toggleSound = () => {
    const next = !isSoundMuted;
    setIsSoundMuted(next);
    sound.setMute(next);
  };

  // Find active encounter nearby in Sector 4
  const currentSim = gameStateRef.current;
  const p = currentSim.player;
  const activeEncounter = sectorId === 'sector_4'
    ? currentSim.sectorData.s4.encounters.find(e => !e.resolved && Math.abs(p.x - e.x) < 70)
    : null;

  return (
    <div ref={containerRef} className="relative w-full h-full bg-slate-950 overflow-hidden select-none">
      {/* 60fps Isolated Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* World-Matched, Low-Occlusion HUD Overlay (85%+ playfield clear) */}
      <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between z-10">
        {/* Top Status Perimeter Cluster */}
        <div className="flex items-center justify-between gap-4">
          {/* Health & Character Cluster */}
          <div className="flex items-center gap-3 bg-slate-900/85 border border-slate-800 rounded-xl px-3.5 py-2 shadow-lg backdrop-blur-none pointer-events-auto">
            <div className="flex items-center gap-1.5">
              {[...Array(3)].map((_, idx) => (
                <Heart
                  key={idx}
                  className={`w-5 h-5 transition-transform ${
                    idx < hudHealth ? 'text-rose-500 fill-rose-500 scale-100' : 'text-slate-600 scale-90'
                  }`}
                />
              ))}
            </div>
            <div className="h-4 w-px bg-slate-700" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">{character.name}</span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-mono font-bold text-amber-400 tabular-nums">{hudScore.toLocaleString()} pts</span>
            </div>
          </div>

          {/* Center Objective Bar */}
          <div className="hidden md:flex items-center gap-2 bg-slate-900/85 border border-slate-800 rounded-xl px-4 py-2 shadow-lg pointer-events-auto">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-xs font-medium text-slate-200 truncate max-w-md">
              {sectorMeta.title}: {sectorMeta.learningGoal}
            </span>
          </div>

          {/* Quick Actions Cluster */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={onOpenQuiz}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-cyan-300 bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-700/50 rounded-xl shadow-lg transition-colors cursor-pointer"
              title="Open Cyber Quiz"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Quiz</span>
            </button>

            <button
              onClick={toggleSound}
              className="p-2 text-slate-300 hover:text-white bg-slate-900/85 hover:bg-slate-800 border border-slate-800 rounded-xl shadow-lg transition-colors cursor-pointer"
              title={isSoundMuted ? "Unmute Sound" : "Mute Sound"}
            >
              {isSoundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              onClick={() => {
                const next = !isVoiceEnabled;
                setIsVoiceEnabled(next);
                voice.setVoiceEnabled(next);
                if (next) {
                  voice.speak("Voice narration activated!");
                }
              }}
              className="p-2 text-slate-300 hover:text-white bg-slate-900/85 hover:bg-slate-800 border border-slate-800 rounded-xl shadow-lg transition-colors cursor-pointer"
              title={isVoiceEnabled ? "Mute Voice Narration" : "Enable Voice Narration"}
            >
              {isVoiceEnabled ? <Mic className="w-4 h-4 text-cyan-400" /> : <MicOff className="w-4 h-4 text-slate-500" />}
            </button>

            <button
              onClick={onPause}
              className="p-2 text-slate-300 hover:text-white bg-slate-900/85 hover:bg-slate-800 border border-slate-800 rounded-xl shadow-lg transition-colors cursor-pointer"
              title="Pause Game"
            >
              <Pause className="w-4 h-4" />
            </button>

            <button
              onClick={onExit}
              className="p-2 text-slate-300 hover:text-white bg-slate-900/85 hover:bg-slate-800 border border-slate-800 rounded-xl shadow-lg transition-colors cursor-pointer"
              title="Exit to Sector Map"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Educational Tip Toast */}
        {tipMessage && (
          <div className="self-center bg-slate-900/95 border border-cyan-500/50 rounded-xl px-5 py-3 shadow-2xl max-w-xl text-center animate-bounce pointer-events-auto flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-cyan-200 flex-1">{tipMessage}</p>
            <button
              onClick={() => voice.speak(tipMessage, true)}
              className="p-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30 transition-colors cursor-pointer shrink-0"
              title="Listen to Explanation"
            >
              <Volume1 className="w-4 h-4" />
            </button>
          </div>
        )}


        {/* Sector 4 Encounter Dialogue Modal (Interactive when standing near villager) */}
        {activeEncounter && (
          <div className="self-center bg-slate-900/95 border border-purple-500/70 rounded-2xl p-5 shadow-2xl max-w-lg w-full text-center pointer-events-auto">
            <span className="text-xs uppercase tracking-wider text-purple-400 font-bold">💬 {activeEncounter.npc} Needs Your Help!</span>
            <p className="text-sm font-medium text-slate-100 mt-2 mb-4">"{activeEncounter.problem}"</p>
            <div className="flex flex-col gap-2">
              {activeEncounter.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleEncounterChoice(activeEncounter.id, opt.correct, opt.feedback)}
                  className="px-4 py-2.5 text-xs font-semibold text-left text-slate-100 bg-slate-800 hover:bg-purple-900/80 border border-slate-700 hover:border-purple-500 rounded-xl transition-all cursor-pointer"
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Control Bar & Mobile Virtual Buttons */}
        <div className="flex items-end justify-between w-full">
          {/* Flat Desktop Control Hint */}
          <div className="hidden sm:block text-xs text-slate-400 bg-slate-900/70 border border-slate-800/80 rounded-lg px-3 py-1.5">
            {sectorId === 'sector_3' ? (
              <span>WASD / Arrows Move · Space Shield · F/X Firewall Blaster · Esc Pause</span>
            ) : (
              <span>WASD / Arrows Move · Space Jump/Action · Esc Pause</span>
            )}
          </div>

          {/* Mobile On-Screen Virtual Controls */}
          <div className="flex sm:hidden items-center justify-between w-full pointer-events-auto">
            {/* Virtual D-Pad */}
            <div className="flex gap-2">
              <button
                onTouchStart={() => handleVirtualDown('left')}
                onTouchEnd={() => handleVirtualUp('left')}
                onMouseDown={() => handleVirtualDown('left')}
                onMouseUp={() => handleVirtualUp('left')}
                className="w-12 h-12 rounded-xl bg-slate-900/90 border border-slate-700 active:bg-cyan-900/80 text-white font-bold text-lg flex items-center justify-center shadow-lg"
              >
                ◀
              </button>
              <button
                onTouchStart={() => handleVirtualDown('right')}
                onTouchEnd={() => handleVirtualUp('right')}
                onMouseDown={() => handleVirtualDown('right')}
                onMouseUp={() => handleVirtualUp('right')}
                className="w-12 h-12 rounded-xl bg-slate-900/90 border border-slate-700 active:bg-cyan-900/80 text-white font-bold text-lg flex items-center justify-center shadow-lg"
              >
                ▶
              </button>
            </div>

            {/* Virtual Action Buttons */}
            <div className="flex gap-2">
              {sectorId === 'sector_3' && (
                <button
                  onTouchStart={() => handleVirtualDown('laser')}
                  onTouchEnd={() => handleVirtualUp('laser')}
                  onMouseDown={() => handleVirtualDown('laser')}
                  onMouseUp={() => handleVirtualUp('laser')}
                  className="w-12 h-12 rounded-xl bg-amber-600/90 border border-amber-500 active:bg-amber-500 text-white font-bold text-xs flex items-center justify-center shadow-lg"
                >
                  BLAST
                </button>
              )}
              <button
                onTouchStart={() => handleVirtualDown('action')}
                onTouchEnd={() => handleVirtualUp('action')}
                onMouseDown={() => handleVirtualDown('action')}
                onMouseUp={() => handleVirtualUp('action')}
                className="w-14 h-12 rounded-xl bg-cyan-600/90 border border-cyan-400 active:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center shadow-lg"
              >
                {sectorId === 'sector_3' ? 'SHIELD' : 'JUMP'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
