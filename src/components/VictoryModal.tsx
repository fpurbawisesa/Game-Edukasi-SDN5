import React from 'react';
import { motion } from 'motion/react';
import { Star, Trophy, ArrowRight, RotateCcw, Map, Award } from 'lucide-react';
import { Badge, LevelConfig } from '../types/game';
import { sound } from '../utils/audio';

interface VictoryModalProps {
  level: LevelConfig;
  score: number;
  starsEarned: number;
  accuracy: number;
  newlyUnlockedBadges: Badge[];
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onReplay: () => void;
  onOpenLeaderboard: () => void;
  onBackToMap: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  level,
  score,
  starsEarned,
  accuracy,
  newlyUnlockedBadges,
  hasNextLevel,
  onNextLevel,
  onReplay,
  onOpenLeaderboard,
  onBackToMap,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 260 }}
        className="w-full max-w-md bg-gradient-to-b from-slate-900 via-emerald-950/80 to-slate-950 border-2 border-emerald-500/50 rounded-3xl p-6 shadow-2xl text-center relative overflow-hidden"
      >
        {/* Subtle celebratory ambient glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Level Tag & Title */}
        <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950 border border-emerald-500/30 px-3 py-1 rounded-full">
          Level {level.id} Selesai!
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-white mt-2 mb-1">
          {level.title}
        </h2>
        <p className="text-xs text-slate-300 mb-5">
          {level.zoneName} berhasil kamu lintasi dengan luar biasa!
        </p>

        {/* 3 Stars Animation */}
        <div className="flex items-center justify-center gap-3 my-4">
          {[1, 2, 3].map((starIdx) => {
            const hasStar = starsEarned >= starIdx;
            return (
              <motion.div
                key={starIdx}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: hasStar ? 1.2 : 1, rotate: 0 }}
                transition={{
                  delay: 0.2 + starIdx * 0.15,
                  type: 'spring',
                  stiffness: 300,
                  damping: 15,
                }}
                className="relative"
              >
                <Star
                  className={`w-10 h-10 sm:w-12 sm:h-12 ${
                    hasStar
                      ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                      : 'text-slate-700'
                  }`}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Score & Accuracy Breakdown */}
        <div className="grid grid-cols-2 gap-3 my-4 p-3 bg-slate-950/70 border border-slate-800 rounded-2xl">
          <div className="text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Skor</div>
            <div className="text-lg font-black text-emerald-300 tabular-nums">
              {score.toLocaleString('id-ID')}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Akurasi Hitung</div>
            <div className="text-lg font-black text-amber-300 tabular-nums">
              {accuracy}%
            </div>
          </div>
        </div>

        {/* Newly Unlocked Badges Celebration */}
        {newlyUnlockedBadges.length > 0 && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="my-4 p-3.5 bg-gradient-to-r from-amber-950/80 to-yellow-950/80 border border-amber-500/50 rounded-2xl text-left flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-2xl shrink-0">
              {newlyUnlockedBadges[0].icon}
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-400 tracking-wider">
                <Award className="w-3.5 h-3.5" />
                <span>Lencana Baru Terbuka!</span>
              </div>
              <div className="text-sm font-black text-white">
                {newlyUnlockedBadges[0].title}
              </div>
              <div className="text-[11px] text-amber-200/90 leading-tight">
                {newlyUnlockedBadges[0].description}
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 mt-5">
          {hasNextLevel && (
            <button
              onClick={() => {
                sound.playClick();
                onNextLevel();
              }}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform cursor-pointer"
            >
              <span>Lanjut ke Level Berikutnya</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onReplay();
              }}
              className="py-2.5 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-transform cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Main Lagi</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onOpenLeaderboard();
              }}
              className="py-2.5 px-2 bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-amber-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-transform cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Peringkat</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onBackToMap();
              }}
              className="py-2.5 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-transform cursor-pointer"
            >
              <Map className="w-3.5 h-3.5" />
              <span>Peta Level</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
