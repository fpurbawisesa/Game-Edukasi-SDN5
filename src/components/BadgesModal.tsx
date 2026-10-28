import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Award, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { Badge } from '../types/game';
import { BADGES, BADGE_TROPHY_IMG } from '../utils/constants';
import { sound } from '../utils/audio';

interface BadgesModalProps {
  unlockedBadgeIds: string[];
  onClose: () => void;
}

export const BadgesModal: React.FC<BadgesModalProps> = ({
  unlockedBadgeIds,
  onClose,
}) => {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const unlockedSet = new Set(unlockedBadgeIds);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md select-none">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/80 border-2 border-amber-500/40 rounded-3xl shadow-2xl p-5 sm:p-6 flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>Ruang Lencana & Trofi Rimba</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
              <p className="text-xs text-amber-300 font-medium">
                Koleksi medali kehormatan matematika & logikamu!
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

        {/* Hero Trophy Banner */}
        <div className="my-3 p-3.5 bg-gradient-to-r from-amber-950/90 via-slate-900 to-slate-900 border border-amber-500/40 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-400/50 shadow-md">
              <img
                src={BADGE_TROPHY_IMG}
                alt="Trofi Rimba"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="text-xs font-black text-amber-300 uppercase tracking-wider">
                Koleksi Prestasi
              </div>
              <div className="text-base font-black text-white">
                {unlockedBadgeIds.length} dari {BADGES.length} Lencana Terbuka
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-32 hidden sm:block">
            <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-500"
                style={{ width: `${(unlockedBadgeIds.length / BADGES.length) * 100}%` }}
              />
            </div>
            <div className="text-[10px] text-right text-amber-300 mt-1 font-bold">
              {Math.round((unlockedBadgeIds.length / BADGES.length) * 100)}% Lengkap
            </div>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-5 gap-3 p-1">
          {BADGES.map((badge) => {
            const isUnlocked = unlockedSet.has(badge.id);

            return (
              <button
                key={badge.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedBadge(badge);
                }}
                className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center text-center cursor-pointer relative group ${
                  isUnlocked
                    ? 'bg-slate-900/90 border-amber-500/50 hover:border-amber-400 hover:scale-105 shadow-md shadow-amber-500/10'
                    : 'bg-slate-950/70 border-slate-800 opacity-60 hover:opacity-80'
                }`}
              >
                {/* Badge Icon */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl mb-2 transition-transform ${
                    isUnlocked
                      ? 'bg-amber-500/20 border border-amber-400/60 shadow-inner group-hover:scale-110'
                      : 'bg-slate-800 border border-slate-700 text-slate-500'
                  }`}
                >
                  {isUnlocked ? badge.icon : <Lock className="w-5 h-5 text-slate-600" />}
                </div>

                <div className="text-xs font-bold text-white line-clamp-1">
                  {badge.title}
                </div>

                {isUnlocked ? (
                  <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Terbuka</span>
                  </div>
                ) : (
                  <div className="mt-1 text-[10px] text-slate-500 font-bold">
                    Terkunci
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Badge Detail Drawer / Footer Modal */}
        <AnimatePresence>
          {selectedBadge && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 p-3.5 bg-slate-950/90 border border-amber-500/40 rounded-2xl flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedBadge.icon}</span>
                <div>
                  <div className="text-xs font-black text-amber-300">
                    {selectedBadge.title}
                  </div>
                  <div className="text-[11px] text-slate-300 leading-snug">
                    {selectedBadge.description}
                  </div>
                </div>
              </div>

              <div className="shrink-0">
                {unlockedSet.has(selectedBadge.id) ? (
                  <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-400 text-emerald-300 rounded-lg text-xs font-black">
                    Diraih!
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-400 rounded-lg text-xs font-bold">
                    Belum Diraih
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
