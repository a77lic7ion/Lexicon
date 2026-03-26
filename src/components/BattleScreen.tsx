import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UnifiedGrid } from './UnifiedGrid';
import { LetterBank } from './LetterBank';
import { GameHistoryModal } from './GameHistoryModal';
import { SettingsModal } from './SettingsModal';
import { Zap, Target, History, Settings, Info, Trophy, LogOut, RefreshCw } from 'lucide-react';
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
      if (targetingType === 'area2x2') target.cell = { r, c };

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
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-6 bg-slate-900 p-8 rounded border border-slate-800 max-w-md w-full text-center"
        >
          <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Pass Device</h2>
          <p className="text-slate-400 font-mono text-xs uppercase">
            TO <span className="text-yellow-500">{gameState.players[gameState.activePlayer].name}</span>
          </p>
          <button
            onClick={handleReady}
            className="w-full p-4 bg-emerald-700 hover:bg-emerald-600 text-white rounded font-bold transition-colors"
          >
            READY
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-row gap-0 bg-slate-950 min-h-screen relative overflow-hidden">
      {/* Sidebar */}
      <div className="w-40 border-r border-slate-900 bg-slate-950 flex flex-col h-screen relative z-20 shrink-0">
        <div className="p-3 flex flex-col gap-5 h-full overflow-y-auto custom-scrollbar">
          {/* Header */}
          <div className="flex flex-col gap-1">
            <h1 className="text-lg font-black text-white italic">LEXICON</h1>
            <div className="h-0.5 w-8 bg-yellow-600" />
          </div>

          {/* Winning Conditions */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-slate-600">
              <Trophy className="w-3 h-3" />
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest">Victory</span>
            </div>
            <div className="bg-slate-900/50 rounded border border-slate-800 p-2 flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-[8px] font-mono">
                <span className="text-slate-500 uppercase">Classic</span>
                <span className="text-slate-300">15 Tiles</span>
              </div>
              <div className="flex justify-between items-center text-[8px] font-mono">
                <span className="text-slate-500 uppercase">Lexicon</span>
                <span className="text-slate-300">100 Pts</span>
              </div>
            </div>
          </div>

          {/* Stats Block */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-slate-600">
              <Target className="w-3 h-3" />
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest">Stats</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              <div className="bg-slate-900/50 rounded border border-slate-800 p-2 flex justify-between items-center">
                <span className="text-[8px] font-mono text-slate-500 uppercase">Taken</span>
                <span className="text-[10px] font-bold text-emerald-600">{viewingPlayer.tilesDestroyed}</span>
              </div>
              <div className="bg-slate-900/50 rounded border border-slate-800 p-2 flex justify-between items-center">
                <span className="text-[8px] font-mono text-slate-500 uppercase">Hits</span>
                <span className="text-[10px] font-bold text-red-600">{viewingPlayer.totalHits}</span>
              </div>
              <div className="bg-slate-900/50 rounded border border-slate-800 p-2 flex justify-between items-center">
                <span className="text-[8px] font-mono text-slate-500 uppercase">Score</span>
                <span className="text-[10px] font-bold text-blue-600">{viewingPlayer.score}</span>
              </div>
            </div>
          </div>

          {/* Turn Ticker */}
          <div className="flex flex-col gap-2 flex-1 min-h-0">
            <div className="flex items-center gap-2 text-slate-600">
              <History className="w-3 h-3" />
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest">Ticker</span>
            </div>
            <div className="bg-slate-900/50 rounded border border-slate-800 flex-1 overflow-y-auto p-2 custom-scrollbar">
              {gameState.history.slice(0, 20).map((entry, idx) => (
                <div key={idx} className="mb-2 last:mb-0 border-b border-slate-900 pb-1">
                  <span className={`text-[8px] font-bold uppercase block ${entry.playerId === 1 ? 'text-red-500' : 'text-blue-500'}`}>
                    {gameState.players[entry.playerId].name.slice(0, 15)}
                  </span>
                  <p className="text-[7px] text-slate-500 font-mono leading-tight truncate">
                    {entry.action.toUpperCase()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col gap-1 pt-4 border-t border-slate-900">
            <button onClick={onRestart} className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-500 rounded border border-slate-800 transition-colors flex items-center justify-center gap-2 text-[8px] font-bold uppercase">
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
            <button onClick={onQuit} className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-500 rounded border border-slate-800 transition-colors flex items-center justify-center gap-2 text-[8px] font-bold uppercase">
              <LogOut className="w-3 h-3" /> Quit
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-8 p-8 items-center overflow-y-auto custom-scrollbar">
        {/* Opponent Info */}
        <div className="w-full max-w-[600px] flex flex-col gap-2">
          <div className="flex justify-between items-center px-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase">Opponent: {opponent.name}</span>
            <span className="text-[9px] font-mono text-slate-500 uppercase">Score: {opponent.score}</span>
          </div>
          <LetterBank bank={opponent.bank} title="" hidden={true} />
        </div>

        {/* Board */}
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

        {/* Player Info */}
        <div className="w-full max-w-[600px] flex flex-col gap-2">
          <div className="flex justify-between items-center px-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase">You: {viewingPlayer.name}</span>
            <span className="text-[9px] font-mono text-slate-500 uppercase">Score: {viewingPlayer.score}</span>
          </div>
          <LetterBank bank={viewingPlayer.bank} title="" />
        </div>

        {/* Action Area */}
        <div className="w-full max-w-[600px] flex flex-col gap-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={message}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full p-2 bg-slate-900 text-slate-400 text-[10px] font-mono text-center uppercase border border-slate-800"
            >
              {isTargeting ? `SELECT TARGET: ${currentEffect?.name}` : message}
            </motion.div>
          </AnimatePresence>

          {/* Word Input & Bomb Button */}
          <div className="grid grid-cols-[1fr_auto] gap-3 p-3 bg-slate-950 border border-slate-900 rounded">
            <div className="flex flex-col gap-1.5">
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
                className="w-full bg-slate-950 border border-slate-900 p-2 text-white font-bold focus:outline-none uppercase text-sm"
              />
              {bombError && (
                <span className="text-[8px] font-mono font-bold text-red-600 uppercase">
                  // {bombError}
                </span>
              )}
              {currentEffect && (
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-yellow-600 uppercase">{currentEffect.name}</span>
                  <span className="text-[8px] font-mono text-slate-600 uppercase italic truncate">
                    — {currentEffect.description}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 min-w-[120px]">
              {isTargeting ? (
                <div className="flex flex-col gap-1.5">
                  {(wordLen === 3 || wordLen === 5 || wordLen >= 8) && (
                    <div className="flex gap-1 p-1 bg-slate-900 border border-slate-800">
                      <button 
                        onClick={() => setRowColToggle('row')}
                        className={`flex-1 py-1 text-[8px] font-mono font-bold transition-all ${rowColToggle === 'row' ? 'bg-yellow-600 text-slate-950' : 'text-slate-600'}`}
                      >ROW</button>
                      <button 
                        onClick={() => setRowColToggle('col')}
                        className={`flex-1 py-1 text-[8px] font-mono font-bold transition-all ${rowColToggle === 'col' ? 'bg-yellow-600 text-slate-950' : 'text-slate-600'}`}
                      >COL</button>
                    </div>
                  )}
                  <button
                    onClick={() => setIsTargeting(false)}
                    className="w-full p-2 bg-slate-900 text-red-600 border border-red-900/30 font-bold text-[8px] uppercase tracking-widest hover:bg-slate-800 transition-all"
                  >
                    CANCEL
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleArmBomb}
                  disabled={!isMyTurn || wordLen < 3}
                  className="h-full w-full p-2 bg-slate-900 text-slate-400 border border-slate-800 font-bold text-[10px] uppercase hover:bg-slate-800 disabled:opacity-30 transition-colors flex items-center justify-center gap-2"
                >
                  <Zap className="w-3 h-3" /> ARM BOMB
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={onSkipTurn} disabled={!isMyTurn} className="flex-1 p-2 bg-slate-950 text-slate-600 border border-slate-900 text-[9px] font-bold uppercase hover:bg-slate-900 disabled:opacity-30">
              SKIP TURN
            </button>
            <button onClick={() => setIsSettingsModalOpen(true)} className="p-2 bg-slate-950 text-slate-600 border border-slate-900 hover:bg-slate-900">
              <Settings className="w-4 h-4" />
            </button>
            <button onClick={() => setIsHistoryModalOpen(true)} className="p-2 bg-slate-950 text-slate-600 border border-slate-900 hover:bg-slate-900">
              <History className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <div className="p-2 bg-red-950/20 text-red-600 text-[9px] font-mono uppercase text-center border border-red-900/30">
              {error}
            </div>
          )}
        </div>
      </div>

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
        onSetDifficulty={setDifficulty}
      />
    </div>
  );
};
