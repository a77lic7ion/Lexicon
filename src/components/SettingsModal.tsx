import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings, Volume2, VolumeX, RefreshCw, LogOut, Trophy, Info } from 'lucide-react';
import { WinMode, Difficulty, GameState } from '../types';
import { Brain } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onRestart: () => void;
  onQuit: () => void;
  onToggleSound: () => void;
  isSoundEnabled: boolean;
  onSetDifficulty: (id: 1 | 2, difficulty: Difficulty) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  gameState, 
  onRestart, 
  onQuit,
  onToggleSound,
  isSoundEnabled,
  onSetDifficulty
}) => {
  if (!isOpen) return null;

  const aiPlayer = gameState.players[2].isAI ? gameState.players[2] : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl flex flex-col gap-8"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-800 rounded-2xl">
                <Settings className="w-6 h-6 text-slate-400" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-white">Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-col gap-6">
            {/* Sound Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
              <div className="flex items-center gap-3">
                {isSoundEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
                <span className="font-mono font-bold text-slate-200">Sound Effects</span>
              </div>
              <button
                onClick={onToggleSound}
                className={`w-14 h-8 rounded-full transition-colors relative ${isSoundEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
              >
                <motion.div 
                  animate={{ x: isSoundEnabled ? 24 : 4 }}
                  className="absolute top-1 left-0 w-6 h-6 bg-white rounded-full shadow-md"
                />
              </button>
            </div>

            {/* AI Difficulty */}
            {aiPlayer && (
              <div className="flex flex-col gap-3 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Brain className="w-4 h-4" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest">AI Difficulty</span>
                </div>
                <div className="flex gap-2">
                  {(['easy', 'medium', 'hard'] as const).map(diff => (
                    <button
                      key={diff}
                      onClick={() => onSetDifficulty(2, diff)}
                      className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all ${aiPlayer.difficulty === diff ? 'bg-yellow-500 text-slate-950 shadow-lg shadow-yellow-500/20' : 'bg-slate-900 text-slate-500 hover:bg-slate-800'}`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
                  {aiPlayer.difficulty === 'easy' && "Random shots, short words, slow pace."}
                  {aiPlayer.difficulty === 'medium' && "Targets revealed tiles, balanced words."}
                  {aiPlayer.difficulty === 'hard' && "Aggressive bombing, longest words, precise."}
                </p>
              </div>
            )}

            {/* Game Info */}
            <div className="flex flex-col gap-3 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Trophy className="w-4 h-4" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Victory Condition</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-serif font-bold text-white capitalize">{gameState.winMode} Mode</span>
                <div className="p-1 bg-slate-900 rounded-lg border border-slate-800">
                  <Info className="w-4 h-4 text-slate-600" />
                </div>
              </div>
              <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
                {gameState.winMode === 'classic' && "Destroy all enemy ships to win."}
                {gameState.winMode === 'lexicon' && "Cast an 8+ letter word bomb to win instantly."}
                {gameState.winMode === 'hybrid' && "Destroy 10 ships OR cast a 7+ letter word bomb."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <button
                onClick={() => { onRestart(); onClose(); }}
                className="p-4 bg-slate-800 hover:bg-yellow-500/20 text-slate-300 hover:text-yellow-500 rounded-2xl border border-slate-700 hover:border-yellow-500/50 transition-all flex flex-col items-center gap-2 font-mono font-bold text-xs"
              >
                <RefreshCw className="w-6 h-6" />
                RESTART
              </button>
              <button
                onClick={() => { onQuit(); onClose(); }}
                className="p-4 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-500 rounded-2xl border border-slate-700 hover:border-red-500/50 transition-all flex flex-col items-center gap-2 font-mono font-bold text-xs"
              >
                <LogOut className="w-6 h-6" />
                QUIT
              </button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
              Lexicon Battle v1.0.5
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
