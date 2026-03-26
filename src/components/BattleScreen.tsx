import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Grid } from './Grid';
import { UnifiedGrid } from './UnifiedGrid';
import { LetterBank } from './LetterBank';
import { GameHistoryModal } from './GameHistoryModal';
import { SettingsModal } from './SettingsModal';
import { Zap, Target, History, Settings, Info, Trophy, LogOut, RefreshCw, Users, Shield, LayoutGrid, Layout, ChevronRight, ChevronLeft } from 'lucide-react';
import { GameState, Difficulty } from '../types';
import { BOMB_EFFECTS } from '../constants';
import { isValidWord } from '../utils/dictionary';

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
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  // Word Bomb State
  const [bombWord, setBombWord] = useState('');
  const [bombError, setBombError] = useState<string | null>(null);
  const [isTargeting, setIsTargeting] = useState(false);
  const [targetingType, setTargetingType] = useState<'row' | 'col' | 'cell' | 'area2x2' | null>(null);
  const [rowColToggle, setRowColToggle] = useState<'row' | 'col'>('row');
  const [previewCells, setPreviewCells] = useState<{ r: number; c: number; isValid: boolean }[]>([]);

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

  const wordLen = bombWord.trim().length;
  const currentEffect = BOMB_EFFECTS[wordLen as keyof typeof BOMB_EFFECTS] || (wordLen >= 8 ? BOMB_EFFECTS[8] : null);

  useEffect(() => {
    if (wordLen === 3 || wordLen === 5 || wordLen >= 8) {
      setTargetingType(rowColToggle);
    } else if (wordLen === 4) {
      setTargetingType('cell');
    } else if (wordLen === 6) {
      setTargetingType('area2x2');
    } else {
      setTargetingType(null);
    }
  }, [wordLen, rowColToggle]);

  const validateBomb = () => {
    const upperWord = bombWord.trim().toUpperCase();
    if (!isValidWord(upperWord)) return 'Invalid word';
    if (gameState.playedWords.includes(upperWord)) return 'Word already played';
    
    const bankLetters = viewingPlayer.bank.map(l => l.letter);
    const tempBank = [...bankLetters];
    for (const char of upperWord.split('')) {
      const idx = tempBank.indexOf(char);
      if (idx === -1) {
        const wildIdx = tempBank.indexOf('★');
        if (wildIdx === -1) return 'Missing letters';
        tempBank.splice(wildIdx, 1);
      } else {
        tempBank.splice(idx, 1);
      }
    }
    return null;
  };

  const handleArmBomb = () => {
    const err = validateBomb();
    if (err) {
      setBombError(err);
      return;
    }
    
    if (targetingType === null) {
      // Execute immediately for effects like Tempest (7 letters)
      onExecuteBomb(bombWord.trim().toUpperCase(), {});
      setBombWord('');
      setBombError(null);
      setIsTargeting(false);
    } else {
      setIsTargeting(true);
      setBombError(null);
    }
  };

  const handleGridClick = (r: number, c: number) => {
    if (!isMyTurn) return;

    if (isTargeting) {
      const target: any = {};
      if (targetingType === 'row') target.row = r;
      if (targetingType === 'col') target.col = c;
      if (targetingType === 'cell') target.cell = { r, c };
      if (targetingType === 'area2x2') target.cell = { r, c }; // Backend handles 2x2 from anchor

      onExecuteBomb(bombWord.trim().toUpperCase(), target);
      setBombWord('');
      setIsTargeting(false);
      setPreviewCells([]);
    } else {
      onFire(r, c);
    }
  };

  const handleMouseEnter = (r: number, c: number) => {
    if (!isTargeting || !targetingType) return;

    const cells: { r: number; c: number; isValid: boolean }[] = [];
    if (targetingType === 'row') {
      for (let i = 0; i < 10; i++) cells.push({ r, c: i, isValid: true });
    } else if (targetingType === 'col') {
      for (let i = 0; i < 10; i++) cells.push({ r: i, c, isValid: true });
    } else if (targetingType === 'cell') {
      cells.push({ r, c, isValid: true });
    } else if (targetingType === 'area2x2') {
      // 2x2 area, r,c is top-left
      for (let dr = 0; dr < 2; dr++) {
        for (let dc = 0; dc < 2; dc++) {
          if (r + dr < 10 && c + dc < 10) {
            cells.push({ r: r + dr, c: c + dc, isValid: true });
          } else {
            cells.push({ r: r + dr, c: c + dc, isValid: false });
          }
        }
      }
    }
    setPreviewCells(cells);
  };

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
    <div className="flex flex-row gap-0 bg-slate-950 min-h-screen grid-blueprint relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-cyan-900/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Sidebar */}
      <div className="w-80 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl flex flex-col h-screen relative z-20 shrink-0">
        <div className="p-6 flex flex-col gap-8 h-full overflow-y-auto custom-scrollbar">
          {/* Header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3 italic">
              LEXICON
              <span className="text-[10px] not-italic font-mono font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/30 uppercase tracking-widest">
                v2.0
              </span>
            </h1>
            <div className="h-1 w-12 bg-yellow-500 rounded-full" />
          </div>

          {/* Winning Conditions */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-slate-500">
              <Trophy className="w-4 h-4" />
              <span className="text-[10px] font-mono font-black uppercase tracking-widest">Victory Protocol</span>
            </div>
            <div className="bg-slate-950/50 rounded-xl border border-slate-800 p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Classic Mode</span>
                <span className="text-[10px] font-mono font-bold text-white">15 TILES</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Lexicon Mode</span>
                <span className="text-[10px] font-mono font-bold text-white">100 PTS</span>
              </div>
              <div className="h-px bg-slate-800 w-full" />
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-mono text-slate-500 uppercase italic">Current Mode: {gameState.winMode.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Stats Block */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-slate-500">
              <Target className="w-4 h-4" />
              <span className="text-[10px] font-mono font-black uppercase tracking-widest">Combat Stats</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-950/50 rounded-xl border border-slate-800 p-3 flex flex-col gap-1">
                <span className="text-[8px] font-mono text-slate-500 uppercase">Tiles Taken</span>
                <span className="text-xl font-black text-emerald-500">{viewingPlayer.tilesDestroyed}</span>
              </div>
              <div className="bg-slate-950/50 rounded-xl border border-slate-800 p-3 flex flex-col gap-1">
                <span className="text-[8px] font-mono text-slate-500 uppercase">Total Hits</span>
                <span className="text-xl font-black text-red-500">{viewingPlayer.totalHits}</span>
              </div>
              <div className="bg-slate-950/50 rounded-xl border border-slate-800 p-3 flex flex-col gap-1">
                <span className="text-[8px] font-mono text-slate-500 uppercase">Bombs Cast</span>
                <span className="text-xl font-black text-yellow-500">{viewingPlayer.bombsPlayed}</span>
              </div>
              <div className="bg-slate-950/50 rounded-xl border border-slate-800 p-3 flex flex-col gap-1">
                <span className="text-[8px] font-mono text-slate-500 uppercase">Total Score</span>
                <span className="text-xl font-black text-blue-500">{viewingPlayer.score}</span>
              </div>
            </div>
          </div>

          {/* Live Turn Ticker */}
          <div className="flex flex-col gap-3 flex-1 min-h-0">
            <div className="flex items-center gap-2 text-slate-500">
              <History className="w-4 h-4" />
              <span className="text-[10px] font-mono font-black uppercase tracking-widest">Turn Ticker</span>
            </div>
            <div className="bg-slate-950/50 rounded-xl border border-slate-800 flex-1 overflow-hidden flex flex-col">
              <div className="p-3 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">Recent Actions</span>
                <span className="text-[9px] font-mono text-yellow-500">TURN {gameState.turnCount + 1}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 custom-scrollbar">
                {gameState.history.slice(0, 10).map((entry, idx) => (
                  <div key={idx} className="flex flex-col gap-1 border-l-2 border-slate-800 pl-3 py-1">
                    <div className="flex justify-between items-center">
                      <span className={`text-[9px] font-bold uppercase ${entry.playerId === 1 ? 'text-blue-400' : 'text-red-400'}`}>
                        {gameState.players[entry.playerId].name}
                      </span>
                      <span className="text-[8px] font-mono text-slate-600">#{gameState.history.length - idx}</span>
                    </div>
                    <p className="text-[10px] text-slate-300 font-mono leading-tight">
                      {entry.action.toUpperCase()} {entry.result && `— ${entry.result.toUpperCase()}`}
                    </p>
                  </div>
                ))}
                {gameState.history.length === 0 && (
                  <div className="h-full flex items-center justify-center text-slate-700 italic text-[10px] font-mono">
                    Waiting for first move...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-2 pt-4 border-t border-slate-800 mt-auto">
            <button onClick={onRestart} className="flex-1 p-2 bg-slate-900 hover:bg-yellow-500/10 text-slate-600 hover:text-yellow-500 rounded-lg border border-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest">
              <RefreshCw className="w-3 h-3" />
              Reset
            </button>
            <button onClick={onQuit} className="flex-1 p-2 bg-slate-900 hover:bg-red-500/10 text-slate-600 hover:text-red-500 rounded-lg border border-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest">
              <LogOut className="w-3 h-3" />
              Quit
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-4 p-8 items-center overflow-y-auto relative z-10 custom-scrollbar">
        {/* Opponent Rack */}
        <div className="w-full max-w-[600px] flex flex-col gap-2">
          <div className="flex justify-between items-center px-2">
            <span className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest">Opponent: {opponent.name}</span>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono font-black text-slate-600 uppercase tracking-widest">Tiles: {opponent.grid.flat().filter(c => c.tileId && !c.isHit).length}</span>
              <span className="text-[10px] font-mono font-black text-blue-500 uppercase tracking-widest">Score: {opponent.score}</span>
            </div>
          </div>
          <LetterBank bank={opponent.bank} title="" />
        </div>

        {/* Central Board */}
        <div className="flex flex-col items-center w-full py-2">
          <UnifiedGrid 
            myGrid={viewingPlayer.grid}
            opponentGrid={opponent.grid}
            onCellClick={handleGridClick}
            onCellMouseEnter={handleMouseEnter}
            onCellMouseLeave={() => setPreviewCells([])}
            previewCells={previewCells}
            activePlayer={gameState.activePlayer}
            lastAction={gameState.lastAction}
          />
        </div>

        {/* Player Rack */}
        <div className="w-full max-w-[600px] flex flex-col gap-2">
          <div className="flex justify-between items-center px-2">
            <span className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest">You: {viewingPlayer.name}</span>
            <span className="text-[10px] font-mono font-black text-emerald-500 uppercase tracking-widest">Score: {viewingPlayer.score}</span>
          </div>
          <LetterBank bank={viewingPlayer.bank} title="" />
        </div>

        {/* Action Area */}
        <div className="w-full max-w-[600px] flex flex-col gap-4 mt-4">
          {/* Message Banner */}
          <AnimatePresence mode="wait">
            <motion.div
              key={message}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className={`
                w-full p-3 rounded-lg font-mono font-bold text-center uppercase tracking-widest text-[10px] border shadow-md
                ${message.includes('HIT') 
                  ? 'bg-red-950/20 text-red-500 border-red-500/30' 
                  : 'bg-slate-900/40 text-slate-500 border-slate-800'}
              `}
            >
              {isTargeting ? `BOMB ARMED: SELECT TARGET FOR ${currentEffect?.name}` : message}
            </motion.div>
          </AnimatePresence>

          {/* Word Input & Bomb Button */}
          <div className="grid grid-cols-[1fr_auto] gap-3 p-3 bg-slate-900/40 rounded-xl border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="flex flex-col gap-1.5">
              <div className="relative">
                <input
                  type="text"
                  value={bombWord}
                  onChange={(e) => {
                    setBombWord(e.target.value.toUpperCase());
                    setBombError(null);
                    setIsTargeting(false);
                  }}
                  disabled={!isMyTurn}
                  placeholder="TYPE WORD..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-lg font-bold text-white placeholder:text-slate-800 focus:border-yellow-500/40 focus:outline-none transition-all uppercase"
                />
              </div>
              {bombError && (
                <span className="text-[8px] font-mono font-bold text-red-500 uppercase tracking-widest ml-1">
                  // {bombError}
                </span>
              )}
              {currentEffect && (
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[9px] font-bold text-yellow-500 uppercase tracking-widest">{currentEffect.name}</span>
                  <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest italic">
                    — {currentEffect.description}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 min-w-[140px]">
              {isTargeting ? (
                <div className="flex flex-col gap-2">
                  {(wordLen === 3 || wordLen === 5 || wordLen >= 8) && (
                    <div className="flex gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
                      <button 
                        onClick={() => setRowColToggle('row')}
                        className={`flex-1 py-1 rounded text-[8px] font-mono font-bold transition-all ${rowColToggle === 'row' ? 'bg-yellow-500 text-slate-950' : 'text-slate-600'}`}
                      >ROW</button>
                      <button 
                        onClick={() => setRowColToggle('col')}
                        className={`flex-1 py-1 rounded text-[8px] font-mono font-bold transition-all ${rowColToggle === 'col' ? 'bg-yellow-500 text-slate-950' : 'text-slate-600'}`}
                      >COL</button>
                    </div>
                  )}
                  <button
                    onClick={() => setIsTargeting(false)}
                    className="w-full p-3 bg-red-900/20 text-red-500 border border-red-500/40 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-red-900/40 transition-all"
                  >
                    CANCEL
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleArmBomb}
                  disabled={!isMyTurn || wordLen < 3}
                  className={`
                    h-full w-full p-3 rounded-lg font-bold text-sm transition-all flex flex-col items-center justify-center gap-1 border active:scale-95
                    ${!isMyTurn || wordLen < 3
                      ? 'bg-slate-900 text-slate-800 border-slate-800 cursor-not-allowed opacity-40' 
                      : 'bg-slate-900 text-white border-slate-800 hover:border-yellow-500/50 hover:text-yellow-500 shadow-lg'}
                  `}
                >
                  <Zap className={`w-4 h-4 ${isMyTurn && wordLen >= 3 ? 'text-yellow-500' : 'text-slate-800'}`} />
                  <span className="uppercase tracking-widest">ARM BOMB</span>
                </button>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3">
            <button
              onClick={onSkipTurn}
              disabled={!isMyTurn}
              className={`
                flex-1 p-2.5 rounded-lg font-mono font-bold text-[9px] tracking-widest transition-all flex items-center justify-center gap-2 border shadow-md active:scale-95
                ${!isMyTurn
                  ? 'bg-slate-900/60 text-slate-800 border-slate-800 cursor-not-allowed'
                  : 'bg-slate-950 text-slate-600 border-slate-800 hover:bg-slate-900 hover:text-white hover:border-slate-700'}
              `}
            >
              <LogOut className="w-3.5 h-3.5 rotate-90" />
              SKIP TURN
            </button>
            <button onClick={() => setIsSettingsModalOpen(true)} className="p-2.5 bg-slate-950 text-slate-600 border border-slate-800 rounded-lg hover:text-white transition-all active:scale-95">
              <Settings className="w-4 h-4" />
            </button>
            <button onClick={() => setIsHistoryModalOpen(true)} className="p-2.5 bg-slate-950 text-slate-600 border border-slate-800 rounded-lg hover:text-white transition-all active:scale-95">
              <History className="w-4 h-4" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-950/20 border border-red-500/30 p-2 rounded-lg text-red-500 text-[8px] font-mono font-bold uppercase tracking-widest flex items-center gap-2">
              <Info className="w-3 h-3 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
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
