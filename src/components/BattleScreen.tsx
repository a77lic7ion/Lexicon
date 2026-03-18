import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Grid } from './Grid';
import { LetterBank } from './LetterBank';
import { WordBombModal } from './WordBombModal';
import { Zap, Target, History, Settings, Info, Trophy } from 'lucide-react';
import { GameState } from '../types';

interface BattleScreenProps {
  gameState: GameState;
  onFire: (r: number, c: number) => void;
  onExecuteBomb: (word: string, target: any) => void;
  message: string;
  error: string | null;
}

export const BattleScreen: React.FC<BattleScreenProps> = ({ gameState, onFire, onExecuteBomb, message, error }) => {
  const [isBombModalOpen, setIsBombModalOpen] = useState(false);
  const activePlayer = gameState.players[gameState.activePlayer];
  const opponent = gameState.players[gameState.activePlayer === 1 ? 2 : 1];

  return (
    <div className="flex flex-col gap-8 p-8 bg-slate-950 min-h-screen items-center">
      {/* Header */}
      <div className="flex justify-between items-center w-full max-w-6xl">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-serif font-bold text-white tracking-tight flex items-center gap-3">
            LEXICON
            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              TURN {gameState.turnCount + 1}
            </span>
          </h1>
          <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">
            {gameState.activePlayer === 1 ? 'Player 1' : 'Player 2'}'s Turn
          </p>
        </div>

        <div className="flex gap-4">
          <button className="p-3 bg-slate-900 hover:bg-slate-800 rounded-2xl border border-slate-800 transition-colors">
            <History className="w-6 h-6 text-slate-400" />
          </button>
          <button className="p-3 bg-slate-900 hover:bg-slate-800 rounded-2xl border border-slate-800 transition-colors">
            <Settings className="w-6 h-6 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col xl:flex-row gap-8 w-full max-w-6xl items-start">
        {/* Left Side: Enemy Grid (Firing) */}
        <div className="flex flex-col gap-6 flex-1">
          <div className="flex justify-between items-end px-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest">
                Targeting System
              </span>
              <h2 className="text-xl font-serif font-bold text-white">
                ENEMY GRID
              </h2>
            </div>
            <div className="flex gap-2">
              {/* Stats or indicators */}
            </div>
          </div>

          <Grid 
            grid={opponent.grid} 
            onCellClick={onFire}
            isEnemy={true}
            showLabels={true}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={message}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`
                p-4 rounded-2xl font-mono font-bold text-center uppercase tracking-widest text-sm
                ${message.includes('HIT') ? 'bg-red-500/10 text-red-500 border border-red-500/50' : 'bg-slate-900 text-slate-400 border border-slate-800'}
              `}
            >
              {message}
            </motion.div>
          </AnimatePresence>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-500 text-sm font-mono font-bold"
            >
              {error}
            </motion.div>
          )}
        </div>

        {/* Right Side: Own Grid & Bank */}
        <div className="flex flex-col gap-8 w-full xl:w-96">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1 px-4">
              <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-widest">
                Defense System
              </span>
              <h2 className="text-xl font-serif font-bold text-white">
                YOUR GRID
              </h2>
            </div>
            <div className="scale-75 origin-top-left">
              <Grid 
                grid={activePlayer.grid} 
                isEnemy={false}
                showLabels={false}
              />
            </div>
          </div>

          <LetterBank bank={activePlayer.bank} />

          <button
            onClick={() => setIsBombModalOpen(true)}
            disabled={activePlayer.bank.length < 3}
            className={`
              w-full p-6 rounded-2xl font-serif font-bold text-2xl transition-all flex items-center justify-center gap-3
              ${activePlayer.bank.length < 3 
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                : 'bg-yellow-500 text-slate-950 hover:bg-yellow-400 shadow-lg shadow-yellow-500/20'}
            `}
          >
            <Zap className="w-8 h-8" />
            CAST WORD BOMB
          </button>
        </div>
      </div>

      <WordBombModal 
        isOpen={isBombModalOpen}
        onClose={() => setIsBombModalOpen(false)}
        bank={activePlayer.bank}
        onExecute={onExecuteBomb}
        playedWords={gameState.playedWords}
      />
    </div>
  );
};
