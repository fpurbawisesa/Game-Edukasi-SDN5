import { PuzzleData, GradeLevel } from '../types/game';

// Helper to shuffle array
function shuffle<T>(arr: T[]): T[] {
  const res = [...arr];
  for (let i = res.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [res[i], res[j]] = [res[j], res[i]];
  }
  return res;
}

// Generate options containing correct answer and 3 sensible distractors
function createOptions(correct: number, rangeDelta = 4): { id: string; value: number; label: string }[] {
  const set = new Set<number>([correct]);
  let tries = 0;
  while (set.size < 4 && tries < 30) {
    tries++;
    const delta = (Math.floor(Math.random() * rangeDelta) + 1) * (Math.random() > 0.5 ? 1 : -1);
    const candidate = correct + delta;
    if (candidate >= 0 && candidate !== correct) {
      set.add(candidate);
    }
  }

  // Fallback if needed
  let fallback = correct + 1;
  while (set.size < 4) {
    if (fallback !== correct) set.add(fallback);
    fallback++;
  }

  return shuffle(Array.from(set)).map((val, idx) => ({
    id: `opt_${idx}_${val}`,
    value: val,
    label: val.toString(),
  }));
}

export function generatePuzzlesForLevel(levelId: number, grade: GradeLevel, count: number): PuzzleData[] {
  const puzzles: PuzzleData[] = [];

  for (let i = 0; i < count; i++) {
    puzzles.push(createPuzzleForStage(levelId, grade, i));
  }

  return puzzles;
}

