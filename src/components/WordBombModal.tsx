import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LetterTile, BOMB_EFFECTS } from '../constants';
import { isValidWord } from '../utils/dictionary';
import { X, Zap, Target, Eye, Wind, Skull, Trash2 } from 'lucide-react';
import { Tooltip } from './Tooltip';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 grid-blueprint">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-900/95 border-4 border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden relative"
      >
        <div className="p-8 flex flex-col gap-6 relative z-20">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-slate-950 rounded-xl border-2 border-slate-800 shadow-lg relative group">
                <div className="absolute inset-0 bg-yellow-500/5 blur-xl rounded-full group-hover:bg-yellow-500/10 transition-all" />
                <Zap className="w-6 h-6 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.6)] relative z-10" />
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-serif font-black text-white tracking-tight uppercase drop-shadow-lg">
                  Cast Word Bomb
                </h2>
                <div className="flex items-center gap-3">
                  <div className="h-0.5 w-8 bg-slate-800 rounded-full" />
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">Strategic Armament</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 text-slate-600 hover:text-white hover:bg-slate-800 rounded-xl border-2 border-transparent hover:border-slate-700 transition-all shadow-lg group"
            >
              <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest ml-1">
              Designate Weapon
            </label>
            <div className="relative group">
              <input
                autoFocus
                type="text"
                value={word}
                onChange={(e) => {
                  setWord(e.target.value.toUpperCase());
                  setError(null);
                }}
                placeholder="TYPE YOUR WORD..."
                className="w-full bg-slate-950 border-4 border-slate-800 rounded-xl p-6 text-4xl font-serif font-black text-white placeholder:text-slate-900 focus:border-yellow-500/40 focus:outline-none transition-all shadow-inner tracking-tight uppercase drop-shadow-xl"
              />
            </div>
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/40 rounded-lg shadow-lg"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[9px] font-mono font-bold text-red-500 uppercase tracking-widest">
                  // ERROR: {error}
                </span>
              </motion.div>
            )}
          </div>

          {effect && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-950 p-6 rounded-xl border-2 border-slate-800 flex flex-col gap-3 w-full shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              <div className="absolute inset-0 grid-blueprint opacity-5 pointer-events-none" />
              <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
                <span className="text-xl font-serif font-black text-yellow-500 uppercase tracking-widest flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_10px_rgba(234,179,8,0.6)]" />
                  {effect.name}
                </span>
                <span className="text-[9px] font-mono font-bold text-slate-600 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 uppercase tracking-widest">
                  {wordLen} UNIT COST
                </span>
              </div>
              <p className="text-[10px] font-mono font-bold text-slate-400 leading-relaxed uppercase tracking-widest italic">
                {effect.description}
              </p>
            </motion.div>
          )}

          {targetType !== 'none' && (
            <div className="flex flex-col gap-4">
              <label className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest ml-1">
                Select Target Vector
              </label>
              
              {(targetType === 'row' || targetType === 'col') && (
                <div className="flex flex-col gap-4">
                  <div className="flex gap-2 p-1.5 bg-slate-950 rounded-xl border-2 border-slate-800 shadow-inner">
                    <button
                      onClick={() => { setTargetType('row'); setTargetValue(null); }}
                      className={`flex-1 py-3 rounded-lg text-[9px] font-mono font-bold tracking-widest transition-all border ${
                        targetType === 'row' 
                          ? 'bg-yellow-500 text-slate-950 border-yellow-400 shadow-lg' 
                          : 'bg-transparent text-slate-600 border-transparent hover:text-slate-400'
                      }`}
                    >
                      ROW
                    </button>
                    <button
                      onClick={() => { setTargetType('col'); setTargetValue(null); }}
                      className={`flex-1 py-3 rounded-lg text-[9px] font-mono font-bold tracking-widest transition-all border ${
                        targetType === 'col' 
                          ? 'bg-yellow-500 text-slate-950 border-yellow-400 shadow-lg' 
                          : 'bg-transparent text-slate-600 border-transparent hover:text-slate-400'
                      }`}
                    >
                      COLUMN
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setTargetValue(i)}
                        className={`p-3 rounded-lg text-[11px] font-mono font-bold transition-all border-2 shadow-lg active:scale-90 ${
                          targetValue === i 
                            ? 'bg-white text-slate-950 border-white shadow-lg' 
                            : 'bg-slate-950 text-slate-600 border-slate-800 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        {targetType === 'row' ? i + 1 : String.fromCharCode(65 + i)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {targetType === 'cell' && (
                <div className="flex flex-col gap-3">
                  <div className="px-4 py-2 bg-slate-900/40 rounded-xl border border-slate-800/40">
                    <p className="text-[9px] font-mono font-bold text-slate-600 uppercase tracking-widest italic">
                      Enter coordinate (e.g., A1, D4):
                    </p>
                  </div>
                  <div className="relative group">
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
                      className="w-full bg-slate-950 border-4 border-slate-800 rounded-xl p-6 text-center font-mono font-black text-3xl text-white focus:border-yellow-500/40 focus:outline-none transition-all shadow-inner tracking-widest uppercase drop-shadow-xl"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            disabled={!effect || validate() !== null}
            onClick={handleExecute}
            className={`
              relative group w-full p-6 rounded-xl font-serif font-black text-2xl transition-all border-4 overflow-hidden active:scale-95
              ${!effect || validate() !== null 
                ? 'bg-slate-900 text-slate-800 border-slate-800 cursor-not-allowed opacity-40' 
                : 'bg-slate-900 text-white border-slate-800 hover:border-yellow-500/50 hover:text-yellow-500 shadow-xl'}
            `}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-30" />
            <div className="flex items-center justify-center gap-4 relative z-10">
              <Zap className={`w-6 h-6 ${!effect || validate() !== null ? 'text-slate-800' : 'text-yellow-500 animate-pulse'}`} />
              FIRE BOMB
              <Zap className={`w-6 h-6 ${!effect || validate() !== null ? 'text-slate-800' : 'text-yellow-500 animate-pulse'}`} />
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
