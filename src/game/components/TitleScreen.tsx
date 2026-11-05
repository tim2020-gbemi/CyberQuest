import React, { useEffect, useRef, useState } from 'react';
import { CharacterSkin, SectorId, SectorMeta } from '../types';
import { CHARACTER_SKINS, SECTORS } from '../data/curriculum';
import { sound } from '../audio';
import { voice } from '../speech';
import { 
  Play, 
  BookOpen, 
  Trophy, 
  KeyRound, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Mic,
  MicOff,
  Check, 
  Sparkles, 
  Shield,
  Cpu,
  Code2,
  HeartHandshake
} from 'lucide-react';


interface TitleScreenProps {
  selectedCharacter: CharacterSkin;
  onSelectCharacter: (char: CharacterSkin) => void;
  onStartGame: (sectorId?: SectorId) => void;
  onOpenCodex: () => void;
  onOpenBadges: () => void;
  onOpenPasswordForge: () => void;
  onOpenQuiz: () => void;
  sectorProgress: Record<SectorId, { completed: boolean; stars: number; highScore: number }>;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  selectedCharacter,
  onSelectCharacter,
  onStartGame,
  onOpenCodex,
  onOpenBadges,
  onOpenPasswordForge,
  onOpenQuiz,
  sectorProgress,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSoundMuted, setIsSoundMuted] = useState(sound.getIsMuted());
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(voice.isVoiceEnabled());
  const [selectedSector, setSelectedSector] = useState<SectorId>('sector_1');


  // Keyboard shortcut listener for Start Game (Enter or Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        sound.playClick();
        onStartGame(selectedSector);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame, selectedSector]);

  // Live atmospheric background canvas pan
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const particles: Array<{ x: number; y: number; speed: number; size: number; color: string; alpha: number }> = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        speed: Math.random() * 0.8 + 0.3,
        size: Math.random() * 3 + 1,
        color: ['#06b6d4', '#38bdf8', '#818cf8', '#a855f7', '#10b981'][Math.floor(Math.random() * 5)],
        alpha: Math.random() * 0.6 + 0.2,
      });
    }

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Deep atmospheric space gradient
      const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bg.addColorStop(0, '#020617');
      bg.addColorStop(0.5, '#090d16');
      bg.addColorStop(1, '#0c1527');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Neon grid perspective pan
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.07)';
      ctx.lineWidth = 1;
      const gridSize = 48;
      const panX = (time * 12) % gridSize;
      const panY = (time * 8) % gridSize;

      for (let x = -gridSize + panX; x < canvas.width + gridSize; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = -gridSize + panY; y < canvas.height + gridSize; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      ctx.restore();

      // Floating circuit nodes & glowing data streams
      for (const p of particles) {
        p.y -= p.speed;
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }

        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha + Math.sin(time * 3 + p.x) * 0.15;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const toggleSound = () => {
    const next = !isSoundMuted;
    setIsSoundMuted(next);
    sound.setMute(next);
  };

  const getSectorIcon = (secId: SectorId) => {
    switch (secId) {
      case 'sector_1': return <Cpu className="w-5 h-5 text-cyan-400" />;
      case 'sector_2': return <Code2 className="w-5 h-5 text-emerald-400" />;
      case 'sector_3': return <Shield className="w-5 h-5 text-amber-400" />;
      case 'sector_4': return <HeartHandshake className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-950 overflow-y-auto text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Live Animated Canvas Pan */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Top Bar Navigation Cluster */}
      <div className="relative z-10 flex items-center justify-between w-full max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
            Cyber Scout Academy
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-xs text-slate-400">Digital Literacy Adventure</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className="p-2.5 text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors cursor-pointer"
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
                voice.speak("Voice narration activated! Welcome to CyberQuest!", true);
              }
            }}
            className="p-2.5 text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors cursor-pointer"
            title={isVoiceEnabled ? "Mute Voice Narration" : "Enable Voice Narration"}
          >
            {isVoiceEnabled ? <Mic className="w-4 h-4 text-cyan-400" /> : <MicOff className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenBadges();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-300 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/30 rounded-xl transition-colors cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Badges</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onOpenCodex();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 rounded-xl transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Handbook</span>
          </button>
        </div>
      </div>

      {/* Centerpiece Hero with Bespoke Inline SVG Title Lockup & 35% Negative Space */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center my-6 text-center max-w-4xl mx-auto w-full">
        {/* Hero Artwork / Mascot Preview */}
        <div className="relative mb-5 group">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-cyan-400/60 shadow-2xl relative glow-cyan">
            <img
              src="/src/assets/images/cyber_hero_byte_1793892005986.jpg"
              alt="Cyber Scout Byte"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-400 text-[10px] font-bold text-cyan-300 tracking-wider uppercase">
            Scout Unit
          </div>
        </div>

        {/* Bespoke Inline SVG Title Lockup */}
        <div className="w-full max-w-xl mx-auto px-4 mb-3">
          <svg viewBox="0 0 600 120" className="w-full h-auto drop-shadow-2xl">
            <defs>
              <linearGradient id="cyberTitleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
              <linearGradient id="goldSubtitleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            {/* Tech bracket accents */}
            <path d="M 40 25 L 15 25 L 15 95 L 40 95" stroke="#38bdf8" strokeWidth="3" fill="none" opacity="0.6" />
            <path d="M 560 25 L 585 25 L 585 95 L 560 95" stroke="#34d399" strokeWidth="3" fill="none" opacity="0.6" />
            {/* Main title text */}
            <text
              x="300"
              y="65"
              textAnchor="middle"
              fontFamily="Outfit, sans-serif"
              fontWeight="900"
              fontSize="52"
              letterSpacing="3"
              fill="url(#cyberTitleGrad)"
            >
              CYBERQUEST
            </text>
            <text
              x="300"
              y="98"
              textAnchor="middle"
              fontFamily="Outfit, sans-serif"
              fontWeight="700"
              fontSize="16"
              letterSpacing="6"
              fill="url(#goldSubtitleGrad)"
            >
              DIGITAL LITERACY ADVENTURE
            </text>
          </svg>
        </div>

        <p className="text-sm sm:text-base text-slate-300 max-w-xl mb-6 leading-relaxed">
          Explore what computers are inside, code algorithmic solutions, deflect online phishing scams, and master responsible digital citizenship!
        </p>

        {/* Character Skin Selector */}
        <div className="mb-6">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-2">
            Choose Your Explorer:
          </span>
          <div className="flex items-center justify-center gap-2.5">
            {CHARACTER_SKINS.map(char => {
              const isSelected = char.id === selectedCharacter.id;
              return (
                <button
                  key={char.id}
                  onClick={() => {
                    sound.playClick();
                    onSelectCharacter(char);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 border-cyan-400 text-white shadow-md'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: char.color }} />
                  <span className="text-xs font-semibold">{char.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sector Stage Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 w-full mb-8 text-left">
          {SECTORS.map(sec => {
            const isSelected = sec.id === selectedSector;
            const progress = sectorProgress[sec.id];
            return (
              <button
                key={sec.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedSector(sec.id);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900/90 border-cyan-400 shadow-xl ring-2 ring-cyan-500/20'
                    : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                      {getSectorIcon(sec.id)}
                    </div>
                    {progress?.completed ? (
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40">
                        Cleared ★★★
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono">Stage 0{sec.number}</span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-white mb-0.5 truncate">{sec.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {sec.learningGoal}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                  <span className="text-cyan-400 font-semibold">{isSelected ? 'Selected' : 'Select'}</span>
                  {progress?.highScore ? (
                    <span className="text-slate-400 font-mono">{progress.highScore} pts</span>
                  ) : (
                    <span className="text-slate-500">Unplayed</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Primary Start CTA Button & Practice Minigames */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
          <button
            onClick={() => {
              sound.playClick();
              onStartGame(selectedSector);
            }}
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl flex items-center gap-2.5 transition-all transform hover:scale-105 active:scale-95 cursor-pointer glow-cyan"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>Launch Mission (Space / Enter)</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenPasswordForge();
            }}
            className="px-4 py-4 bg-slate-900/90 hover:bg-slate-800 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-2xl flex items-center gap-2 transition-colors cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>Password Forge Lab</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenQuiz();
            }}
            className="px-4 py-4 bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 font-bold text-xs rounded-2xl flex items-center gap-2 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>Cyber Quiz</span>
          </button>
        </div>

        {/* Single Flat Control Hint Line per guidelines */}
        <div className="text-xs text-slate-400 font-medium tracking-wide">
          <span>WASD / Arrows Move · Space Action / Shield · Esc Pause · Enter Start</span>
        </div>
      </div>

      {/* Footer metadata info */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 max-w-6xl mx-auto w-full pt-4 border-t border-slate-900">
        <div>
          <span>CyberQuest v1.0</span>
          <span className="mx-2">·</span>
          <span>Digital Literacy & Cyber Safety for Kids</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Hardware & Software Anatomy</span>
          <span className="text-slate-700">/</span>
          <span>Phishing & Scam Defense</span>
          <span className="text-slate-700">/</span>
          <span>Netiquette Wisdom</span>
        </div>
      </div>
    </div>
  );
};
