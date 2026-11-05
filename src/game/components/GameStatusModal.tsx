import React from 'react';
import { SectorId } from '../types';
import { SECTORS } from '../data/curriculum';
import { sound } from '../audio';
import { 
  Play, 
  RotateCcw, 
  Home, 
  Trophy, 
  ShieldAlert, 
  Sparkles, 
  Star, 
  HelpCircle,
  Volume2,
  VolumeX,
  ArrowRight
} from 'lucide-react';

interface PauseModalProps {
  sectorId: SectorId;
  score: number;
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  sectorId,
  score,
  onResume,
  onRestart,
  onExit,
}) => {
  const sector = SECTORS.find(s => s.id === sectorId) || SECTORS[0];
  const [muted, setMuted] = React.useState(sound.getIsMuted());

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    sound.setMute(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
        <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
          Simulation Paused
        </span>
        <h2 className="text-2xl font-bold text-white mt-1 mb-2">{sector.title}</h2>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          Mission Goal: {sector.learningGoal}
        </p>

        {/* Current Score */}
        <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl mb-6 flex items-center justify-between">
          <span className="text-xs text-slate-400">Current Score:</span>
          <span className="font-mono font-bold text-cyan-400 text-base tabular-nums">{score} pts</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 mb-6">
          <button
            onClick={() => {
              sound.playClick();
              onResume();
            }}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Resume Mission (Esc)</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart Sector</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onExit();
            }}
            className="w-full py-2.5 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Quit to Title</span>
          </button>
        </div>

        {/* Sound toggle footer */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-center">
          <button
            onClick={toggleSound}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{muted ? 'Sound Muted' : 'Sound Active'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface VictoryModalProps {
  sectorId: SectorId;
  score: number;
  stars: number;
  onNextSector: () => void;
  onRestart: () => void;
  onExit: () => void;
  onOpenQuiz: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  sectorId,
  score,
  stars,
  onNextSector,
  onRestart,
  onExit,
  onOpenQuiz,
}) => {
  const sector = SECTORS.find(s => s.id === sectorId) || SECTORS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
        {/* Glow backdrop */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Badge Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto mb-4 animate-bounce">
          <Trophy className="w-8 h-8" />
        </div>

        <span className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">
          Sector Cleared!
        </span>
        <h2 className="text-2xl font-bold text-white mt-1 mb-2">
          {sector.title} Mastered!
        </h2>

        {/* Star Rating */}
        <div className="flex items-center justify-center gap-1.5 my-3">
          {[...Array(3)].map((_, i) => (
            <Star
              key={i}
              className={`w-7 h-7 ${
                i < stars ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Score & Key Learnings */}
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl my-4 text-left">
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="text-slate-400">Mission Score:</span>
            <span className="font-mono font-bold text-amber-400 text-base tabular-nums">{score} pts</span>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <span className="text-xs font-bold text-cyan-300 block mb-1">
              ✨ Key Takeaway Learned:
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {sector.learningGoal}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => {
              sound.playClick();
              onNextSector();
            }}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer"
          >
            <span>Next Sector Mission</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenQuiz();
            }}
            className="w-full py-2.5 bg-cyan-950/50 hover:bg-cyan-900/50 border border-cyan-500/30 text-cyan-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>Test Knowledge with Sector Quiz</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onRestart();
              }}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Replay</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onExit();
              }}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Title Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface GameOverModalProps {
  sectorId: SectorId;
  score: number;
  reason?: string;
  onRestart: () => void;
  onExit: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  sectorId,
  score,
  reason,
  onRestart,
  onExit,
}) => {
  const isPitFall = reason?.toLowerCase().includes('fell') || reason?.toLowerCase().includes('pit');

  React.useEffect(() => {
    // Speak on game over if voice is enabled
    import('../speech').then(({ voice }) => {
      if (isPitFall) {
        voice.speak("Game Over! Byte fell into the glitch pit! Let's start again!");
      } else {
        voice.speak("Game Over! Let's start again!");
      }
    });
  }, [isPitFall]);

  const handleReplayVoice = () => {
    import('../speech').then(({ voice }) => {
      if (isPitFall) {
        voice.speak("Game Over! Byte fell into the glitch pit! Let's start again!", true);
      } else {
        voice.speak("Game Over! Let's start again!", true);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-rose-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
        {/* Glow backdrop */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto mb-4 animate-bounce">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <span className="text-xs font-mono font-bold tracking-widest text-rose-400 uppercase">
          {isPitFall ? 'Glitch Pit Fall' : 'Glitch Overload'}
        </span>
        <h2 className="text-3xl font-black text-white mt-1 mb-2 tracking-tight">
          GAME OVER!
        </h2>
        <p className="text-sm font-semibold text-rose-200 mb-2">
          {reason || "Byte ran out of shields! Let's start again!"}
        </p>
        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
          Don't worry, every cyber explorer learns from glitches. Take a breath and let's conquer it!
        </p>

        {/* Voice replay button */}
        <button
          onClick={handleReplayVoice}
          className="mb-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-xs text-cyan-300 border border-cyan-500/30 transition-colors cursor-pointer"
        >
          <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Listen to Voice</span>
        </button>

        {/* Supportive educational tip */}
        <div className="p-3.5 bg-slate-950 border border-cyan-800/40 rounded-2xl text-left mb-6">
          <span className="text-xs font-bold text-cyan-300 block mb-1">
            💡 Pro Cyber Tip:
          </span>
          <p className="text-xs text-slate-300">
            {isPitFall
              ? 'Watch your footing! Time your jumps using Space or Up Arrow to clear gaps between motherboard circuit platforms.'
              : sectorId === 'sector_3'
              ? 'Hold Spacebar to activate your Cyber Shield when approaching red Phishing traps!'
              : 'Take your time and watch out for hazards. Collect data crystals to earn high scores!'}
          </p>
        </div>

        {/* Primary Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="w-full py-4 bg-gradient-to-r from-rose-500 via-amber-500 to-cyan-500 hover:opacity-95 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer glow-cyan transform hover:scale-102"
          >
            <RotateCcw className="w-5 h-5 text-slate-950" />
            <span>Start Again (Try Again)</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onExit();
            }}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Title Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};

