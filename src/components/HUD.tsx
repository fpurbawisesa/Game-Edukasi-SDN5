import React from 'react';
import { Volume2, VolumeX, Pause, Map, Star, Award } from 'lucide-react';
import { sound } from '../utils/audio';

interface HUDProps {
  levelNumber: number;
  levelTitle: string;
  score: number;
  starsCollected: number;
  totalPuzzles: number;
  currentPuzzleIndex: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onPause: () => void;
  onExitToMap: () => void;
  onOpenBadges?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  levelNumber,
  levelTitle,
  score,
  starsCollected,
  totalPuzzles,
  currentPuzzleIndex,
  soundEnabled,
  onToggleSound,
  onPause,
  onExitToMap,
  onOpenBadges,
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 pointer-events-none p-3 sm:p-5 flex items-start justify-between">
      {/* Left perimeter: Navigation & Level Info */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          onClick={() => {
            sound.playClick();
            onExitToMap();
          }}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-100 rounded-xl shadow-lg backdrop-blur-md transition-transform active:scale-95 text-xs font-semibold"
          title="Kembali ke Peta Level"
        >
          <Map className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">Peta Rimba</span>
        </button>

        <div className="bg-slate-950/80 border border-slate-700/50 rounded-xl px-3 py-1.5 backdrop-blur-md shadow-lg">
          <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
            Level {levelNumber}
          </div>
          <div className="text-xs sm:text-sm font-bold text-slate-100 truncate max-w-[130px] sm:max-w-[200px]">
            {levelTitle}
          </div>
        </div>
      </div>

      {/* Center perimeter: Checkpoint Progress & Score */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <div className="flex items-center gap-1.5 bg-slate-950/80 border border-amber-500/40 rounded-xl px-3 py-1.5 backdrop-blur-md shadow-lg">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
          <span className="text-xs sm:text-sm font-extrabold text-amber-300 tabular-nums">
            {starsCollected}
          </span>
        </div>

        <div className="bg-slate-950/80 border border-emerald-500/40 rounded-xl px-3 py-1.5 backdrop-blur-md shadow-lg">
          <span className="text-[10px] text-emerald-400 font-medium mr-1.5">SKOR</span>
          <span className="text-xs sm:text-sm font-black text-white tabular-nums tracking-wide">
            {score.toLocaleString('id-ID')}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1 bg-slate-950/80 border border-slate-700/50 rounded-xl px-3 py-1.5 backdrop-blur-md text-xs font-medium text-slate-300">
          <span className="text-emerald-400">Gerbang:</span>
          <span className="font-bold tabular-nums text-white">
            {Math.min(currentPuzzleIndex + 1, totalPuzzles)}/{totalPuzzles}
          </span>
        </div>
      </div>

      {/* Right perimeter: Actions & Sound Toggle */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {onOpenBadges && (
          <button
            onClick={() => {
              sound.playClick();
              onOpenBadges();
            }}
            className="p-2 bg-slate-950/80 hover:bg-slate-900 border border-amber-500/30 text-amber-300 rounded-xl backdrop-blur-md transition-transform active:scale-95 shadow-lg"
            title="Koleksi Lencana"
          >
            <Award className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={() => {
            sound.playClick();
            onToggleSound();
          }}
          className="p-2 bg-slate-950/80 hover:bg-slate-900 border border-slate-700/50 text-slate-200 rounded-xl backdrop-blur-md transition-transform active:scale-95 shadow-lg"
          title={soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-rose-400" />
          )}
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onPause();
          }}
          className="p-2 bg-slate-950/80 hover:bg-slate-900 border border-slate-700/50 text-slate-200 rounded-xl backdrop-blur-md transition-transform active:scale-95 shadow-lg"
          title="Jeda Petualangan"
        >
          <Pause className="w-4 h-4 text-slate-200" />
        </button>
      </div>
    </header>
  );
};
