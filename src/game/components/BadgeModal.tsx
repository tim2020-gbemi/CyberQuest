import React from 'react';
import { Badge } from '../types';
import { sound } from '../audio';
import { Trophy, X, Cpu, Code2, ShieldCheck, Sparkles, KeyRound, GraduationCap, Lock } from 'lucide-react';

interface BadgeModalProps {
  badges: Badge[];
  onClose: () => void;
}

export const BadgeModal: React.FC<BadgeModalProps> = ({ badges, onClose }) => {
  const unlockedCount = badges.filter(b => b.unlocked).length;

  const renderBadgeIcon = (iconName: string, unlocked: boolean) => {
    const iconClass = `w-6 h-6 ${unlocked ? 'text-amber-400' : 'text-slate-600'}`;
    switch (iconName) {
      case 'Cpu': return <Cpu className={iconClass} />;
      case 'Code2': return <Code2 className={iconClass} />;
      case 'ShieldCheck': return <ShieldCheck className={iconClass} />;
      case 'Sparkles': return <Sparkles className={iconClass} />;
      case 'KeyRound': return <KeyRound className={iconClass} />;
      case 'GraduationCap': return <GraduationCap className={iconClass} />;
      case 'Trophy': return <Trophy className={iconClass} />;
      default: return <Trophy className={iconClass} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Cyber Badge Hall</h2>
              <p className="text-xs text-slate-400">
                You have earned <span className="font-semibold text-amber-400">{unlockedCount}</span> of {badges.length} digital literacy honors
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Badge Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 my-6 overflow-y-auto max-h-[60vh] pr-1">
          {badges.map(b => (
            <div
              key={b.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col items-start ${
                b.unlocked
                  ? 'bg-amber-950/20 border-amber-500/40 shadow-sm'
                  : 'bg-slate-950/40 border-slate-800/80 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-3">
                <div className={`p-2.5 rounded-xl ${b.unlocked ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-slate-900 border border-slate-800'}`}>
                  {renderBadgeIcon(b.icon, b.unlocked)}
                </div>
                {b.unlocked ? (
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                    Earned
                  </span>
                ) : (
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                    <Lock className="w-3 h-3" />
                    <span>Locked</span>
                  </div>
                )}
              </div>
              <h3 className={`text-sm font-bold mb-1 ${b.unlocked ? 'text-white' : 'text-slate-400'}`}>
                {b.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {b.description}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {unlockedCount === badges.length ? '🌟 You are a certified Grandmaster Cyber Scout!' : 'Keep playing sectors to unlock all honors!'}
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
