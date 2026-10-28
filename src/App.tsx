import React, { useState, useEffect } from 'react';
import { GameScreen, PlayerProfile, PuzzleData, LevelConfig, Badge } from './types/game';
import {
  loadPlayerProfile,
  savePlayerProfile,
  loadLeaderboard,
  evaluateBadges,
} from './utils/storage';
import { LEVELS } from './utils/constants';
import { generatePuzzlesForLevel } from './utils/puzzleGenerator';
import { sound } from './utils/audio';

import { TitleScreen } from './components/TitleScreen';
import { LevelMap } from './components/LevelMap';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { PuzzleModal } from './components/PuzzleModal';
import { VictoryModal } from './components/VictoryModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { BadgesModal } from './components/BadgesModal';
import { ProfileModal } from './components/ProfileModal';
import { Play, RotateCcw, Map } from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useState<PlayerProfile>(() => loadPlayerProfile());
  const [screen, setScreen] = useState<GameScreen>('TITLE');
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);

  // Active game session state
  const [sessionScore, setSessionScore] = useState<number>(0);
  const [sessionStars, setSessionStars] = useState<number>(0);
  const [puzzles, setPuzzles] = useState<PuzzleData[]>([]);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState<number>(0);
  const [isPuzzleActive, setIsPuzzleActive] = useState<boolean>(false);
  const [correctFirstTries, setCorrectFirstTries] = useState<number>(0);
  const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState<Badge[]>([]);

  // Modals
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isBadgesOpen, setIsBadgesOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  // Sound sync
  useEffect(() => {
    sound.setMuted(!profile.soundEnabled);
    if (profile.soundEnabled) {
      sound.startAmbientBGM();
    } else {
      sound.stopBGM();
    }
  }, [profile.soundEnabled]);

  const handleToggleSound = () => {
    const updated = !profile.soundEnabled;
    const newProfile = { ...profile, soundEnabled: updated };
    setProfile(newProfile);
    savePlayerProfile(newProfile);
  };

  const handleStartLevel = (levelId: number) => {
    const targetLevel = LEVELS.find((l) => l.id === levelId) || LEVELS[0];
    const generated = generatePuzzlesForLevel(targetLevel.id, profile.grade, targetLevel.puzzlesCount);

    setCurrentLevelId(targetLevel.id);
    setPuzzles(generated);
    setCurrentPuzzleIndex(0);
    setSessionScore(0);
    setSessionStars(0);
    setCorrectFirstTries(0);
    setIsPuzzleActive(false);
    setNewlyUnlockedBadges([]);
    setScreen('PLAYING');
  };

  const handleTriggerPuzzle = (puzzleIdx: number) => {
    if (puzzleIdx < puzzles.length) {
      setCurrentPuzzleIndex(puzzleIdx);
      setIsPuzzleActive(true);
    }
  };

  const handleSolvePuzzle = (isCorrectFirstTry: boolean, timeSpentSeconds: number) => {
    // Score calculation: Base points + Time bonus + First-try accuracy bonus
    const basePoints = 200;
    const timeBonus = Math.max(0, 100 - timeSpentSeconds * 5);
    const accuracyBonus = isCorrectFirstTry ? 150 : 50;
    const earned = basePoints + timeBonus + accuracyBonus;

    setSessionScore((prev) => prev + earned);
    if (isCorrectFirstTry) {
      setCorrectFirstTries((prev) => prev + 1);
    }

    setIsPuzzleActive(false);
    const nextIdx = currentPuzzleIndex + 1;
    setCurrentPuzzleIndex(nextIdx);

    // If all puzzles cleared, complete level!
    if (nextIdx >= puzzles.length) {
      handleCompleteLevel(sessionScore + earned, isCorrectFirstTry ? correctFirstTries + 1 : correctFirstTries);
    }
  };

  const handleCollectStar = (points: number) => {
    setSessionScore((prev) => prev + points);
    setSessionStars((prev) => prev + 1);
  };

  const handleCompleteLevel = (finalScore: number, firstTryCount: number) => {
    const currentLevel = LEVELS.find((l) => l.id === currentLevelId) || LEVELS[0];
    sound.playFanfare();

    // Determine star rating (1 to 3 stars based on thresholds)
    let starsEarned = 1;
    if (finalScore >= currentLevel.starThresholds[2]) {
      starsEarned = 3;
    } else if (finalScore >= currentLevel.starThresholds[1]) {
      starsEarned = 2;
    }

    const accuracy = Math.round((firstTryCount / Math.max(1, puzzles.length)) * 100);
    const isAccuracy100 = accuracy === 100;

    // Update player profile
    const existingProgress = profile.levelProgress[currentLevelId] || {
      unlocked: true,
      stars: 0,
      highScore: 0,
    };
    const nextLevelId = currentLevelId + 1;

    const newLevelProgress = {
      ...profile.levelProgress,
      [currentLevelId]: {
        unlocked: true,
        stars: Math.max(existingProgress.stars, starsEarned),
        highScore: Math.max(existingProgress.highScore, finalScore),
        completedAt: new Date().toISOString(),
      },
    };

    // Unlock next level if available
    if (nextLevelId <= LEVELS.length) {
      newLevelProgress[nextLevelId] = {
        ...(newLevelProgress[nextLevelId] || { stars: 0, highScore: 0 }),
        unlocked: true,
      };
    }

    // Recalculate total stars and score
    let totalStarsCalc = 0;
    let totalScoreCalc = 0;
    Object.values(newLevelProgress).forEach((prog) => {
      totalStarsCalc += prog.stars;
      totalScoreCalc += prog.highScore;
    });

    const tempProfile: PlayerProfile = {
      ...profile,
      totalStars: totalStarsCalc,
      totalScore: totalScoreCalc,
      levelProgress: newLevelProgress,
    };

    // Evaluate badges
    const { updatedProfile, newlyUnlockedBadges: newBadges } = evaluateBadges(
      tempProfile,
      currentLevelId,
      finalScore,
      isAccuracy100
    );

    if (newBadges.length > 0) {
      sound.playBadgeUnlock();
      setNewlyUnlockedBadges(newBadges);
    }

    setProfile(updatedProfile);
    setScreen('LEVEL_VICTORY');
  };

  const currentLevelConfig = LEVELS.find((l) => l.id === currentLevelId) || LEVELS[0];
  const leaderboardEntries = loadLeaderboard(profile);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* 1. TITLE SCREEN */}
      {screen === 'TITLE' && (
        <TitleScreen
          onStartGame={() => handleStartLevel(1)}
          onOpenMap={() => setScreen('LEVEL_SELECT')}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onOpenBadges={() => setIsBadgesOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          soundEnabled={profile.soundEnabled}
          onToggleSound={handleToggleSound}
          characterId={profile.character}
          playerName={profile.name}
          grade={profile.grade}
          totalStars={profile.totalStars}
          totalScore={profile.totalScore}
        />
      )}

      {/* 2. LEVEL SELECT MAP */}
      {screen === 'LEVEL_SELECT' && (
        <LevelMap
          profile={profile}
          onSelectLevel={handleStartLevel}
          onBackToTitle={() => setScreen('TITLE')}
          onChangeGrade={(grade) => {
            const updated = { ...profile, grade };
            setProfile(updated);
            savePlayerProfile(updated);
          }}
        />
      )}

      {/* 3. ACTIVE PLAYING CANVAS */}
      {(screen === 'PLAYING' || screen === 'PAUSED') && (
        <div className="relative w-full h-full">
          {/* Game HUD */}
          <HUD
            levelNumber={currentLevelConfig.id}
            levelTitle={currentLevelConfig.title}
            score={sessionScore}
            starsCollected={sessionStars}
            totalPuzzles={puzzles.length}
            currentPuzzleIndex={currentPuzzleIndex}
            soundEnabled={profile.soundEnabled}
            onToggleSound={handleToggleSound}
            onPause={() => setScreen('PAUSED')}
            onExitToMap={() => setScreen('LEVEL_SELECT')}
            onOpenBadges={() => setIsBadgesOpen(true)}
          />

          {/* 60FPS Adventure Canvas */}
          <GameCanvas
            characterId={profile.character}
            totalPuzzles={puzzles.length}
            currentPuzzleIndex={currentPuzzleIndex}
            isPuzzleActive={isPuzzleActive}
            onTriggerPuzzle={handleTriggerPuzzle}
            onCollectStar={handleCollectStar}
            onCompleteAdventure={() => handleCompleteLevel(sessionScore, correctFirstTries)}
          />

          {/* Interactive Math & Logic Puzzle Modal */}
          {isPuzzleActive && puzzles[currentPuzzleIndex] && (
            <PuzzleModal
              puzzle={puzzles[currentPuzzleIndex]}
              puzzleNumber={currentPuzzleIndex + 1}
              totalPuzzles={puzzles.length}
              onSolve={handleSolvePuzzle}
            />
          )}

          {/* Pause Modal */}
          {screen === 'PAUSED' && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none">
              <div className="w-full max-w-sm bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-6 text-center shadow-2xl space-y-3">
                <h3 className="text-xl font-black text-white">Petualangan Dijeda</h3>
                <p className="text-xs text-slate-300">
                  Tarik napas sejenak, sahabat rimba! Siap melanjutkan perjalanan?
                </p>
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setScreen('PLAYING');
                    }}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Lanjutkan</span>
                  </button>
                  <button
                    onClick={() => {
                      sound.playClick();
                      handleStartLevel(currentLevelId);
                    }}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Ulangi Level</span>
                  </button>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setScreen('LEVEL_SELECT');
                    }}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer"
                  >
                    <Map className="w-4 h-4" />
                    <span>Kembali ke Peta</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. LEVEL VICTORY SCREEN */}
      {screen === 'LEVEL_VICTORY' && (
        <VictoryModal
          level={currentLevelConfig}
          score={sessionScore}
          starsEarned={
            sessionScore >= currentLevelConfig.starThresholds[2]
              ? 3
              : sessionScore >= currentLevelConfig.starThresholds[1]
              ? 2
              : 1
          }
          accuracy={Math.round((correctFirstTries / Math.max(1, puzzles.length)) * 100)}
          newlyUnlockedBadges={newlyUnlockedBadges}
          hasNextLevel={currentLevelId < LEVELS.length}
          onNextLevel={() => handleStartLevel(currentLevelId + 1)}
          onReplay={() => handleStartLevel(currentLevelId)}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onBackToMap={() => setScreen('LEVEL_SELECT')}
        />
      )}

      {/* LEADERBOARD MODAL */}
      {isLeaderboardOpen && (
        <LeaderboardModal
          entries={leaderboardEntries}
          currentGrade={profile.grade}
          onClose={() => setIsLeaderboardOpen(false)}
          onOpenProfile={() => {
            setIsLeaderboardOpen(false);
            setIsProfileOpen(true);
          }}
        />
      )}

      {/* BADGES TROPHY ROOM MODAL */}
      {isBadgesOpen && (
        <BadgesModal
          unlockedBadgeIds={profile.unlockedBadges}
          onClose={() => setIsBadgesOpen(false)}
        />
      )}

      {/* PROFILE & CHARACTER SELECTION MODAL */}
      {isProfileOpen && (
        <ProfileModal
          profile={profile}
          onSave={(updated) => {
            const newProfile = { ...profile, ...updated };
            setProfile(newProfile);
            savePlayerProfile(newProfile);
          }}
          onClose={() => setIsProfileOpen(false)}
        />
      )}
    </div>
  );
}
