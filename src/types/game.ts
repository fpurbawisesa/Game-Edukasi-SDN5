export type CharacterId = 'kancil' | 'fox' | 'bear' | 'owl';

export interface CharacterInfo {
  id: CharacterId;
  name: string;
  title: string;
  description: string;
  speed: number;
  jumpPower: number;
  avatarUrl: string;
  themeColor: string;
}

export type GradeLevel = 'sd_1_2' | 'sd_3_4' | 'sd_5_6';

export interface GradeLevelInfo {
  id: GradeLevel;
  label: string;
  sublabel: string;
  mathTopics: string[];
}

export type PuzzleType = 
  | 'balance_scale'     // Timbangan logika seimbang (aljabar visual dasar)
  | 'number_sequence'   // Pola & deret angka melompati batu sungai
  | 'crystal_gate'      // Penjumlahan/pengurangan membuka gerbang kristal
  | 'multiplication_totem' // Totem perkalian magis
  | 'fair_share'        // Pembagian buah / pecahan sederhana
  | 'symbol_logic';     // Teka-teki nilai simbol buah

export interface PuzzleOption {
  id: string;
  value: number;
  label: string;
}

export interface PuzzleData {
  id: string;
  type: PuzzleType;
  title: string;
  storyContext: string;
  question: string;
  visualData: any; // Context-dependent visual model (e.g., weights for scale, sequence array)
  options: PuzzleOption[];
  correctAnswer: number;
  explanation: string;
  hint: string;
}

export interface LevelConfig {
  id: number;
  title: string;
  zoneName: string;
  description: string;
  themeColor: string;
  bgGradient: string;
  puzzlesCount: number;
  starThresholds: [number, number, number]; // points needed for 1, 2, 3 stars
  badgeRewardId: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'level' | 'skill' | 'streak' | 'score';
  unlockedAt?: string;
}

export interface LeaderboardEntry {
  id: string;
  rank?: number;
  name: string;
  character: CharacterId;
  score: number;
  stars: number;
  grade: GradeLevel;
  badgesCount: number;
  isCurrentPlayer?: boolean;
}

export interface PlayerProfile {
  name: string;
  character: CharacterId;
  grade: GradeLevel;
  totalScore: number;
  totalStars: number;
  levelProgress: Record<number, {
    unlocked: boolean;
    stars: number;
    highScore: number;
    completedAt?: string;
  }>;
  unlockedBadges: string[]; // badge IDs
  soundEnabled: boolean;
}

export type GameScreen = 
  | 'TITLE'
  | 'LEVEL_SELECT'
  | 'PLAYING'
  | 'PAUSED'
  | 'LEVEL_VICTORY'
  | 'GAME_OVER';
