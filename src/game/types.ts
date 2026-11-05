export type GameState = 
  | 'TITLE'
  | 'SECTOR_SELECT'
  | 'PLAYING'
  | 'MINIGAME_PASSWORD'
  | 'QUIZ'
  | 'PAUSED'
  | 'VICTORY'
  | 'GAMEOVER'
  | 'CODEX'
  | 'BADGES';

export type SectorId = 'sector_1' | 'sector_2' | 'sector_3' | 'sector_4';

export interface CharacterSkin {
  id: string;
  name: string;
  role: string;
  color: string;
  secondaryColor: string;
  glowColor: string;
  description: string;
}

export interface SectorMeta {
  id: SectorId;
  number: number;
  title: string;
  subtitle: string;
  theme: string;
  accentColor: string;
  description: string;
  learningGoal: string;
  concepts: string[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  sectorId?: SectorId;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface QuizQuestion {
  id: string;
  sectorId: SectorId;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  tip: string;
}

export interface PlayerStats {
  score: number;
  coins: number;
  health: number;
  maxHealth: number;
  dataPacketsCollected: number;
  phishingBlocked: number;
  kindActionsDone: number;
  sectorsCompleted: Record<SectorId, { completed: boolean; stars: number; highScore: number }>;
}

export interface SoundConfig {
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;
}
