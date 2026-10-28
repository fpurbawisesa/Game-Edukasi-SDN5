import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, HelpCircle, CheckCircle, ArrowRight, Lightbulb } from 'lucide-react';
import { PuzzleData } from '../types/game';
import { sound } from '../utils/audio';

interface PuzzleModalProps {
  puzzle: PuzzleData;
  puzzleNumber: number;
  totalPuzzles: number;
  onSolve: (isCorrectFirstTry: boolean, timeSpentSeconds: number) => void;
}

export const PuzzleModal: React.FC<PuzzleModalProps> = ({
  puzzle,
  puzzleNumber,
  totalPuzzles,
  onSolve,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [firstTryFailed, setFirstTryFailed] = useState<boolean>(false);
  const [startTime] = useState<number>(Date.now());

  const handleSelectOption = (value: number) => {
    if (isAnswered && isCorrect) return;

    setSelectedAnswer(value);
    const correct = value === puzzle.correctAnswer;

    if (correct) {
      sound.playCorrect();
      setIsCorrect(true);
      setIsAnswered(true);
    } else {
      sound.playWrong();
      setIsCorrect(false);
      setIsAnswered(true);
      setFirstTryFailed(true);
    }
  };

  const handleProceed = () => {
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    onSolve(!firstTryFailed, elapsedSeconds);
  };

  // Helper renderers for visual interactive models
  const renderVisualData = () => {
    switch (puzzle.type) {
      case 'balance_scale': {
        const { leftSumDisplay, rightSumDisplay, targetBalance, knownLeft } = puzzle.visualData;
        const currentLeftWeight = selectedAnswer !== null ? selectedAnswer + knownLeft : knownLeft;
        const tilt = selectedAnswer !== null
          ? currentLeftWeight === targetBalance
            ? 0
            : currentLeftWeight < targetBalance
            ? -12
            : 12
          : -8;

        return (
          <div className="my-3 p-4 bg-slate-900/80 rounded-2xl border border-amber-500/30 flex flex-col items-center">
            <div className="text-xs font-semibold text-amber-300 mb-2">Timbangan Ranting Rimba</div>
            {/* Visual Balance Scale SVG */}
            <div className="relative w-64 h-32 flex flex-col items-center justify-end">
              {/* Fulcrum base */}
              <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[36px] border-b-amber-700 mx-auto" />
              <div className="w-16 h-2 bg-amber-900 rounded-full" />

              {/* Tilting beam */}
              <div
                className="absolute top-8 w-56 h-3 bg-amber-600 rounded-full transition-transform duration-500 flex justify-between items-center px-1"
                style={{ transform: `rotate(${tilt}deg)` }}
              >
                {/* Left Pan */}
                <div className="relative -bottom-16 -left-3 flex flex-col items-center">
                  <div className="w-0.5 h-12 bg-amber-400" />
                  <div className="w-20 h-6 bg-emerald-800 border-2 border-emerald-400 rounded-b-xl flex items-center justify-center shadow-lg">
                    <span className="text-[11px] font-bold text-white">
                      {selectedAnswer !== null ? `? (${selectedAnswer})` : '?'} + {knownLeft}kg
                    </span>
                  </div>
                </div>

                {/* Center Pivot */}
                <div className="w-4 h-4 bg-amber-400 rounded-full border-2 border-amber-900 shadow" />

                {/* Right Pan */}
                <div className="relative -bottom-16 -right-3 flex flex-col items-center">
                  <div className="w-0.5 h-12 bg-amber-400" />
                  <div className="w-20 h-6 bg-amber-800 border-2 border-amber-400 rounded-b-xl flex items-center justify-center shadow-lg">
                    <span className="text-[11px] font-bold text-white">{targetBalance} kg</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-6 text-xs text-slate-300">
              <span className="text-emerald-400 font-semibold">Sisi Kiri: {leftSumDisplay}</span>
              <span className="text-amber-400 font-semibold">Sisi Kanan: {rightSumDisplay}</span>
            </div>
          </div>
        );
      }

      case 'number_sequence': {
        const { sequence, missingIndex } = puzzle.visualData;
        return (
          <div className="my-3 p-4 bg-slate-900/80 rounded-2xl border border-cyan-500/30">
            <div className="text-xs font-semibold text-cyan-300 text-center mb-3">
              Batu Pijakan Sungai Berpola
            </div>
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              {sequence.map((val: number | null, idx: number) => {
                const isHole = idx === missingIndex;
                const filledValue = isHole ? selectedAnswer : val;

                return (
                  <div
                    key={idx}
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-black text-lg sm:text-xl transition-all shadow-md ${
                      isHole
                        ? filledValue !== null
                          ? isCorrect
                            ? 'bg-emerald-600 text-white border-2 border-emerald-300 animate-bounce'
                            : 'bg-rose-900/80 text-rose-200 border-2 border-rose-400'
                          : 'bg-slate-800/90 text-amber-400 border-2 border-dashed border-amber-400/80 animate-pulse'
                        : 'bg-gradient-to-br from-cyan-900 to-slate-800 text-cyan-200 border border-cyan-500/40'
                    }`}
                  >
                    {isHole ? (filledValue !== null ? filledValue : '?') : val}
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      case 'multiplication_totem': {
        const { groups, itemsPerGroup, icon } = puzzle.visualData;
        return (
          <div className="my-3 p-4 bg-slate-900/80 rounded-2xl border border-purple-500/30">
            <div className="text-xs font-semibold text-purple-300 text-center mb-2">
              Kelompok Buah Hutan ({groups} keranjang × {itemsPerGroup} buah)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 justify-items-center">
              {Array.from({ length: groups }).map((_, gIdx) => (
                <div
                  key={gIdx}
                  className="bg-purple-950/60 border border-purple-500/40 rounded-xl p-2 flex flex-col items-center w-full"
                >
                  <span className="text-[10px] text-purple-300 font-bold mb-1">
                    Kelompok {gIdx + 1}
                  </span>
                  <div className="flex flex-wrap gap-1 justify-center max-w-[100px]">
                    {Array.from({ length: itemsPerGroup }).map((_, iIdx) => (
                      <span key={iIdx} className="text-base sm:text-lg">
                        {icon}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'fair_share': {
        const { totalItems, recipientCount, icon } = puzzle.visualData;
        return (
          <div className="my-3 p-4 bg-slate-900/80 rounded-2xl border border-pink-500/30 text-center">
            <div className="text-xs font-semibold text-pink-300 mb-2">
              Total {totalItems} Buah Dibagi untuk {recipientCount} Sahabat
            </div>
            <div className="flex flex-wrap gap-1 justify-center max-w-sm mx-auto mb-3">
              {Array.from({ length: totalItems }).map((_, idx) => (
                <span key={idx} className="text-base sm:text-lg">
                  {icon}
                </span>
              ))}
            </div>
          </div>
        );
      }

      case 'symbol_logic': {
        const { clues } = puzzle.visualData;
        return (
          <div className="my-3 p-4 bg-slate-900/80 rounded-2xl border border-indigo-500/30 flex flex-col items-center">
            <div className="text-xs font-semibold text-indigo-300 mb-2">Petunjuk Simbol Rimba</div>
            <div className="space-y-1.5 w-full max-w-xs">
              {clues.map((clue: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-indigo-950/60 border border-indigo-500/30 rounded-xl px-3 py-1.5 text-center text-sm sm:text-base font-bold text-indigo-100"
                >
                  {clue.text}
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'crystal_gate':
      default: {
        const { operation, num1, num2, icon } = puzzle.visualData;
        return (
          <div className="my-3 p-4 bg-slate-900/80 rounded-2xl border border-emerald-500/30 flex items-center justify-center gap-3">
            <div className="px-4 py-3 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-xl sm:text-2xl font-black text-emerald-300 flex items-center gap-2">
              <span>{num1}</span>
              <span className="text-xs">{icon}</span>
            </div>
            <div className="text-2xl font-black text-amber-400">{operation}</div>
            <div className="px-4 py-3 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-xl sm:text-2xl font-black text-emerald-300 flex items-center gap-2">
              <span>{num2}</span>
              <span className="text-xs">{icon}</span>
            </div>
            <div className="text-2xl font-black text-amber-400">=</div>
            <div className="w-14 h-14 bg-slate-800 border-2 border-dashed border-amber-400 rounded-2xl flex items-center justify-center text-xl font-black text-amber-300">
              {selectedAnswer !== null ? selectedAnswer : '?'}
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 24, stiffness: 300 }}
        className="w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950 border-2 border-emerald-500/50 rounded-3xl shadow-2xl p-5 sm:p-6 overflow-hidden relative"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Gerbang Teka-Teki {puzzleNumber} dari {totalPuzzles}
              </span>
              <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                {puzzle.title}
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setShowHint(!showHint);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold transition-colors"
            title="Lihat Petunjuk"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Petunjuk</span>
          </button>
        </div>

        {/* Story context */}
        <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
          {puzzle.storyContext}
        </p>

        {/* Visual interactive section */}
        {renderVisualData()}

        {/* Question Title */}
        <div className="text-center font-bold text-sm sm:text-base text-emerald-200 my-2">
          {puzzle.question}
        </div>

        {/* Hint banner if requested */}
        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-amber-950/60 border border-amber-500/40 rounded-xl p-2.5 text-xs text-amber-200 mb-3 flex items-start gap-2"
            >
              <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{puzzle.hint}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Answer Options Grid (4 options) */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 my-3">
          {puzzle.options.map((opt) => {
            const isSelected = selectedAnswer === opt.value;
            let btnClass = 'bg-slate-800/90 border-slate-700 text-slate-100 hover:bg-emerald-950 hover:border-emerald-500';

            if (isSelected) {
              if (isCorrect) {
                btnClass = 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-500/30';
              } else {
                btnClass = 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-500/30';
              }
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt.value)}
                disabled={isAnswered && isCorrect}
                className={`py-3 px-4 rounded-2xl border-2 font-black text-lg sm:text-xl transition-all duration-150 active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${btnClass}`}
              >
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback Section */}
        {isAnswered && (
          <div
            className={`p-3 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center justify-between gap-2 mt-2 ${
              isCorrect
                ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200'
                : 'bg-rose-950/90 border-rose-400 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {isCorrect ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <HelpCircle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <span>
                {isCorrect
                  ? puzzle.explanation
                  : 'Hampir tepat! Ayo coba pilihan lain atau gunakan tombol petunjuk di atas!'}
              </span>
            </div>

            {isCorrect && (
              <button
                onClick={handleProceed}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-xl flex items-center gap-1.5 shadow-lg active:scale-95 transition-transform shrink-0"
              >
                <span>Lanjut</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
