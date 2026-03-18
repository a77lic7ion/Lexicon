import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Grid } from './Grid';
import { LetterBank } from './LetterBank';
import { WordBombModal } from './WordBombModal';
import { Zap, Target, History, Settings, Info, Trophy, LogOut, RefreshCw, Users } from 'lucide-react';
import { GameState } from '../types';

interface BattleScreenProps {
  gameState: GameState;
  onFire: (r: number, c: number) => void;
  onExecuteBomb: (word: string, target: any) => void;
  onQuit: () => void;
  onRestart: () => void;
  message: string;
  error: string | null;
}

export const BattleScreen: React.FC<BattleScreenProps> = ({ gameState, onFire, onExecuteBomb, onQuit, onRestart, message, error }) => {
  const [isBombModalOpen, setIsBombModalOpen] = useState(false);
  
  const isAIGame = gameState.players[2].isAI;
  const [showPassDevice, setShowPassDevice] = useState(false);
  const [viewingPlayerId, setViewingPlayerId] = useState<1 | 2>(isAIGame ? 1 : gameState.activePlayer);

  useEffect(() => {
    if (isAIGame) {
      setViewingPlayerId(1);
    } else if (gameState.activePlayer !== viewingPlayerId) {
      setShowPassDevice(true);
    }
  }, [gameState.activePlayer, isAIGame, viewingPlayerId]);

  const handleReady = () => {
    setViewingPlayerId(gameState.activePlayer);
    setShowPassDevice(false);
  };

  const viewingPlayer = gameState.players[viewingPlayerId];
  const opponentId = viewingPlayerId === 1 ? 2 : 1;
  const opponent = gameState.players[opponentId];
  const isMyTurn = gameState.activePlayer === viewingPlayerId;

  if (showPassDevice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-8">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-8 bg-slate-900 p-12 rounded-3xl border border-slate-800 max-w-md w-full text-center"
        >
          <Users className="w-24 h-24 text-slate-500" />
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-serif font-bold text-white">
              Pass Device to {gameState.players[gameState.activePlayer].name}
            </h2>
            <p className="text-slate-400 font-mono text-sm">
              It is now their turn to strike.
            </p>
          </div>
          <button
            onClick={handleReady}
            className="w-full p-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl font-serif font-bold text-xl transition-all shadow-lg shadow-emerald-500/20"
          >
            I AM READY
          </button>
        </motion.div>
      </div>
    );
  }

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
            {gameState.players[gameState.activePlayer].name}'s Turn
          </p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={onRestart}
            className="p-3 bg-slate-900 hover:bg-yellow-500/20 text-slate-500 hover:text-yellow-500 rounded-2xl border border-slate-800 hover:border-yellow-500/50 transition-all flex items-center gap-2 text-xs font-mono font-bold"
            title="Restart Game"
          >
            <RefreshCw className="w-5 h-5" />
            RESTART
          </button>
          <button 
            onClick={onQuit}
            className="p-3 bg-slate-900 hover:bg-red-500/20 text-slate-500 hover:text-red-500 rounded-2xl border border-slate-800 hover:border-red-500/50 transition-all flex items-center gap-2 text-xs font-mono font-bold"
            title="Quit to Menu"
          >
            <LogOut className="w-5 h-5" />
            QUIT
          </button>
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
            onCellClick={isMyTurn ? onFire : undefined}
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
                grid={viewingPlayer.grid} 
                isEnemy={false}
                showLabels={false}
              />
            </div>
          </div>

          <LetterBank bank={viewingPlayer.bank} />

          <button
            onClick={() => setIsBombModalOpen(true)}
            disabled={viewingPlayer.bank.length < 3 || !isMyTurn}
            className={`
              w-full p-6 rounded-2xl font-serif font-bold text-2xl transition-all flex items-center justify-center gap-3
              ${viewingPlayer.bank.length < 3 || !isMyTurn
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
        bank={viewingPlayer.bank}
        onExecute={onExecuteBomb}
        playedWords={gameState.playedWords}
      />
    </div>
  );
};
