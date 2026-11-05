import React, { useState } from 'react';
import { sound } from '../audio';
import { Shield, KeyRound, Sparkles, Check, X, ArrowLeft, RefreshCw, Lock } from 'lucide-react';

interface PasswordForgeModalProps {
  onClose: () => void;
  onUnlockBadge?: (badgeId: string) => void;
}

export const PasswordForgeModal: React.FC<PasswordForgeModalProps> = ({ onClose, onUnlockBadge }) => {
  const [password, setPassword] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);

  // Analyze password strength
  const hasMinLength = password.length >= 10;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let score = 0;
  if (password.length > 0) score += 10;
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 20;
  if (hasUpper) score += 12;
  if (hasLower) score += 12;
  if (hasNumber) score += 13;
  if (hasSpecial) score += 13;

  score = Math.min(100, score);

  let crackTime = 'Instantly (0.001 seconds)';
  let strengthLabel = 'Too Weak';
  let badgeColor = 'text-rose-400 border-rose-500/50 bg-rose-950/40';

  if (score >= 90) {
    crackTime = '12 Trillion Years (Indestructible Fortress!)';
    strengthLabel = 'Super Fortified';
    badgeColor = 'text-emerald-400 border-emerald-500/50 bg-emerald-950/40';
  } else if (score >= 70) {
    crackTime = '450,000 Years';
    strengthLabel = 'Strong Shield';
    badgeColor = 'text-cyan-400 border-cyan-500/50 bg-cyan-950/40';
  } else if (score >= 40) {
    crackTime = '3 Hours';
    strengthLabel = 'Moderate';
    badgeColor = 'text-amber-400 border-amber-500/50 bg-amber-950/40';
  }

  const handleSuggest = () => {
    sound.playCollect();
    const words = ['Dragon', 'Cosmic', 'Pancake', 'Galaxy', 'Robot', 'Thunder', 'Pixel'];
    const w1 = words[Math.floor(Math.random() * words.length)];
    const w2 = words[Math.floor(Math.random() * words.length)];
    const num = Math.floor(Math.random() * 90 + 10);
    const syms = ['!', '#', '@', '$', '*'];
    const sym = syms[Math.floor(Math.random() * syms.length)];
    const generated = `${w1}-${w2}-${num}${sym}`;
    setPassword(generated);

    if (onUnlockBadge) {
      onUnlockBadge('badge_password');
    }
  };

  const handleTestKey = () => {
    if (score >= 90) {
      sound.playVictory();
      if (onUnlockBadge) {
        onUnlockBadge('badge_password');
      }
    } else {
      sound.playClick();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Glow backdrop accent */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">The Password Forge</h2>
              <p className="text-xs text-slate-400">Build an unbreakable cyber fortress for your accounts</p>
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

        {/* Password Input Field */}
        <div className="my-6">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Type Your Secret Test Password:
          </label>
          <div className="relative flex items-center">
            <Lock className="absolute left-4 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (score >= 80) sound.playCollect();
              }}
              placeholder="e.g. Blue-Dolphin-Skates-88!"
              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-2xl py-3.5 pl-12 pr-28 text-white font-mono text-base outline-none transition-all shadow-inner"
            />
            <button
              onClick={handleSuggest}
              className="absolute right-2 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Forge Safe</span>
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            💡 Educational sandbox: This is simulated in your browser. Never use real personal passwords on test sites!
          </p>
        </div>

        {/* Strength Meter & Time-To-Crack */}
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl mb-6">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400">Fortress Defense Level:</span>
            <span className={`font-semibold px-2 py-0.5 rounded border text-xs ${badgeColor}`}>
              {strengthLabel} ({score}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                score >= 85 ? 'bg-emerald-500' : score >= 60 ? 'bg-cyan-500' : score >= 35 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${score}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Hacker Supercomputer Crack Time:</span>
            <span className="font-mono font-bold text-slate-200">{crackTime}</span>
          </div>
        </div>

        {/* Ingredient Checklist */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          <div className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs ${hasMinLength ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300' : 'border-slate-800 text-slate-400'}`}>
            {hasMinLength ? <Check className="w-4 h-4 text-emerald-400" /> : <div className="w-4 h-4 rounded-full border border-slate-600" />}
            <span>10+ Letters</span>
          </div>
          <div className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs ${hasUpper && hasLower ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300' : 'border-slate-800 text-slate-400'}`}>
            {hasUpper && hasLower ? <Check className="w-4 h-4 text-emerald-400" /> : <div className="w-4 h-4 rounded-full border border-slate-600" />}
            <span>Big & Small</span>
          </div>
          <div className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs ${hasNumber ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300' : 'border-slate-800 text-slate-400'}`}>
            {hasNumber ? <Check className="w-4 h-4 text-emerald-400" /> : <div className="w-4 h-4 rounded-full border border-slate-600" />}
            <span>Numbers (0-9)</span>
          </div>
          <div className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs ${hasSpecial ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300' : 'border-slate-800 text-slate-400'}`}>
            {hasSpecial ? <Check className="w-4 h-4 text-emerald-400" /> : <div className="w-4 h-4 rounded-full border border-slate-600" />}
            <span>Symbols (!#?$)</span>
          </div>
        </div>

        {/* Kid-Friendly Secret Trick */}
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl mb-6 text-xs text-amber-200 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p>
            <strong>The Passphrase Secret:</strong> Instead of trying to memorize messy gibberish like <code>x7%K#9pQ</code>, combine 3-4 random memorable words together with dashes, like <code>Purple-Tiger-Jumps-99!</code>. It's easy for your brain to remember, but impossible for computers to guess!
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Game</span>
          </button>

          {score >= 90 && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold animate-pulse">
              <Shield className="w-4 h-4" />
              <span>Password Fortifier Unlocked!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
