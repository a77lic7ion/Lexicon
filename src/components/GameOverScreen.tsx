import React from 'react';
import { motion } from 'motion/react';
import { Trophy, RefreshCw, Home } from 'lucide-react';
import { GameState } from '../types';

interface GameOverScreenProps {
  gameState: GameState;
  onRestart: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ gameState, onRestart }) => {
  const winner = gameState.players[gameState.winner as 1 | 2];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 p-12 grid-blueprint overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(234,179,8,0.15),transparent_70%)]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-cyan-900/10 blur-[150px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-10 max-w-2xl w-full text-center z-10"
      >
        <div className="relative group">
          <motion.div
            animate={{ rotate: [0, 2, -2, 0], scale: [1, 1.02, 1.02, 1] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="relative z-10 bg-slate-900 p-10 rounded-3xl border-4 border-slate-800 shadow-2xl overflow-hidden"
          >
            <div className="absolute inset-0 grid-blueprint opacity-5 pointer-events-none" />
            <Trophy className="w-32 h-32 text-yellow-500 drop-shadow-[0_0_20px_rgba(234,179,8,0.6)] relative z-20" />
          </motion.div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/5 blur-[100px] rounded-full animate-pulse" />
          
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="absolute -top-4 -right-4 bg-emerald-600 text-white font-mono font-bold text-[10px] px-6 py-2 rounded-full border-4 border-emerald-400 shadow-lg tracking-[0.3em] uppercase z-30"
          >
            Victory
          </motion.div>
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="text-6xl font-serif font-black text-white tracking-tight leading-none drop-shadow-lg uppercase">
            {winner.name}
          </h1>
          <div className="flex items-center justify-center gap-4">
            <div className="h-0.5 w-10 bg-slate-800 rounded-full" />
            <p className="text-slate-500 font-mono text-[11px] font-bold uppercase tracking-[0.4em] italic opacity-80">
              The ultimate word-smith has prevailed
            </p>
            <div className="h-0.5 w-10 bg-slate-800 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 w-full">
          <div className="bg-slate-900/40 p-8 rounded-2xl border-4 border-slate-800/60 flex flex-col gap-2 shadow-xl backdrop-blur-md relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
            <div className="absolute inset-0 grid-blueprint opacity-5 pointer-events-none" />
            <span className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-[0.2em] group-hover:text-slate-400 transition-colors">Turns Taken</span>
            <span className="text-4xl font-serif font-black text-white drop-shadow-md">{gameState.turnCount}</span>
          </div>
          <div className="bg-slate-900/40 p-8 rounded-2xl border-4 border-slate-800/60 flex flex-col gap-2 shadow-xl backdrop-blur-md relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
            <div className="absolute inset-0 grid-blueprint opacity-5 pointer-events-none" />
            <span className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-[0.2em] group-hover:text-slate-400 transition-colors">Words Cast</span>
            <span className="text-4xl font-serif font-black text-white drop-shadow-md">{gameState.playedWords.length}</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full">
          <button
            onClick={onRestart}
            className="relative group w-full p-6 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-serif font-black text-2xl transition-all flex items-center justify-center gap-6 shadow-xl border-4 border-slate-800 hover:border-yellow-500/50 hover:text-yellow-500 overflow-hidden active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-30" />
            <RefreshCw className="w-8 h-8 group-hover:rotate-180 transition-transform duration-1000 ease-in-out" />
            REMATCH
          </button>
          
          <button
            onClick={onRestart}
            className="group relative w-full p-4 bg-slate-950 hover:bg-slate-900 text-slate-600 hover:text-slate-400 rounded-xl font-mono font-bold text-[11px] tracking-[0.4em] transition-all flex items-center justify-center gap-4 border-2 border-slate-900 hover:border-slate-800 shadow-lg uppercase overflow-hidden active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Home className="w-5 h-5 text-slate-800 group-hover:text-slate-600 transition-colors" />
            Return to Menu
          </button>
        </div>
      </motion.div>
    </div>
  );
};