function createPuzzleForStage(levelId: number, grade: GradeLevel, stageIndex: number): PuzzleData {
  const puzzleId = `lvl_${levelId}_stage_${stageIndex}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  // Tailor puzzle complexity based on grade
  const isEarlyGrade = grade === 'sd_1_2';
  const isHighGrade = grade === 'sd_5_6';

  // Choose puzzle mechanics based on level
  switch (levelId) {
    case 1: {
      // Penjumlahan dasar bergambar
      const maxNum = isEarlyGrade ? 10 : isHighGrade ? 35 : 20;
      const a = Math.floor(Math.random() * (maxNum - 2)) + 2;
      const b = Math.floor(Math.random() * (maxNum - 2)) + 1;
      const correct = a + b;

      return {
        id: puzzleId,
        type: 'crystal_gate',
        title: 'Gerbang Bintang Lumut',
        storyContext: 'Pintu gerbang pohon membutuhkan kombinasi batu cahaya yang tepat untuk terbuka!',
        question: `Berapa jumlah batu cahaya yang dibutuhkan: ${a} + ${b} = ?`,
        visualData: {
          operation: '+',
          num1: a,
          num2: b,
          icon: '💎',
        },
        options: createOptions(correct, isEarlyGrade ? 3 : 5),
        correctAnswer: correct,
        explanation: `Hebat! ${a} ditambah ${b} adalah tepat ${correct}. Gerbang terbuka!`,
        hint: `Coba hitung mulai dari ${a}, lalu maju sebanyak ${b} langkah!`,
      };
    }

    case 2: {
      // Pola bilangan batu loncat
      const step = isEarlyGrade ? (Math.random() > 0.5 ? 2 : 1) : Math.floor(Math.random() * 3) + 2;
      const start = Math.floor(Math.random() * 6) + 1;
      const length = 5;
      const missingIndex = 3; // 4th stone
      const sequence: (number | null)[] = [];

      for (let j = 0; j < length; j++) {
        sequence.push(start + j * step);
      }
      const correct = sequence[missingIndex] as number;
      sequence[missingIndex] = null; // hole to fill

      return {
        id: puzzleId,
        type: 'number_sequence',
        title: 'Batu Loncat Sungai Kristal',
        storyContext: 'Ada satu batu sungai yang hilang! Tebak angka batu yang hilang sesuai pola urutan.',
        question: `Lengkapi batu yang kosong agar kancil bisa melompat:`,
        visualData: {
          sequence,
          step,
          missingIndex,
        },
        options: createOptions(correct, step * 2),
        correctAnswer: correct,
        explanation: `Luar biasa! Pola angka ini selalu bertambah +${step}. Angka yang hilang adalah ${correct}.`,
        hint: `Perhatikan selisih antara batu pertama (${start}) dan batu kedua (${start + step})!`,
      };
    }

    case 3: {
      // Timbangan logika seimbang (Visual Balance Scale)
      // Left pan: fruit ? + known
      // Right pan: total
      const totalWeight = isEarlyGrade ? Math.floor(Math.random() * 8) + 6 : Math.floor(Math.random() * 16) + 10;
      const knownLeft = Math.floor(Math.random() * (totalWeight - 3)) + 1;
      const mystery = totalWeight - knownLeft;

      return {
        id: puzzleId,
        type: 'balance_scale',
        title: 'Timbangan Buah Dahan Purba',
        storyContext: 'Kedua sisi timbangan ranting harus memiliki berat yang sama agar dahan seimbang!',
        question: `Berapa berat buah misteri [ ? ] agar timbangan seimbang sempurna?`,
        visualData: {
          leftWeights: [knownLeft],
          mysteryPresentOnLeft: true,
          rightWeights: [totalWeight],
          leftSumDisplay: `? + ${knownLeft} kg`,
          rightSumDisplay: `${totalWeight} kg`,
          targetBalance: totalWeight,
          knownLeft,
        },
        options: createOptions(mystery, isEarlyGrade ? 3 : 5),
        correctAnswer: mystery,
        explanation: `Tepat sekali! ${mystery} + ${knownLeft} = ${totalWeight}. Timbangan kini seimbang rata!`,
        hint: `Kurangi total kanan (${totalWeight}) dengan berat buah yang diketahui (${knownLeft}).`,
      };
    }

    case 4: {
      // Pengurangan gerbang rune
      const maxSub = isEarlyGrade ? 15 : isHighGrade ? 60 : 35;
      const total = Math.floor(Math.random() * (maxSub - 6)) + 6;
      const minus = Math.floor(Math.random() * (total - 3)) + 1;
      const correct = total - minus;

      return {
        id: puzzleId,
        type: 'crystal_gate',
        title: 'Gua Zamrud Purba',
        storyContext: 'Rune batu membutuhkan pengurangan energi agar kunci permata dapat berputar.',
        question: `Selesaikan selisih batu rune berikut: ${total} - ${minus} = ?`,
        visualData: {
          operation: '-',
          num1: total,
          num2: minus,
          icon: '✨',
        },
        options: createOptions(correct, isEarlyGrade ? 3 : 6),
        correctAnswer: correct,
        explanation: `Hebat! ${total} dikurangi ${minus} menghasilkan ${correct}. Kunci berputar sempurna!`,
        hint: `Jika kamu punya ${total} buah dan memberikan ${minus} ke teman, sisa buahmu adalah jawabannya!`,
      };
    }

    case 5: {
      // Perkalian Totem Rimba
      const factor1 = isEarlyGrade ? Math.floor(Math.random() * 4) + 2 : Math.floor(Math.random() * 6) + 3;
      const factor2 = isEarlyGrade ? Math.floor(Math.random() * 4) + 2 : Math.floor(Math.random() * 7) + 3;
      const correct = factor1 * factor2;

      return {
        id: puzzleId,
        type: 'multiplication_totem',
        title: 'Obor Totem Dewa Rimba',
        storyContext: `Ada ${factor1} kelompok buah ek, masing-masing berisi ${factor2} biji ek emas!`,
        question: `Berapa jumlah seluruh biji ek: ${factor1} × ${factor2} = ?`,
        visualData: {
          groups: factor1,
          itemsPerGroup: factor2,
          icon: '🌰',
        },
        options: createOptions(correct, 8),
        correctAnswer: correct,
        explanation: `Keren sekali! ${factor1} dikali ${factor2} sama dengan ${correct} biji ek emas!`,
        hint: `Perkalian adalah penjumlahan berulang: hitung ${factor2} sebanyak ${factor1} kali!`,
      };
    }

    case 6: {
      // Pembagian Adil / Fair Share
      const shareWith = isEarlyGrade ? (Math.random() > 0.5 ? 2 : 3) : Math.floor(Math.random() * 4) + 2;
      const perAnimal = isEarlyGrade ? Math.floor(Math.random() * 4) + 2 : Math.floor(Math.random() * 6) + 3;
      const totalBerries = shareWith * perAnimal;

      return {
        id: puzzleId,
        type: 'fair_share',
        title: 'Pesta Buah Beri Ramah Satwa',
        storyContext: `Ada ${totalBerries} buah stroberi lezat yang akan dibagikan adil ke ${shareWith} sahabat satwa hutan.`,
        question: `Berapa banyak buah stroberi yang didapat setiap sahabat (${totalBerries} ÷ ${shareWith} = ?):`,
        visualData: {
          totalItems: totalBerries,
          recipientCount: shareWith,
          icon: '🍓',
        },
        options: createOptions(perAnimal, 3),
        correctAnswer: perAnimal,
        explanation: `Sangat adil! Setiap sahabat satwa menerima ${perAnimal} buah stroberi yang manis.`,
        hint: `Bagi ${totalBerries} buah sama rata menjadi ${shareWith} piring!`,
      };
    }

    case 7: {
      // Teka-teki simbol logika
      // 🍎 + 🍎 = 2a  => a
      // 🍎 + 🍌 = a + b => b
      // Berapa 🍌?
      const valA = Math.floor(Math.random() * 5) + 3; // 3 to 7
      const valB = Math.floor(Math.random() * 6) + 2; // 2 to 7
      const sum1 = valA + valA;
      const sum2 = valA + valB;

      return {
        id: puzzleId,
        type: 'symbol_logic',
        title: 'Misteri Simbol Pohon Penjaga',
        storyContext: 'Pecahkan nilai rahasia di balik simbol buah ajaib!',
        question: `Jika 🍎 + 🍎 = ${sum1}, dan 🍎 + 🍌 = ${sum2}, berapakah nilai 🍌?`,
        visualData: {
          clues: [
            { text: `🍎 + 🍎 = ${sum1}`, result: sum1 },
            { text: `🍎 + 🍌 = ${sum2}`, result: sum2 },
          ],
          symbolToFind: '🍌',
        },
        options: createOptions(valB, 3),
        correctAnswer: valB,
        explanation: `Pintar sekali! Karena 🍎 = ${valA}, maka 🍌 = ${sum2} - ${valA} = ${valB}.`,
        hint: `Cari tahu dulu nilai satu buah 🍎 dari baris pertama: setengah dari ${sum1} adalah berapa?`,
      };
    }

    case 8:
    default: {
      // Level 8: Mahkota Rimba - Mixed logic challenge
      const types = ['balance_scale', 'symbol_logic', 'multiplication_totem', 'crystal_gate'];
      const chosenType = types[stageIndex % types.length];

      if (chosenType === 'balance_scale') {
        const total = isEarlyGrade ? 14 : 28;
        const known = isEarlyGrade ? 6 : 12;
        const mystery = total - known;
        return {
          id: puzzleId,
          type: 'balance_scale',
          title: 'Ujian Mahkota: Timbangan Kristal Emas',
          storyContext: 'Ujian terakhir raja rimba! Seimbangkan timbangan suci mahkota.',
          question: `Berapa nilai [ ? ] agar timbangan seimbang: ? + ${known} = ${total}`,
          visualData: {
            leftWeights: [known],
            mysteryPresentOnLeft: true,
            rightWeights: [total],
            leftSumDisplay: `? + ${known} kg`,
            rightSumDisplay: `${total} kg`,
            targetBalance: total,
            knownLeft: known,
          },
          options: createOptions(mystery, 5),
          correctAnswer: mystery,
          explanation: `Luar biasa! ${mystery} + ${known} = ${total}. Gerbang mahkota bersinar terang!`,
          hint: `Hitung pengurangan ${total} - ${known}.`,
        };
      } else if (chosenType === 'symbol_logic') {
        const a = Math.floor(Math.random() * 4) + 4;
        const b = Math.floor(Math.random() * 5) + 3;
        const sum1 = a * 2;
        const sum2 = a + b;
        return {
          id: puzzleId,
          type: 'symbol_logic',
          title: 'Ujian Mahkota: Lambang Satwa Suci',
          storyContext: 'Dua lambang suci menjaga pintu mahkota emas.',
          question: `Jika 💎 + 💎 = ${sum1}, dan 💎 + 👑 = ${sum2}, berapakah nilai 👑?`,
          visualData: {
            clues: [
              { text: `💎 + 💎 = ${sum1}`, result: sum1 },
              { text: `💎 + 👑 = ${sum2}`, result: sum2 },
            ],
            symbolToFind: '👑',
          },
          options: createOptions(b, 4),
          correctAnswer: b,
          explanation: `Hebat! Nilai 💎 adalah ${a}, sehingga 👑 adalah ${b}!`,
          hint: `Bagi ${sum1} menjadi dua untuk menemukan nilai 💎.`,
        };
      } else {
        const m = Math.floor(Math.random() * 5) + 4;
        const n = Math.floor(Math.random() * 6) + 3;
        const correct = m * n;
        return {
          id: puzzleId,
          type: 'multiplication_totem',
          title: 'Ujian Mahkota: Kekuatan Bilangan',
          storyContext: 'Satukan kekuatan bilangan untuk menyalakan permata mahkota emas!',
          question: `Berapa hasil dari ${m} × ${n} = ?`,
          visualData: { groups: m, itemsPerGroup: n, icon: '⭐' },
          options: createOptions(correct, 8),
          correctAnswer: correct,
          explanation: `Sempurna! ${m} × ${n} = ${correct}! Kamu benar-benar juara rimba!`,
          hint: `Hitung perkalian ${m} kali ${n}.`,
        };
      }
    }
  }
}
