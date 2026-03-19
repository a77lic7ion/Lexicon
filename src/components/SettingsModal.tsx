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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md grid-blueprint">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-slate-900/95 border-4 border-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl flex flex-col gap-8 relative overflow-hidden"
        >
          <div className="flex justify-between items-center relative z-20">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-slate-950 rounded-xl border-2 border-slate-800 shadow-lg relative group">
                <div className="absolute inset-0 bg-cyan-500/5 blur-xl rounded-full group-hover:bg-cyan-500/10 transition-all" />
                <Settings className="w-6 h-6 text-slate-400 drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] relative z-10" />
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-serif font-black text-white tracking-tight uppercase drop-shadow-lg">Settings</h2>
                <div className="flex items-center gap-3">
                  <div className="h-0.5 w-8 bg-slate-800 rounded-full" />
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">System Config</span>
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

          <div className="flex flex-col gap-6 relative z-20">
            {/* Sound Toggle */}
            <div className="flex items-center justify-between p-6 bg-slate-950/60 rounded-2xl border-2 border-slate-800/60 shadow-inner relative overflow-hidden group hover:border-slate-700 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              <div className="absolute inset-0 grid-blueprint opacity-5 pointer-events-none" />
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg border-2 transition-all ${isSoundEnabled ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-900 text-slate-600 border-slate-800'}`}>
                  {isSoundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest">Audio Feedback</span>
                  <span className="text-[8px] font-mono font-bold text-slate-600 uppercase tracking-widest italic">
                    {isSoundEnabled ? '// Systems Online' : '// Systems Muted'}
                  </span>
                </div>
              </div>
              <button
                onClick={onToggleSound}
                className={`w-14 h-7 rounded-full transition-all relative border-2 ${isSoundEnabled ? 'bg-emerald-600 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-slate-800 border-slate-700'}`}
              >
                <motion.div 
                  animate={{ x: isSoundEnabled ? 28 : 4 }}
                  className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg"
                />
              </button>
            </div>

            {/* AI Difficulty */}
            {aiPlayer && (
              <div className="flex flex-col gap-4 p-6 bg-slate-950/60 rounded-2xl border-2 border-slate-800/60 relative overflow-hidden group hover:border-slate-700 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                <div className="absolute inset-0 grid-blueprint opacity-5 pointer-events-none" />
                <div className="flex items-center gap-3 text-slate-500 mb-1">
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 shadow-md">
                    <Brain className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest">AI Difficulty</span>
                </div>
                <div className="flex gap-2 p-1 bg-slate-900 rounded-xl border-2 border-slate-800 shadow-inner">
                  {(['easy', 'medium', 'hard'] as const).map(diff => (
                    <button
                      key={diff}
                      onClick={() => onSetDifficulty(2, diff)}
                      className={`flex-1 py-2 rounded-lg text-[9px] font-mono font-bold uppercase tracking-widest transition-all border ${
                        aiPlayer.difficulty === diff 
                          ? 'bg-yellow-500 text-slate-950 border-yellow-400 shadow-md scale-105' 
                          : 'bg-transparent text-slate-600 border-transparent hover:text-slate-400'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Game Info */}
            <div className="flex flex-col gap-4 p-6 bg-slate-950/60 rounded-2xl border-2 border-slate-800/60 relative overflow-hidden group hover:border-slate-700 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              <div className="absolute inset-0 grid-blueprint opacity-5 pointer-events-none" />
              <div className="flex items-center gap-3 text-slate-500 mb-1">
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 shadow-md">
                  <Trophy className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Victory Condition</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                <span className="text-2xl font-serif font-black text-white tracking-tight uppercase drop-shadow-sm">{gameState.winMode} Mode</span>
              </div>
              <div className="px-3 py-2 bg-slate-900/40 rounded-xl border border-slate-800/40">
                <p className="text-[9px] text-slate-500 font-mono leading-relaxed uppercase tracking-widest italic">
                  {gameState.winMode === 'classic' && "// Destroy all enemy ships to win."}
                  {gameState.winMode === 'lexicon' && "// Cast an 8+ letter word bomb to win instantly."}
                  {gameState.winMode === 'hybrid' && "// Destroy 10 ships OR cast a 7+ letter word bomb."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <button
                onClick={() => { onRestart(); onClose(); }}
                className="relative group p-6 bg-slate-950 hover:bg-slate-900 text-slate-500 hover:text-yellow-500 rounded-2xl border-4 border-slate-800 hover:border-yellow-500/50 transition-all flex flex-col items-center gap-3 font-mono font-bold text-[9px] tracking-widest shadow-xl overflow-hidden active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-30" />
                <RefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                RESTART
              </button>
              <button
                onClick={() => { onQuit(); onClose(); }}
                className="relative group p-6 bg-slate-950 hover:bg-slate-900 text-slate-500 hover:text-red-500 rounded-2xl border-4 border-slate-800 hover:border-red-500/50 transition-all flex flex-col items-center gap-3 font-mono font-bold text-[9px] tracking-widest shadow-xl overflow-hidden active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-30" />
                <LogOut className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
                QUIT
              </button>
            </div>
          </div>

          <div className="text-center pt-6 border-t border-slate-800/50 relative z-20">
            <p className="text-[9px] font-mono font-bold text-slate-700 uppercase tracking-widest italic">
              Lexicon Battle // Combat System v1.0.5
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
