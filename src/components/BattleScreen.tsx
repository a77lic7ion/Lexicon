import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Grid } from './Grid';
import { UnifiedGrid } from './UnifiedGrid';
import { LetterBank } from './LetterBank';
import { WordBombModal } from './WordBombModal';
import { GameHistoryModal } from './GameHistoryModal';
import { SettingsModal } from './SettingsModal';
import { Zap, Target, History, Settings, Info, Trophy, LogOut, RefreshCw, Users, Shield, LayoutGrid, Layout } from 'lucide-react';
import { GameState, Difficulty } from '../types';

interface BattleScreenProps {
  gameState: GameState;
  onFire: (r: number, c: number) => void;
  onExecuteBomb: (word: string, target: any) => void;
  onQuit: () => void;
  onRestart: () => void;
  message: string;
  error: string | null;
  onToggleSound: () => void;
  isSoundEnabled: boolean;
  onSetDifficulty: (id: 1 | 2, difficulty: Difficulty) => void;
}

export const BattleScreen: React.FC<BattleScreenProps> = ({ 
  gameState, 
  onFire, 
  onExecuteBomb, 
  onQuit, 
  onRestart, 
  message, 
  error, 
  onToggleSound, 
  isSoundEnabled,
  onSetDifficulty
}) => {
  const [isBombModalOpen, setIsBombModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'unified' | 'classic'>('unified');
  
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
            onClick={() => setViewMode(prev => prev === 'unified' ? 'classic' : 'unified')}
            className={`p-3 rounded-2xl border transition-all flex items-center gap-2 text-xs font-mono font-bold ${viewMode === 'unified' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50' : 'bg-slate-900 text-slate-500 border-slate-800'}`}
            title="Toggle View Mode"
          >
            <Target className="w-5 h-5" />
            {viewMode === 'unified' ? 'UNIFIED' : 'CLASSIC'}
          </button>
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
          <button 
            onClick={() => setIsHistoryModalOpen(true)}
            className="p-3 bg-slate-900 hover:bg-slate-800 rounded-2xl border border-slate-800 transition-colors"
            title="Game History"
          >
            <History className="w-6 h-6 text-slate-400" />
          </button>
          <button 
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-3 bg-slate-900 hover:bg-slate-800 rounded-2xl border border-slate-800 transition-colors"
            title="Settings"
          >
            <Settings className="w-6 h-6 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col xl:flex-row gap-12 w-full max-w-7xl items-start justify-center">
        {viewMode === 'unified' ? (
          <div className="flex flex-col gap-8 items-center flex-1 max-w-2xl">
            <div className="flex flex-col items-center gap-2 text-center">
              <h2 className="text-3xl font-serif font-bold text-white flex items-center gap-3">
                Tactical Overlay
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full border border-cyan-400/20 animate-pulse">LIVE</span>
              </h2>
              <p className="text-xs font-mono text-slate-500 uppercase tracking-[0.3em]">Combined Battle Map</p>
            </div>
            
            <UnifiedGrid 
              myGrid={viewingPlayer.grid}
              opponentGrid={opponent.grid}
              onCellClick={(r, c) => isMyTurn && onFire(r, c)}
              activePlayer={gameState.activePlayer}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={message}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`
                  w-full p-6 rounded-3xl font-mono font-bold text-center uppercase tracking-widest text-lg
                  ${message.includes('HIT') ? 'bg-red-500/10 text-red-500 border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'bg-slate-900 text-slate-400 border border-slate-800'}
                `}
              >
                {message}
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12 flex-1 items-start justify-center">
            {/* Tracking Grid (Opponent's Board) */}
            <div className="flex flex-col gap-6 items-center">
              <div className="flex flex-col items-center gap-2 text-center">
                <h2 className="text-2xl font-serif font-bold text-white flex items-center gap-3">
                  Tracking Grid
                  <Target className="w-5 h-5 text-red-500" />
                </h2>
                <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Strike {opponent.name}</p>
              </div>
              
              <Grid 
                grid={opponent.grid} 
                isEnemy={true}
                onCellClick={isMyTurn ? onFire : undefined}
                activePlayer={gameState.activePlayer}
                showLabels={true}
              />
            </div>

            {/* Home Grid (Your Board) */}
            <div className="flex flex-col gap-6 items-center">
              <div className="flex flex-col items-center gap-2 text-center">
                <h2 className="text-2xl font-serif font-bold text-white flex items-center gap-3">
                  Home Grid
                  <Shield className="w-5 h-5 text-cyan-500" />
                </h2>
                <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Defend {viewingPlayer.name}</p>
              </div>
              
              <Grid 
                grid={viewingPlayer.grid} 
                isEnemy={false}
                showLabels={false}
              />
            </div>
          </div>
        )}

        {/* Action Panel */}
        <div className="flex flex-col gap-6 w-full xl:w-96 bg-slate-900/30 p-8 rounded-[2.5rem] border border-slate-800/50 backdrop-blur-sm">
          
          {/* Opponent's Bank (Strategic Info) */}
          <div className="flex flex-col gap-3 p-5 bg-slate-950/40 rounded-3xl border border-slate-800/50 opacity-80">
            <div className="flex justify-between items-center px-1">
              <h4 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                Opponent Bank
                <span className="text-slate-600">({opponent.name})</span>
              </h4>
              <span className="text-[10px] font-mono text-slate-600 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {opponent.bank.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[40px]">
              {opponent.bank.length > 0 ? (
                opponent.bank.map((tile, idx) => (
                  <div 
                    key={`${tile.id}-${idx}`}
                    className={`
                      w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-serif font-bold border shadow-sm
                      ${tile.tier === 'common' ? 'bg-slate-800 border-slate-700 text-slate-400' : ''}
                      ${tile.tier === 'uncommon' ? 'bg-emerald-900/30 border-emerald-500/20 text-emerald-500' : ''}
                      ${tile.tier === 'rare' ? 'bg-amber-900/30 border-amber-500/20 text-amber-500' : ''}
                      ${tile.tier === 'wildcard' ? 'bg-purple-900/30 border-purple-500/20 text-purple-500' : ''}
                    `}
                  >
                    {tile.letter}
                  </div>
                ))
              ) : (
                <div className="w-full flex items-center justify-center py-2">
                  <span className="text-[9px] font-mono text-slate-700 italic">No letters harvested...</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-serif font-bold text-white flex items-center gap-3">
                Your Bank
                <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                  {viewingPlayer.bank.length}
                </span>
              </h3>
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${isMyTurn ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`} />
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-tighter">
                  {isMyTurn ? 'Active' : 'Standby'}
                </span>
              </div>
            </div>
            
            <LetterBank bank={viewingPlayer.bank} title="Available Letters" />
            
            <button
              onClick={() => setIsBombModalOpen(true)}
              disabled={viewingPlayer.bank.length < 3 || !isMyTurn}
              className={`
                w-full p-6 rounded-2xl font-serif font-bold text-2xl transition-all flex items-center justify-center gap-3 relative overflow-hidden group
                ${viewingPlayer.bank.length < 3 || !isMyTurn
                  ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed' 
                  : 'bg-yellow-500 text-slate-950 hover:bg-yellow-400 shadow-xl shadow-yellow-500/20'}
              `}
            >
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-[-20deg]" />
              <Zap className={`w-8 h-8 ${viewingPlayer.bank.length >= 3 && isMyTurn ? 'fill-current' : ''}`} />
              WORD BOMB
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-500/10 border border-red-500/50 p-5 rounded-2xl text-red-500 text-sm font-mono font-bold flex items-center gap-3"
            >
              <Info className="w-5 h-5 shrink-0" />
              {error}
            </motion.div>
          )}

          {/* AI Info */}
          {isAIGame && (
            <div className="p-5 bg-slate-950/50 rounded-2xl border border-slate-800/50">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <Users className="w-4 h-4" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest">AI Opponent Active</span>
              </div>
              <p className="text-[10px] text-slate-600 font-mono leading-relaxed">
                The computer will strike back after your turn. It harvests letters to cast bombs just like you.
              </p>
            </div>
          )}
        </div>
      </div>

      <WordBombModal 
        isOpen={isBombModalOpen}
        onClose={() => setIsBombModalOpen(false)}
        bank={viewingPlayer.bank}
        onExecute={onExecuteBomb}
        playedWords={gameState.playedWords}
      />

      <GameHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={gameState.history}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        gameState={gameState}
        onRestart={onRestart}
        onQuit={onQuit}
        onToggleSound={onToggleSound}
        isSoundEnabled={isSoundEnabled}
        onSetDifficulty={onSetDifficulty}
      />
    </div>
  );
};
