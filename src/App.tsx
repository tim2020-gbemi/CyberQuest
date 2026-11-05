/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameState, SectorId, CharacterSkin, Badge } from './game/types';
import { CHARACTER_SKINS, INITIAL_BADGES, SECTORS } from './game/data/curriculum';
import { TitleScreen } from './game/components/TitleScreen';
import { CanvasGame } from './game/engine/CanvasGame';
import { PauseModal, VictoryModal, GameOverModal } from './game/components/GameStatusModal';
import { PasswordForgeModal } from './game/components/PasswordForgeModal';
import { QuizModal } from './game/components/QuizModal';
import { CodexModal } from './game/components/CodexModal';
import { BadgeModal } from './game/components/BadgeModal';
import { sound } from './game/audio';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [currentSectorId, setCurrentSectorId] = useState<SectorId>('sector_1');
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterSkin>(CHARACTER_SKINS[0]);
  const [activeScore, setActiveScore] = useState(0);
  const [lastEarnedStars, setLastEarnedStars] = useState(3);

  // Sector completion and high scores loaded from localStorage
  const [sectorProgress, setSectorProgress] = useState<Record<SectorId, { completed: boolean; stars: number; highScore: number }>>(() => {
    try {
      const stored = localStorage.getItem('cyberquest_sector_progress');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      sector_1: { completed: false, stars: 0, highScore: 0 },
      sector_2: { completed: false, stars: 0, highScore: 0 },
      sector_3: { completed: false, stars: 0, highScore: 0 },
      sector_4: { completed: false, stars: 0, highScore: 0 },
    };
  });

  // Badges collection
  const [badges, setBadges] = useState<Badge[]>(() => {
    try {
      const stored = localStorage.getItem('cyberquest_badges');
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_BADGES;
  });

  // Modal overlays that can open on top of title or pause
  const [isCodexOpen, setIsCodexOpen] = useState(false);
  const [isBadgesOpen, setIsBadgesOpen] = useState(false);
  const [isPasswordForgeOpen, setIsPasswordForgeOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  // Save progress changes
  useEffect(() => {
    try {
      localStorage.setItem('cyberquest_sector_progress', JSON.stringify(sectorProgress));
    } catch {}
  }, [sectorProgress]);

  // Save badges changes
  useEffect(() => {
    try {
      localStorage.setItem('cyberquest_badges', JSON.stringify(badges));
    } catch {}
  }, [badges]);

  // Unlock badge helper
  const unlockBadge = (badgeId: string) => {
    setBadges(prev => {
      const already = prev.find(b => b.id === badgeId && b.unlocked);
      if (already) return prev;
      sound.playVictory();
      return prev.map(b => (b.id === badgeId ? { ...b, unlocked: true, unlockedAt: new Date().toISOString() } : b));
    });
  };

  // Launch sector game
  const handleStartGame = (secId?: SectorId) => {
    const targetSector = secId || currentSectorId;
    setCurrentSectorId(targetSector);
    setActiveScore(0);
    setGameState('PLAYING');
  };

  // On sector completed
  const handleSectorComplete = (finalScore: number, stars: number) => {
    setActiveScore(finalScore);
    setLastEarnedStars(stars);

    // Update sector progress
    setSectorProgress(prev => {
      const current = prev[currentSectorId] || { completed: false, stars: 0, highScore: 0 };
      const updated = {
        ...prev,
        [currentSectorId]: {
          completed: true,
          stars: Math.max(current.stars, stars),
          highScore: Math.max(current.highScore, finalScore),
        },
      };

      // Check if all sectors completed for Grandmaster badge
      const allDone = Object.values(updated).every(s => s.completed);
      if (allDone) {
        unlockBadge('badge_master');
      }

      return updated;
    });

    // Sector-specific badge unlocks
    if (currentSectorId === 'sector_1') unlockBadge('badge_hardware');
    if (currentSectorId === 'sector_2') unlockBadge('badge_algo');
    if (currentSectorId === 'sector_3') unlockBadge('badge_shield');
    if (currentSectorId === 'sector_4') unlockBadge('badge_citizen');

    setGameState('VICTORY');
  };

  const [gameOverReason, setGameOverReason] = useState<string>('');

  // On game over
  const handleGameOver = (finalScore: number, reason?: string) => {
    setActiveScore(finalScore);
    setGameOverReason(reason || 'Glitch Overload');
    setGameState('GAMEOVER');
  };


  // Move to next sector
  const handleNextSector = () => {
    const sectorOrder: SectorId[] = ['sector_1', 'sector_2', 'sector_3', 'sector_4'];
    const currentIndex = sectorOrder.indexOf(currentSectorId);
    if (currentIndex < sectorOrder.length - 1) {
      const nextSec = sectorOrder[currentIndex + 1];
      setCurrentSectorId(nextSec);
      setActiveScore(0);
      setGameState('PLAYING');
    } else {
      // Loop or return to title
      setGameState('TITLE');
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      {/* 1. Title Screen */}
      {gameState === 'TITLE' && (
        <TitleScreen
          selectedCharacter={selectedCharacter}
          onSelectCharacter={setSelectedCharacter}
          onStartGame={handleStartGame}
          onOpenCodex={() => setIsCodexOpen(true)}
          onOpenBadges={() => setIsBadgesOpen(true)}
          onOpenPasswordForge={() => setIsPasswordForgeOpen(true)}
          onOpenQuiz={() => setIsQuizOpen(true)}
          sectorProgress={sectorProgress}
        />
      )}

      {/* 2. Active 60fps Canvas Playing View */}
      {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
        <CanvasGame
          sectorId={currentSectorId}
          character={selectedCharacter}
          onExit={() => {
            sound.playClick();
            setGameState('TITLE');
          }}
          onPause={() => setGameState('PAUSED')}
          onComplete={handleSectorComplete}
          onGameOver={handleGameOver}
          onOpenQuiz={() => setIsQuizOpen(true)}
        />
      )}

      {/* 3. Pause Modal */}
      {gameState === 'PAUSED' && (
        <PauseModal
          sectorId={currentSectorId}
          score={activeScore}
          onResume={() => setGameState('PLAYING')}
          onRestart={() => {
            setActiveScore(0);
            setGameState('PLAYING');
          }}
          onExit={() => setGameState('TITLE')}
        />
      )}

      {/* 4. Victory Modal */}
      {gameState === 'VICTORY' && (
        <VictoryModal
          sectorId={currentSectorId}
          score={activeScore}
          stars={lastEarnedStars}
          onNextSector={handleNextSector}
          onRestart={() => {
            setActiveScore(0);
            setGameState('PLAYING');
          }}
          onExit={() => setGameState('TITLE')}
          onOpenQuiz={() => setIsQuizOpen(true)}
        />
      )}

      {/* 5. Game Over Modal */}
      {gameState === 'GAMEOVER' && (
        <GameOverModal
          sectorId={currentSectorId}
          score={activeScore}
          reason={gameOverReason}
          onRestart={() => {
            setActiveScore(0);
            setGameState('PLAYING');
          }}
          onExit={() => setGameState('TITLE')}
        />
      )}


      {/* Overlay Modals (Handbook, Badges, Password Forge, Quiz) */}
      {isCodexOpen && (
        <CodexModal onClose={() => setIsCodexOpen(false)} />
      )}

      {isBadgesOpen && (
        <BadgeModal badges={badges} onClose={() => setIsBadgesOpen(false)} />
      )}

      {isPasswordForgeOpen && (
        <PasswordForgeModal
          onClose={() => setIsPasswordForgeOpen(false)}
          onUnlockBadge={unlockBadge}
        />
      )}

      {isQuizOpen && (
        <QuizModal
          initialSectorId={currentSectorId}
          onClose={() => setIsQuizOpen(false)}
          onScoreEarned={(pts) => setActiveScore(prev => prev + pts)}
          onUnlockBadge={unlockBadge}
        />
      )}
    </div>
  );
}
