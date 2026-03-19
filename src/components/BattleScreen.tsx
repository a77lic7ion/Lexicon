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
  onSkipTurn: () => void;
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
  onSetDifficulty,
  onSkipTurn
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
  
  const totalLettersLeft = opponent.grid.flat().filter(c => c.tileId && !c.isHit).length;

  if (showPassDevice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6 grid-blueprint">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-6 bg-slate-900 p-8 rounded-2xl border-2 border-slate-800 max-w-md w-full text-center shadow-xl backdrop-blur-xl relative overflow-hidden"
        >
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 shadow-lg relative group">
            <div className="absolute inset-0 bg-cyan-500/5 blur-xl rounded-full group-hover:bg-cyan-500/10 transition-colors" />
            <Users className="w-12 h-12 text-slate-400 drop-shadow-lg relative z-10" />
          </div>

          <div className="flex flex-col gap-3 relative z-10">
            <h2 className="text-3xl font-bold text-white tracking-tight uppercase leading-none">
              Pass Device
            </h2>
            <div className="h-0.5 w-16 bg-yellow-500/40 mx-auto rounded-full" />
            <p className="text-slate-400 font-mono text-xs font-bold uppercase tracking-widest">
              TO <span className="text-yellow-500">{gameState.players[gameState.activePlayer].name}</span>
            </p>
          </div>

          <button
            onClick={handleReady}
            className="relative group w-full p-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xl transition-all shadow-lg border border-emerald-400/50 overflow-hidden active:scale-95"
          >
            <span className="relative z-10">I AM READY</span>
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-8 bg-slate-950 min-h-screen items-center grid-blueprint relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-cyan-900/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center w-full max-w-7xl relative z-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-4 drop-shadow-lg">
            LEXICON
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-mono font-bold text-yellow-500 bg-yellow-500/10 px-3 py-0.5 rounded-lg border border-yellow-500/30 uppercase tracking-widest">
                TURN {gameState.turnCount + 1}
              </span>
            </div>
          </h1>
          <div className="flex items-center gap-3 ml-1">
            <div className="h-px w-8 bg-slate-800 rounded-full" />
            <p className="text-slate-500 font-mono text-[10px] font-bold uppercase tracking-widest">
              {gameState.players[gameState.activePlayer].name}'s Strike Phase
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => setViewMode(prev => prev === 'unified' ? 'classic' : 'unified')}
            className={`px-4 py-2 rounded-xl border transition-all flex items-center gap-3 text-[10px] font-mono font-bold tracking-widest shadow-md active:scale-95 ${viewMode === 'unified' ? 'bg-cyan-600/20 text-cyan-400 border-cyan-500/40' : 'bg-slate-900 text-slate-600 border-slate-800 hover:border-slate-700'}`}
            title="Toggle View Mode"
          >
            {viewMode === 'unified' ? <LayoutGrid className="w-4 h-4" /> : <Layout className="w-4 h-4" />}
            {viewMode === 'unified' ? 'UNIFIED' : 'CLASSIC'}
          </button>
          <div className="h-10 w-px bg-slate-800 mx-1" />
          <button 
            onClick={onRestart}
            className="p-2.5 bg-slate-900 hover:bg-yellow-500/10 text-slate-600 hover:text-yellow-500 rounded-xl border border-slate-800 hover:border-yellow-500/40 transition-all shadow-md active:scale-95"
            title="Restart Game"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button 
            onClick={onQuit}
            className="p-2.5 bg-slate-900 hover:bg-red-500/10 text-slate-600 hover:text-red-500 rounded-xl border border-slate-800 hover:border-red-500/40 transition-all shadow-md active:scale-95"
            title="Quit to Menu"
          >
            <LogOut className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsHistoryModalOpen(true)}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-600 hover:text-white rounded-xl border border-slate-800 transition-all shadow-md active:scale-95"
            title="Game History"
          >
            <History className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-600 hover:text-white rounded-xl border border-slate-800 transition-all shadow-md active:scale-95"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col xl:flex-row gap-12 w-full max-w-7xl items-start justify-center relative z-10">
        {viewMode === 'unified' ? (
          <div className="flex flex-col gap-8 items-center flex-1 max-w-2xl">
            <div className="flex flex-col items-center gap-3 text-center">
              <h2 className="text-3xl font-bold text-white flex items-center gap-4 tracking-tight uppercase">
                Tactical Overlay
                <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-400/10 px-3 py-0.5 rounded-lg border border-cyan-400/30 animate-pulse">LIVE</span>
              </h2>
              <p className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest">Combined Battle Map</p>
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
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className={`
                  w-full p-6 rounded-2xl font-mono font-bold text-center uppercase tracking-widest text-xl border-2 shadow-lg relative overflow-hidden
                  ${message.includes('HIT') 
                    ? 'bg-red-950/40 text-red-500 border-red-500/40 shadow-red-500/10' 
                    : 'bg-slate-900/60 text-slate-500 border-slate-800 shadow-black/20'}
                `}
              >
                {message}
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12 flex-1 items-start justify-center">
            {/* Tracking Grid (Opponent's Board) */}
            <div className="flex flex-col gap-8 items-center">
              <div className="flex flex-col items-center gap-4 text-center">
                <h2 className="text-3xl font-bold text-white flex items-center gap-6 tracking-tight uppercase">
                  Tracking Grid
                  <div className="p-3 bg-red-500/10 rounded-2xl border-2 border-red-500/30">
                    <Target className="w-8 h-8 text-red-500" />
                  </div>
                </h2>
                <p className="text-xs font-mono font-bold text-slate-600 uppercase tracking-[0.5em]">Strike {opponent.name}</p>
                <div className="mt-4 px-6 py-2 bg-red-500/10 border-2 border-red-500/30 rounded-full">
                  <span className="text-xs font-mono font-bold text-red-500 uppercase tracking-widest">
                    {totalLettersLeft} Units Remaining
                  </span>
                </div>
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
            <div className="flex flex-col gap-8 items-center">
              <div className="flex flex-col items-center gap-4 text-center">
                <h2 className="text-3xl font-bold text-white flex items-center gap-6 tracking-tight uppercase">
                  Home Grid
                  <div className="p-3 bg-cyan-500/10 rounded-2xl border-2 border-cyan-500/30">
                    <Shield className="w-8 h-8 text-cyan-500" />
                  </div>
                </h2>
                <p className="text-xs font-mono font-bold text-slate-600 uppercase tracking-[0.5em]">Defend {viewingPlayer.name}</p>
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
        <div className="flex flex-col gap-6 w-full xl:w-[360px] bg-slate-900/40 p-6 rounded-2xl border-2 border-slate-800/60 backdrop-blur-xl shadow-xl">
          
          {/* Opponent's Bank (Strategic Info) */}
          <div className="flex flex-col gap-3 p-4 bg-slate-950/60 rounded-xl border border-slate-800 shadow-inner relative overflow-hidden">
            <div className="absolute inset-0 grid-blueprint opacity-10 pointer-events-none" />
            
            <div className="flex justify-between items-center px-1 relative z-10">
              <h4 className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                Opponent Bank
                <span className="text-slate-700">({opponent.name})</span>
              </h4>
              <div className="w-8 h-8 flex items-center justify-center bg-slate-900 rounded-lg border border-slate-800 text-[10px] font-mono font-bold text-slate-500">
                {opponent.bank.length}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 min-h-[50px] p-3 bg-slate-900/40 rounded-lg border border-slate-800/40 relative z-10">
              {opponent.bank.length > 0 ? (
                opponent.bank.map((tile, idx) => (
                  <div 
                    key={`${tile.id}-${idx}`}
                    className={`
                      w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold border shadow-md transition-transform hover:scale-110
                      ${tile.tier === 'common' ? 'bg-slate-900 border-slate-700 text-slate-500' : ''}
                      ${tile.tier === 'uncommon' ? 'bg-slate-900 border-emerald-500/40 text-emerald-500' : ''}
                      ${tile.tier === 'rare' ? 'bg-slate-900 border-amber-500/40 text-amber-500' : ''}
                      ${tile.tier === 'wildcard' ? 'bg-slate-900 border-purple-500/40 text-purple-500' : ''}
                    `}
                  >
                    {tile.letter}
                  </div>
                ))
              ) : (
                <div className="w-full flex items-center justify-center py-2">
                  <span className="text-[9px] font-mono text-slate-800 font-bold uppercase tracking-widest italic opacity-60">No letters harvested</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                Your Bank
                <div className="w-8 h-8 flex items-center justify-center bg-slate-950 rounded-lg border border-slate-800 text-[10px] font-mono font-bold text-slate-500">
                  {viewingPlayer.bank.length}
                </div>
              </h3>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${isMyTurn ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]' : 'bg-slate-800'}`} />
                <span className="text-[9px] font-mono font-bold text-slate-600 uppercase tracking-widest">
                  {isMyTurn ? 'Active' : 'Standby'}
                </span>
              </div>
            </div>
            
            <LetterBank bank={viewingPlayer.bank} title="Available Letters" />
            
            <button
              onClick={() => setIsBombModalOpen(true)}
              disabled={viewingPlayer.bank.length < 3 || !isMyTurn}
              className={`
                w-full p-6 rounded-2xl font-bold text-2xl transition-all flex items-center justify-center gap-4 relative overflow-hidden group border-2 active:scale-95
                ${viewingPlayer.bank.length < 3 || !isMyTurn
                  ? 'bg-slate-900 text-slate-800 border-slate-800 cursor-not-allowed opacity-40' 
                  : 'bg-slate-900 text-white border-slate-800 hover:border-yellow-500/50 hover:text-yellow-500 shadow-lg'}
              `}
            >
              <Zap className={`w-8 h-8 transition-transform group-hover:scale-110 ${viewingPlayer.bank.length >= 3 && isMyTurn ? 'text-yellow-500' : 'text-slate-800'}`} />
              <span className="tracking-tight uppercase">Word Bomb</span>
            </button>

            <button
              onClick={onSkipTurn}
              disabled={!isMyTurn}
              className={`
                w-full p-3 rounded-xl font-mono font-bold text-[10px] tracking-widest transition-all flex items-center justify-center gap-3 border shadow-md active:scale-95
                ${!isMyTurn
                  ? 'bg-slate-900/60 text-slate-800 border-slate-800 cursor-not-allowed'
                  : 'bg-slate-950 text-slate-600 border-slate-800 hover:bg-slate-900 hover:text-white hover:border-slate-700'}
              `}
            >
              <LogOut className="w-4 h-4 rotate-90" />
              SKIP TURN
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-950/40 border-2 border-red-500/40 p-4 rounded-xl text-red-500 text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-3 shadow-lg"
            >
              <Info className="w-5 h-5 shrink-0" />
              <span className="leading-relaxed">{error}</span>
            </motion.div>
          )}

          {/* AI Info */}
          {isAIGame && (
            <div className="p-4 bg-slate-950/60 rounded-xl border-2 border-slate-800/60 relative overflow-hidden">
              <div className="absolute inset-0 grid-blueprint opacity-10 pointer-events-none" />
              <div className="flex items-center gap-3 text-slate-600 mb-2 relative z-10">
                <Users className="w-4 h-4" />
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest">AI Subroutine Active</span>
              </div>
              <p className="text-[9px] text-slate-700 font-mono leading-relaxed uppercase tracking-widest relative z-10">
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
