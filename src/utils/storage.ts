import { PlayerProfile, LeaderboardEntry, Badge } from '../types/game';
import { INITIAL_PEER_LEADERBOARD, BADGES } from './constants';

const STORAGE_KEY_PROFILE = 'rimba_math_player_profile';
const STORAGE_KEY_LEADERBOARD = 'rimba_math_leaderboard';

const DEFAULT_PROFILE: PlayerProfile = {
  name: 'Petualang Cilik',
  character: 'kancil',
  grade: 'sd_3_4',
  totalScore: 0,
  totalStars: 0,
  levelProgress: {
    1: { unlocked: true, stars: 0, highScore: 0 },
    2: { unlocked: false, stars: 0, highScore: 0 },
    3: { unlocked: false, stars: 0, highScore: 0 },
    4: { unlocked: false, stars: 0, highScore: 0 },
    5: { unlocked: false, stars: 0, highScore: 0 },
    6: { unlocked: false, stars: 0, highScore: 0 },
    7: { unlocked: false, stars: 0, highScore: 0 },
    8: { unlocked: false, stars: 0, highScore: 0 },
  },
  unlockedBadges: [],
  soundEnabled: true,
};

export function loadPlayerProfile(): PlayerProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      levelProgress: {
        ...DEFAULT_PROFILE.levelProgress,
        ...(parsed.levelProgress || {}),
      },
      unlockedBadges: Array.isArray(parsed.unlockedBadges) ? parsed.unlockedBadges : [],
    };
  } catch (e) {
    console.error('Failed to load profile', e);
    return DEFAULT_PROFILE;
  }
}

export function savePlayerProfile(profile: PlayerProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

export function loadLeaderboard(player: PlayerProfile): LeaderboardEntry[] {
  let peers: LeaderboardEntry[] = INITIAL_PEER_LEADERBOARD;
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_LEADERBOARD);
      if (raw) {
        peers = JSON.parse(raw);
      }
    } catch (_) {}
  }

  // Insert or update current player
  const playerEntry: LeaderboardEntry = {
    id: 'current_player',
    name: player.name || 'Petualang Cilik',
    character: player.character,
    score: player.totalScore,
    stars: player.totalStars,
    grade: player.grade,
    badgesCount: player.unlockedBadges.length,
    isCurrentPlayer: true,
  };

  const allEntries = [...peers.filter(p => p.id !== 'current_player'), playerEntry];
  
  // Sort descending by score, then stars
  allEntries.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.stars - a.stars;
  });

  // Assign ranks
  const ranked = allEntries.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));

  return ranked;
}

// Check and award badges based on game events
export function evaluateBadges(
  currentProfile: PlayerProfile,
  completedLevelId: number,
  levelScore: number,
  isAccuracy100: boolean
): { updatedProfile: PlayerProfile; newlyUnlockedBadges: Badge[] } {
  const newlyUnlocked: Badge[] = [];
  const currentBadgeIds = new Set(currentProfile.unlockedBadges);

  const checkBadge = (id: string, condition: boolean) => {
    if (condition && !currentBadgeIds.has(id)) {
      currentBadgeIds.add(id);
      const badgeObj = BADGES.find(b => b.id === id);
      if (badgeObj) newlyUnlocked.push(badgeObj);
    }
  };

  // 1. Level 1 complete
  checkBadge('badge_first_step', completedLevelId === 1);

  // 2. Level 2 complete
  checkBadge('badge_pattern_master', completedLevelId === 2);

  // 3. Level 3 complete
  checkBadge('badge_balance_expert', completedLevelId === 3);

  // 4. Level 4 complete
  checkBadge('badge_speed_math', completedLevelId === 4);

  // 5. Level 5 complete
  checkBadge('badge_multiplier_hero', completedLevelId === 5);

  // 6. Level 6 complete
  checkBadge('badge_fair_share', completedLevelId === 6);

  // 7. Level 7 complete
  checkBadge('badge_logic_detective', completedLevelId === 7);

  // 8. Level 8 complete (Champion)
  checkBadge('badge_jungle_champion', completedLevelId === 8);

  // 9. 15 or more stars
  checkBadge('badge_star_collector', currentProfile.totalStars >= 15);

  // 10. Accuracy 100%
  checkBadge('badge_accuracy_100', isAccuracy100);

  const updatedProfile: PlayerProfile = {
    ...currentProfile,
    unlockedBadges: Array.from(currentBadgeIds),
  };

  savePlayerProfile(updatedProfile);

  return { updatedProfile, newlyUnlockedBadges: newlyUnlocked };
}
