import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Lock, Star, Play, Sparkles } from 'lucide-react';
import { LEVELS, GRADE_LEVELS } from '../utils/constants';
import { PlayerProfile, GradeLevel } from '../types/game';
import { sound } from '../utils/audio';

interface LevelMapProps {
  profile: PlayerProfile;
  onSelectLevel: (levelId: number) => void;
  onBackToTitle: () => void;
  onChangeGrade: (grade: GradeLevel) => void;
}

export const LevelMap: React.FC<LevelMapProps> = ({
  profile,
  onSelectLevel,
  onBackToTitle,
  onChangeGrade,
}) => {
  return (
    <div className="relative w-full h-full min-h-screen bg-slate-950 flex flex-col justify-between overflow-y-auto select-none p-4 sm:p-6">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/40 via-slate-950 to-slate-950 z-0" />

      {/* Header bar */}
      <header className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-emerald-900/40">
        <button
          onClick={() => {
            sound.playClick();
            onBackToTitle();
          }}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          <span>Menu Utama</span>
        </button>

        <div className="text-center">
          <h1 className="text-lg sm:text-xl font-black text-white flex items-center justify-center gap-2">
            <span>Peta Ekspedisi Rimba</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </h1>
          <p className="text-xs text-emerald-400 font-medium">
            Pilih gerbang hutan yang ingin kamu taklukkan!
          </p>
        </div>

        {/* Grade Level Selector */}
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700 p-1 rounded-xl">
          {GRADE_LEVELS.map((g) => (
            <button
              key={g.id}
              onClick={() => {
                sound.playClick();
                onChangeGrade(g.id);
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                profile.grade === g.id
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {g.id === 'sd_1_2' ? 'Kelas 1-2' : g.id === 'sd_3_4' ? 'Kelas 3-4' : 'Kelas 5-6'}
            </button>
          ))}
        </div>
      </header>

      {/* Levels Grid Map */}
      <main className="relative z-10 my-6 max-w-5xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {LEVELS.map((level, idx) => {
          const progress = profile.levelProgress[level.id] || {
            unlocked: level.id === 1,
            stars: 0,
            highScore: 0,
          };
          const isUnlocked = progress.unlocked || level.id === 1;

          return (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`relative rounded-3xl p-5 border-2 transition-all flex flex-col justify-between overflow-hidden ${
                isUnlocked
                  ? 'bg-slate-900/90 border-emerald-500/50 hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                  : 'bg-slate-950/70 border-slate-800 opacity-60'
              }`}
            >
              {/* Card top */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-[11px] font-black uppercase px-2 py-0.5 rounded-md"
                    style={{ backgroundColor: `${level.themeColor}25`, color: level.themeColor }}
                  >
                    Level {level.id}
                  </span>

                  {/* Stars counter */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((starIdx) => (
                      <Star
                        key={starIdx}
                        className={`w-3.5 h-3.5 ${
                          progress.stars >= starIdx
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-white mb-1">{level.title}</h3>
                <div className="text-[11px] text-emerald-400 font-semibold mb-2">
                  {level.zoneName}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {level.description}
                </p>
              </div>

              {/* Card bottom */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Skor Tertinggi</div>
                  <div className="text-xs font-black text-amber-300 tabular-nums">
                    {progress.highScore > 0 ? progress.highScore.toLocaleString('id-ID') : '-'}
                  </div>
                </div>

                {isUnlocked ? (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onSelectLevel(level.id);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs flex items-center gap-1 shadow-md active:scale-95 transition-transform cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Mulai</span>
                  </button>
                ) : (
                  <div className="p-2 rounded-xl bg-slate-800 text-slate-500 flex items-center gap-1 text-xs font-bold">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Terkunci</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </main>

      {/* Progress Footer Bar */}
      <footer className="relative z-10 max-w-5xl mx-auto w-full pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span>
            Total Bintang: <strong className="text-amber-400 font-black tabular-nums">{profile.totalStars}</strong>
          </span>
          <span>
            Total Skor: <strong className="text-emerald-400 font-black tabular-nums">{profile.totalScore.toLocaleString('id-ID')}</strong>
          </span>
          <span>
            Lencana Diraih: <strong className="text-cyan-400 font-black tabular-nums">{profile.unlockedBadges.length}</strong> / 10
          </span>
        </div>
        <div className="text-slate-500 text-[11px]">
          Selesaikan setiap level dengan skor tinggi untuk meraih 3 bintang emas!
        </div>
      </footer>
    </div>
  );
};
