import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, User, Check, Sparkles } from 'lucide-react';
import { CharacterId, GradeLevel, PlayerProfile } from '../types/game';
import { CHARACTERS, GRADE_LEVELS } from '../utils/constants';
import { sound } from '../utils/audio';

interface ProfileModalProps {
  profile: PlayerProfile;
  onSave: (updated: Partial<PlayerProfile>) => void;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profile,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState<string>(profile.name);
  const [character, setCharacter] = useState<CharacterId>(profile.character);
  const [grade, setGrade] = useState<GradeLevel>(profile.grade);

  const handleSave = () => {
    sound.playClick();
    onSave({
      name: name.trim() || 'Petualang Cilik',
      character,
      grade,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md select-none">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/90 border-2 border-emerald-500/40 rounded-3xl shadow-2xl p-5 sm:p-6 flex flex-col max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <User className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>Profil Petualang Cilik</span>
              </h2>
              <p className="text-xs text-emerald-400 font-medium">
                Pilih sahabat hewan rimba & sesuaikan jenjang kelasmu!
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

        {/* Name input */}
        <div className="my-4">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Nama Petualang:
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            placeholder="Masukkan namamu..."
            className="w-full px-4 py-3 bg-slate-950 border-2 border-emerald-500/40 focus:border-emerald-400 rounded-2xl text-white font-bold text-base focus:outline-none transition-colors"
          />
        </div>

        {/* Character Selection */}
        <div className="my-2">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Pilih Sahabat Satwa Rimba:
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {Object.values(CHARACTERS).map((char) => {
              const isSelected = character === char.id;
              return (
                <button
                  key={char.id}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setCharacter(char.id);
                  }}
                  className={`p-3 rounded-2xl border-2 transition-all flex items-center gap-3 text-left cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-950 border-emerald-400 shadow-md ring-2 ring-emerald-400/30'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-emerald-500/40 shrink-0">
                    <img
                      src={char.avatarUrl}
                      alt={char.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-xs font-black text-white flex items-center gap-1">
                      <span>{char.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    </div>
                    <div className="text-[10px] text-emerald-300 font-semibold">{char.title}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Grade Selection */}
        <div className="my-3">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Jenjang Kelas Sekolah Dasar:
          </label>
          <div className="space-y-2">
            {GRADE_LEVELS.map((g) => {
              const isSelected = grade === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setGrade(g.id);
                  }}
                  className={`w-full p-3 rounded-2xl border-2 transition-all flex items-center justify-between text-left cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-950 border-emerald-400 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-xs font-black text-white">{g.label}</div>
                    <div className="text-[11px] text-slate-400">{g.sublabel}</div>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Save button */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-2xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>Simpan & Terapkan</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
