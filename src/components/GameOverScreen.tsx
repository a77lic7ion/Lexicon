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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 p-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-8 max-w-lg w-full text-center"
      >
        <div className="relative">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 4 }}
          >
            <Trophy className="w-32 h-32 text-yellow-500 drop-shadow-[0_0_30px_rgba(234,179,8,0.3)]" />
          </motion.div>
          <div className="absolute -top-4 -right-4 bg-emerald-500 text-slate-950 font-mono font-bold text-xs px-3 py-1 rounded-full border-2 border-slate-950">
            VICTORY
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-5xl font-serif font-bold text-white tracking-tight">
            {winner.name} WINS!
          </h1>
          <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">
            The smartest word won the battle
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex flex-col gap-1">
            <span className="text-[10px] font-mono font-bold text-slate-600 uppercase">Turns</span>
            <span className="text-2xl font-serif font-bold text-white">{gameState.turnCount}</span>
          </div>
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex flex-col gap-1">
            <span className="text-[10px] font-mono font-bold text-slate-600 uppercase">Words Cast</span>
            <span className="text-2xl font-serif font-bold text-white">{gameState.playedWords.length}</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full">
          <button
            onClick={onRestart}
            className="w-full p-6 bg-yellow-500 hover:bg-yellow-400 text-slate-950 rounded-2xl font-serif font-bold text-2xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-yellow-500/20"
          >
            <RefreshCw className="w-8 h-8" />
            PLAY AGAIN
          </button>
          
          <button
            onClick={onRestart}
            className="w-full p-4 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-2xl font-serif font-bold text-lg transition-all flex items-center justify-center gap-3 border border-slate-800"
          >
            <Home className="w-6 h-6" />
            MAIN MENU
          </button>
        </div>
      </motion.div>
    </div>
  );
};
