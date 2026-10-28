import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Trophy, Medal, Star, Award, User, Search } from 'lucide-react';
import { LeaderboardEntry, GradeLevel } from '../types/game';
import { CHARACTERS } from '../utils/constants';
import { sound } from '../utils/audio';

interface LeaderboardModalProps {
  entries: LeaderboardEntry[];
  currentGrade: GradeLevel;
  onClose: () => void;
  onOpenProfile: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  entries,
  currentGrade,
  onClose,
  onOpenProfile,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter entries
  const filtered = entries.filter((entry) => {
    if (selectedFilter !== 'all' && entry.grade !== selectedFilter) return false;
    if (searchQuery.trim() && !entry.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const playerRankEntry = entries.find((e) => e.isCurrentPlayer);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md select-none">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/90 border-2 border-emerald-500/40 rounded-3xl shadow-2xl p-5 sm:p-6 flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>Papan Peringkat Rimba</span>
              </h2>
              <p className="text-xs text-emerald-400 font-medium">
                Kompetisi skor & bintang antar petualang cilik se-Indonesia!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Player Standout Card */}
        {playerRankEntry && (
          <div className="my-3 p-3.5 bg-gradient-to-r from-emerald-950/90 to-teal-950/90 border-2 border-emerald-400 rounded-2xl flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/30 border border-emerald-400 flex items-center justify-center font-black text-emerald-300 text-sm">
                #{playerRankEntry.rank}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-emerald-400">Peringkat Kamu:</span>
                  <span className="text-sm font-black text-white">{playerRankEntry.name}</span>
                </div>
                <div className="text-[11px] text-slate-300 flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {playerRankEntry.stars} Bintang
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-cyan-300 font-bold">
                    <Award className="w-3.5 h-3.5" /> {playerRankEntry.badgesCount} Lencana
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Total Skor</div>
                <div className="text-base sm:text-lg font-black text-white tabular-nums">
                  {playerRankEntry.score.toLocaleString('id-ID')}
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenProfile();
                }}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold transition-transform active:scale-95 cursor-pointer"
              >
                Ganti Profil
              </button>
            </div>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 my-2">
          {/* Grade filter buttons */}
          <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
            {[
              { id: 'all', label: 'Semua Jenjang' },
              { id: 'sd_1_2', label: 'Kelas 1-2' },
              { id: 'sd_3_4', label: 'Kelas 3-4' },
              { id: 'sd_5_6', label: 'Kelas 5-6' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedFilter(f.id);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  selectedFilter === f.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Quick search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari teman..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Leaderboard Table List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-2">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              Tidak ada petualang ditemukan.
            </div>
          ) : (
            filtered.map((item) => {
              const char = CHARACTERS[item.character] || CHARACTERS.kancil;
              const isTop3 = item.rank && item.rank <= 3;

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    item.isCurrentPlayer
                      ? 'bg-emerald-950/60 border-emerald-400 shadow-md'
                      : isTop3
                      ? 'bg-slate-900/90 border-amber-500/40'
                      : 'bg-slate-900/50 border-slate-800'
                  }`}
                >
                  {/* Rank & Profile */}
                  <div className="flex items-center gap-3">
                    <div className="w-7 text-center">
                      {item.rank === 1 ? (
                        <span className="text-xl">🥇</span>
                      ) : item.rank === 2 ? (
                        <span className="text-xl">🥈</span>
                      ) : item.rank === 3 ? (
                        <span className="text-xl">🥉</span>
                      ) : (
                        <span className="font-extrabold text-slate-400 text-xs tabular-nums">
                          #{item.rank}
                        </span>
                      )}
                    </div>

                    <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0">
                      <img
                        src={char.avatarUrl}
                        alt={char.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white">
                          {item.name}
                        </span>
                        {item.isCurrentPlayer && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded px-1.5 py-0.2 font-black">
                            KAMU
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.grade === 'sd_1_2'
                          ? 'Kelas 1-2'
                          : item.grade === 'sd_3_4'
                          ? 'Kelas 3-4'
                          : 'Kelas 5-6'}
                        <span className="mx-1.5 text-slate-600">·</span>
                        <span className="text-amber-400 font-bold">{item.stars} ⭐</span>
                        <span className="mx-1.5 text-slate-600">·</span>
                        <span className="text-cyan-300 font-bold">{item.badgesCount} 🏅</span>
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <span className="text-sm sm:text-base font-black text-amber-300 tabular-nums">
                      {item.score.toLocaleString('id-ID')}
                    </span>
                    <span className="block text-[9px] uppercase font-bold text-slate-500">
                      Poin
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
};
