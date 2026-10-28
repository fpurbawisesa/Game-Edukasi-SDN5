import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, Map, Trophy, Award, User, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { HERO_BANNER_IMG, CHARACTERS } from '../utils/constants';
import { CharacterId, GradeLevel } from '../types/game';
import { sound } from '../utils/audio';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenMap: () => void;
  onOpenLeaderboard: () => void;
  onOpenBadges: () => void;
  onOpenProfile: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  characterId: CharacterId;
  playerName: string;
  grade: GradeLevel;
  totalStars: number;
  totalScore: number;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenMap,
  onOpenLeaderboard,
  onOpenBadges,
  onOpenProfile,
  soundEnabled,
  onToggleSound,
  characterId,
  playerName,
  grade,
  totalStars,
  totalScore,
}) => {
  // Listen for Enter or Space to quickly start
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        sound.playClick();
        onStartGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame]);

  const activeChar = CHARACTERS[characterId] || CHARACTERS.kancil;

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-950 flex flex-col justify-between overflow-hidden select-none">
      {/* Background Hero Illustration with Atmospheric Gradient Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={HERO_BANNER_IMG}
          alt="Rimba Matematika Petualangan"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-35 scale-105 transition-transform duration-10000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-emerald-950/40" />
      </div>

      {/* Top Bar Navigation Contract: 3-Zone Clean Header */}
      <header className="relative z-20 flex items-center justify-between gap-8 px-6 py-4">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg">
            <img
              src={activeChar.avatarUrl}
              alt={activeChar.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-[10px]"
            />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              {playerName || 'Petualang Cilik'}
            </div>
            <div className="text-[11px] text-slate-400">
              {grade === 'sd_1_2' ? 'SD Kelas 1-2' : grade === 'sd_3_4' ? 'SD Kelas 3-4' : 'SD Kelas 5-6'}
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-300">
          <button
            onClick={() => {
              sound.playClick();
              onOpenMap();
            }}
            className="hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Map className="w-4 h-4 text-emerald-400" />
            <span>Peta Level</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onOpenLeaderboard();
            }}
            className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Papan Peringkat</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onOpenBadges();
            }}
            className="hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Award className="w-4 h-4 text-cyan-400" />
            <span>Ruang Lencana</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onOpenProfile();
            }}
            className="hover:text-pink-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <User className="w-4 h-4 text-pink-400" />
            <span>Ganti Karakter</span>
          </button>
        </nav>

        {/* Zone 3: Quick Stats & Audio Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-amber-500/30 rounded-xl text-xs font-bold text-amber-300">
            <span>⭐ {totalStars}</span>
            <span className="text-slate-500">·</span>
            <span className="tabular-nums font-black text-white">{totalScore} Poin</span>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onToggleSound();
            }}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-colors cursor-pointer"
            title={soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-rose-400" />
            )}
          </button>
        </div>
      </header>

      {/* Hero Centerpiece: Bespoke SVG Title Lockup with 35% Negative Space */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-2"
        >
          {/* Bespoke inline SVG Logo Title Lockup */}
          <svg
            className="w-full max-w-md sm:max-w-xl mx-auto h-auto filter drop-shadow-[0_8px_24px_rgba(16,185,129,0.35)]"
            viewBox="0 0 600 130"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Foliage vine embellishments */}
            <path
              d="M 50 110 Q 150 125 300 120 Q 450 115 550 110"
              stroke="#059669"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M 80 112 Q 95 98 105 110 Q 120 95 130 113"
              fill="#10b981"
            />
            <path
              d="M 470 113 Q 485 95 495 110 Q 510 98 520 112"
              fill="#10b981"
            />

            {/* Title Text Gradient */}
            <defs>
              <linearGradient id="rimbaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#A7F3D0" />
                <stop offset="45%" stopColor="#34D399" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="100%" stopColor="#EAB308" />
              </linearGradient>
            </defs>

            {/* RIMBA text */}
            <text
              x="300"
              y="65"
              textAnchor="middle"
              fill="url(#rimbaGrad)"
              fontFamily="Outfit, sans-serif"
              fontSize="54"
              fontWeight="900"
              letterSpacing="6"
            >
              RIMBA MATEMATIKA
            </text>

            {/* PETUALANGAN SATWA PINTAR text */}
            <text
              x="300"
              y="102"
              textAnchor="middle"
              fill="url(#goldGrad)"
              fontFamily="Plus Jakarta Sans, sans-serif"
              fontSize="20"
              fontWeight="800"
              letterSpacing="4"
            >
              PETUALANGAN SATWA PINTAR
            </text>
          </svg>
        </motion.div>

        {/* Narrative Kicker */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8 font-medium leading-relaxed"
        >
          Lintasi hutan ajaib, pecahkan gerbang angka interaktif, raih lencana prestasi berkilau, dan jadilah juara nomor satu di papan peringkat bersama teman sekolahmu!
        </motion.p>

        {/* Primary Start CTA Button */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.45, type: 'spring' }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md"
        >
          <button
            onClick={() => {
              sound.playClick();
              onStartGame();
            }}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-lg sm:text-xl shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center justify-center gap-3 transition-transform hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Play className="w-6 h-6 fill-slate-950" />
            <span>Mulai Petualangan</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenMap();
            }}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border-2 border-emerald-500/40 text-emerald-200 font-bold text-base flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Map className="w-5 h-5 text-emerald-400" />
            <span>Pilih Level</span>
          </button>
        </motion.div>

        {/* Mobile Quick Action Buttons Bar */}
        <div className="grid grid-cols-3 gap-2 w-full max-w-sm mt-6 md:hidden">
          <button
            onClick={() => {
              sound.playClick();
              onOpenLeaderboard();
            }}
            className="p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-xs font-bold text-amber-300 flex flex-col items-center gap-1 active:scale-95"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Peringkat</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onOpenBadges();
            }}
            className="p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-xs font-bold text-cyan-300 flex flex-col items-center gap-1 active:scale-95"
          >
            <Award className="w-4 h-4 text-cyan-400" />
            <span>Lencana</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onOpenProfile();
            }}
            className="p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-xs font-bold text-emerald-300 flex flex-col items-center gap-1 active:scale-95"
          >
            <User className="w-4 h-4 text-emerald-400" />
            <span>Karakter</span>
          </button>
        </div>
      </main>

      {/* Footer: Single Flat Control-Hint Line as per Guidelines */}
      <footer className="relative z-10 py-4 px-6 border-t border-emerald-950/80 text-center">
        <div className="text-xs font-semibold text-emerald-400/80 tracking-wide">
          Tombol Panah / A-D Gerak · Spasi Lompat · Klik untuk Pecahkan Teka-Teki · Enter / Spasi Mulai
        </div>
      </footer>
    </div>
  );
};
