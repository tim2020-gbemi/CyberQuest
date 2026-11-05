import React, { useState } from 'react';
import { SectorId } from '../types';
import { QUIZ_QUESTIONS, SECTORS } from '../data/curriculum';
import { sound } from '../audio';
import { HelpCircle, CheckCircle2, XCircle, Trophy, ArrowRight, RotateCcw, X, Sparkles } from 'lucide-react';

interface QuizModalProps {
  initialSectorId?: SectorId;
  onClose: () => void;
  onScoreEarned?: (score: number) => void;
  onUnlockBadge?: (badgeId: string) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  initialSectorId,
  onClose,
  onScoreEarned,
  onUnlockBadge,
}) => {
  const [selectedSector, setSelectedSector] = useState<SectorId | 'all'>(initialSectorId || 'all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Filter questions based on selected sector
  const questions = selectedSector === 'all'
    ? QUIZ_QUESTIONS
    : QUIZ_QUESTIONS.filter(q => q.sectorId === selectedSector);

  const currentQ = questions[currentIndex] || questions[0];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.correctIndex;
    if (isCorrect) {
      sound.playSuccess();
      setCorrectCount(prev => prev + 1);
    } else {
      sound.playError();
    }
  };

  const handleNext = () => {
    sound.playClick();
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Completed quiz!
      sound.playVictory();
      setIsFinished(true);
      if (onScoreEarned) {
        onScoreEarned(correctCount * 150);
      }
      if (correctCount === questions.length && onUnlockBadge) {
        onUnlockBadge('badge_quiz');
      }
    }
  };

  const handleRestart = () => {
    sound.playClick();
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setCorrectCount(0);
    setIsFinished(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Cyber Literacy Challenge</h2>
              <p className="text-xs text-slate-400">Test what you have learned and earn Cyber Scout points</p>
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

        {/* Sector Filter Tabs (functional interactive segmented buttons) */}
        {!isFinished && (
          <div className="flex flex-wrap gap-1.5 my-4 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                sound.playClick();
                setSelectedSector('all');
                handleRestart();
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                selectedSector === 'all' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Topics
            </button>
            {SECTORS.map(sec => (
              <button
                key={sec.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedSector(sec.id);
                  handleRestart();
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  selectedSector === sec.id ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sector {sec.number}
              </button>
            ))}
          </div>
        )}

        {/* Quiz Body */}
        {!isFinished ? (
          <div className="flex-1 flex flex-col justify-between py-2">
            <div>
              {/* Progress counter */}
              <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                <span>Question {currentIndex + 1} of {questions.length}</span>
                <span className="font-mono text-cyan-400 tabular-nums">Score: {correctCount * 100} pts</span>
              </div>

              {/* Question card */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl mb-4">
                <h3 className="text-base font-semibold text-white leading-relaxed">
                  {currentQ.question}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQ.correctIndex;

                  let optionStyle = 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-slate-500 hover:bg-slate-800';

                  if (isAnswered) {
                    if (isCorrect) {
                      optionStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-100';
                    } else if (isSelected) {
                      optionStyle = 'bg-rose-950/80 border-rose-500 text-rose-100';
                    } else {
                      optionStyle = 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      className={`w-full p-3.5 rounded-xl border text-left text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${optionStyle}`}
                    >
                      <span>{option}</span>
                      {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 ml-2" />}
                      {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-400 shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Box */}
              {isAnswered && (
                <div className="mt-4 p-3.5 bg-slate-950 border border-cyan-800/40 rounded-2xl animate-in fade-in duration-200">
                  <p className="text-xs text-cyan-200 leading-relaxed">
                    <strong>{selectedOption === currentQ.correctIndex ? '🎉 Spot on! ' : '💡 Good effort! '}</strong>
                    {currentQ.explanation}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    <strong>Takeaway:</strong> {currentQ.tip}
                  </p>
                </div>
              )}
            </div>

            {/* Next Action Button */}
            <div className="mt-6 flex justify-end">
              {isAnswered && (
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-xl flex items-center gap-2 shadow-lg transition-colors cursor-pointer"
                >
                  <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'View Results'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Finished State */
          <div className="py-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4 animate-bounce">
              <Trophy className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Quiz Completed!</h3>
            <p className="text-sm text-slate-300 max-w-md mb-6">
              You scored <span className="font-bold text-amber-400">{correctCount}</span> out of{' '}
              <span className="font-bold text-white">{questions.length}</span> questions correct!
            </p>

            {correctCount === questions.length && (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold mb-6">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Cyber Scholar Badge Unlocked!</span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleRestart}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Continue Playing
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
