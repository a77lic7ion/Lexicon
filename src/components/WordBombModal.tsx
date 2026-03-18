import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LetterTile, BOMB_EFFECTS } from '../constants';
import { isValidWord } from '../utils/dictionary';
import { X, Zap, Target, Eye, Wind, Skull, Trash2 } from 'lucide-react';

interface WordBombModalProps {
  isOpen: boolean;
  onClose: () => void;
  bank: LetterTile[];
  onExecute: (word: string, target: { row?: number; col?: number; cell?: { r: number; c: number } }) => void;
  playedWords: string[];
}

export const WordBombModal: React.FC<WordBombModalProps> = ({ isOpen, onClose, bank, onExecute, playedWords }) => {
  const [word, setWord] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [targetType, setTargetType] = useState<'row' | 'col' | 'cell' | 'none'>('none');
  const [targetValue, setTargetValue] = useState<number | { r: number; c: number } | null>(null);

  const wordLen = word.trim().length;
  const effect = BOMB_EFFECTS[wordLen as keyof typeof BOMB_EFFECTS] || (wordLen >= 8 ? BOMB_EFFECTS[8] : null);

  useEffect(() => {
    if (wordLen === 3 || wordLen === 5 || wordLen >= 8) {
      setTargetType('row'); // Default to row
    } else if (wordLen === 4 || wordLen === 6) {
      setTargetType('cell');
    } else {
      setTargetType('none');
    }
    setTargetValue(null);
  }, [wordLen]);

  const validate = () => {
    const upperWord = word.trim().toUpperCase();
    if (!isValidWord(upperWord)) return 'Invalid word';
    if (playedWords.includes(upperWord)) return 'Word already played';
    
    // Check bank
    const bankLetters = bank.map(l => l.letter);
    const tempBank = [...bankLetters];
    for (const char of upperWord.split('')) {
      const idx = tempBank.indexOf(char);
      if (idx === -1) {
        const wildIdx = tempBank.indexOf('★');
        if (wildIdx === -1) return 'Missing letters in bank';
        tempBank.splice(wildIdx, 1);
      } else {
        tempBank.splice(idx, 1);
      }
    }

    if (targetType !== 'none' && targetValue === null) return 'Select a target';

    return null;
  };

  const handleExecute = () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    const target: any = {};
    if (targetType === 'row') target.row = targetValue as number;
    if (targetType === 'col') target.col = targetValue as number;
    if (targetType === 'cell') target.cell = targetValue as { r: number; c: number };

    onExecute(word.trim().toUpperCase(), target);
    setWord('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        <div className="p-6 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-500" />
              CAST WORD BOMB
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
              Enter Word
            </label>
            <input
              autoFocus
              type="text"
              value={word}
              onChange={(e) => {
                setWord(e.target.value.toUpperCase());
                setError(null);
              }}
              placeholder="TYPE YOUR WEAPON..."
              className="w-full bg-slate-950 border-2 border-slate-800 rounded-xl p-4 text-2xl font-serif font-bold text-white placeholder:text-slate-800 focus:border-yellow-500/50 focus:outline-none transition-colors"
            />
            {error && <span className="text-xs font-mono font-bold text-red-500">{error}</span>}
          </div>

          {effect && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-serif font-bold text-yellow-500 uppercase tracking-widest">
                  {effect.name} (Tier {wordLen})
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-600">
                  {wordLen} LETTERS SPENT
                </span>
              </div>
              <p className="text-xs font-sans text-slate-400">
                {effect.description}
              </p>
            </motion.div>
          )}

          {targetType !== 'none' && (
            <div className="flex flex-col gap-3">
              <label className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
                Select Target
              </label>
              
              {(targetType === 'row' || targetType === 'col') && (
                <div className="flex flex-col gap-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setTargetType('row'); setTargetValue(null); }}
                      className={`flex-1 p-2 rounded-lg text-xs font-mono font-bold transition-colors ${targetType === 'row' ? 'bg-yellow-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}
                    >
                      ROW
                    </button>
                    <button
                      onClick={() => { setTargetType('col'); setTargetValue(null); }}
                      className={`flex-1 p-2 rounded-lg text-xs font-mono font-bold transition-colors ${targetType === 'col' ? 'bg-yellow-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}
                    >
                      COLUMN
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setTargetValue(i)}
                        className={`p-2 rounded-lg text-xs font-mono font-bold transition-colors ${targetValue === i ? 'bg-slate-100 text-slate-950' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                      >
                        {targetType === 'row' ? i + 1 : String.fromCharCode(65 + i)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {targetType === 'cell' && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-slate-500 italic">
                    Enter coordinate (e.g., A1, D4):
                  </p>
                  <input
                    type="text"
                    placeholder="A1"
                    maxLength={3}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      const match = val.match(/^([A-J])([1-9]|10)$/);
                      if (match) {
                        const c = match[1].charCodeAt(0) - 65;
                        const r = parseInt(match[2]) - 1;
                        setTargetValue({ r, c });
                      } else {
                        setTargetValue(null);
                      }
                    }}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-center font-mono font-bold text-white focus:border-yellow-500/50 focus:outline-none"
                  />
                </div>
              )}
            </div>
          )}

          <button
            disabled={!effect || validate() !== null}
            onClick={handleExecute}
            className={`
              w-full p-4 rounded-xl font-serif font-bold text-xl transition-all
              ${!effect || validate() !== null 
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                : 'bg-yellow-500 text-slate-950 hover:bg-yellow-400 shadow-lg shadow-yellow-500/20'}
            `}
          >
            FIRE BOMB
          </button>
        </div>
      </motion.div>
    </div>
  );
};
