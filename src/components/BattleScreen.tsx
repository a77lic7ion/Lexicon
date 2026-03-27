import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UnifiedGrid } from './UnifiedGrid';
import { GameHistoryModal } from './GameHistoryModal';
import { SettingsModal } from './SettingsModal';
import { Tile } from './Tile';
import { Zap, Target, History, Settings, Trophy, LogOut, RefreshCw } from 'lucide-react';
import { GameState, Difficulty } from '../types';
import { BOMB_EFFECTS } from '../constants';
import { validateWordOnline } from '../utils/dictionary';

interface BattleScreenProps {
  gameState: GameState;
  onFire: (r: number, c: number) => void;
  onExecuteBomb: (word: string, target: any) => void;
  onReorderBank: (playerId: 1 | 2, newBank: any[]) => void;
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
  onReorderBank,
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
  const [assembly, setAssembly] = useState<{ id: string; letter: string }[]>([]);
  const [wildPickFor, setWildPickFor] = useState<string | null>(null);
  const [swapIndex, setSwapIndex] = useState<number | null>(null);
  const [swapMode, setSwapMode] = useState(false);

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
  const shouldShowBank = !isTargeting;

  const renderBankGrid = (bank: typeof viewingPlayer.bank, hidden: boolean, interactive: boolean) => {
    return (
      <div className="bg-slate-900/40 rounded border border-slate-800 p-2 w-full">
        <div
          className="grid gap-1.5 justify-items-center content-start min-h-[88px] w-full"
          style={{ gridTemplateColumns: `repeat(auto-fit, minmax(1.5rem, 1fr))` }}
        >
          {bank.map((tile, idx) => (
            <Tile
              key={tile.uniqueId || `${tile.id}-${idx}`}
              tile={tile}
              className="w-6 h-6 rounded-lg border"
              showPoints={false}
              hidden={hidden}
              compact={true}
              onClick={!hidden && interactive ? () => {
                if (swapMode) {
                  if (swapIndex === null) {
                    setSwapIndex(idx);
                    return;
                  }
                  if (swapIndex === idx) {
                    setSwapIndex(null);
                    return;
                  }
                  const newBank = [...bank];
                  [newBank[swapIndex], newBank[idx]] = [newBank[idx], newBank[swapIndex]];
                  onReorderBank(viewingPlayerId, newBank as any);
                  setSwapIndex(null);
                  return;
                }

                if (tile.letter === '★') {
                  setWildPickFor(tile.id);
                  return;
                }
                setAssembly(prev => [...prev, { id: tile.id, letter: tile.letter }]);
              } : undefined}
            />
          ))}
          {bank.length === 0 && (
            <div className="col-span-full flex items-center justify-center w-full h-full text-slate-800 text-[7px] font-mono font-bold uppercase tracking-widest italic opacity-30">
              Empty
            </div>
          )}
        </div>
      </div>
    );
  };

  const wildcardSubs = (() => {
    const upperWord = bombWord.trim().toUpperCase();
    if (!upperWord) return [] as string[];
    const bankLetters = viewingPlayer.bank.map(l => l.letter);
    const temp: string[] = [...bankLetters];
    const missing: string[] = [];
    for (const ch of upperWord) {
      const i = temp.indexOf(ch);
      if (i !== -1) {
        temp.splice(i, 1);
        continue;
      }
      const wi = temp.indexOf('★');
      if (wi !== -1) {
        temp.splice(wi, 1);
        missing.push(ch);
      }
    }
    return missing;
  })();

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

  useEffect(() => {
    setBombWord(assembly.map(a => a.letter).join(''));
  }, [assembly]);

  const validateBombLocal = () => {
    const upperWord = assembly.map(a => a.letter).join('');
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

  const handleArmBomb = async () => {
    const err = validateBombLocal();
    if (err) {
      setBombError(err);
      return;
    }
    const ok = await validateWordOnline(bombWord.trim());
    if (!ok) {
      setBombError('Invalid word');
      return;
    }
    
    if (targetingType === null) {
      onExecuteBomb(bombWord.trim().toUpperCase(), {});
      setAssembly([]);
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
    <div className="flex flex-row gap-0 bg-slate-950 h-full w-full relative overflow-hidden">
      {/* Logo Name - Top Left */}
      <div className="absolute top-2 left-2 z-40">
        <span className="text-2xl font-serif font-black text-yellow-500 tracking-tight uppercase drop-shadow-lg">LEXICON</span>
      </div>

      {/* Main Content - Expanded */}
      <div className="flex-1 flex flex-col items-center justify-center p-2 px-[1cm] min-h-0 overflow-hidden">
        <div className="flex flex-col items-center justify-center w-full max-w-none h-full py-2">
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
      </div>

      <div className="w-64 md:w-72 border-l border-slate-900 bg-slate-950 flex flex-col h-screen relative z-20 shrink-0">
        <div className="p-3 flex flex-col h-full overflow-y-auto custom-scrollbar">
          {/* Top: Opponent Info */}
          <div className="flex flex-col gap-2 mb-3">
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-600 truncate">
              {opponent.name}
            </span>
            {renderBankGrid(opponent.bank, true, false)}
          </div>

          {/* Center: Victory Conditions */}
          <div className="flex flex-col gap-2 mb-3">
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

          {/* Separator */}
          <div className="flex items-center justify-center py-2">
            <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">●</span>
          </div>

          {/* Bottom: Word Bomb + controls - Expanded */}
          <div className="flex-1 flex flex-col justify-center gap-3 py-2 min-h-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={message}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full p-1.5 bg-slate-900 text-slate-400 text-[10px] font-mono text-center uppercase border border-slate-800"
              >
                {isTargeting ? `SELECT TARGET: ${currentEffect?.name}` : message}
              </motion.div>
            </AnimatePresence>

            <div className="flex gap-2">
              <button
                onClick={onSkipTurn}
                disabled={!isMyTurn}
                className="flex-1 p-2 bg-slate-950 text-slate-600 border border-slate-900 text-[9px] font-bold uppercase hover:bg-slate-900 disabled:opacity-30"
              >
                SKIP TURN
              </button>
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="p-2 bg-slate-950 text-slate-600 border border-slate-900 hover:bg-slate-900"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsHistoryModalOpen(true)}
                className="p-2 bg-slate-950 text-slate-600 border border-slate-900 hover:bg-slate-900"
                title="Game History"
              >
                <History className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-2 bg-red-950/20 text-red-600 text-[9px] font-mono uppercase text-center border border-red-900/30">
                {error}
              </div>
            )}
            
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-2 text-slate-600">
                <Zap className="w-3 h-3" />
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest">Word Bomb</span>
              </div>
              <div className="grid grid-cols-[1fr] gap-2 p-2 bg-slate-950 border border-slate-900 rounded flex-1">
                <div className="flex flex-col gap-1.5">
                  <div className="flex flex-wrap gap-1 min-h-[28px]">
                    {assembly.map((t, i) => (
                      <div key={`${t.id}-${i}`} className="relative">
                        <Tile tile={{ id: t.id, letter: t.letter, tier: 'common', points: 0, size: 1 } as any} className="w-6 h-6" showPoints={false} />
                        <button onClick={() => setAssembly(prev => prev.filter((_, idx) => idx !== i))} className="absolute -top-1 -right-1 text-[8px] px-1 bg-slate-800 text-slate-400 border border-slate-700">x</button>
                      </div>
                    ))}
                    {assembly.length === 0 && <span className="text-[8px] font-mono text-slate-600 uppercase">Click tiles to add</span>}
                  </div>
                  {wildPickFor && (
                    <div className="grid grid-cols-6 gap-1">
                      {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(ch => (
                        <button key={ch} onClick={() => { setAssembly(prev => [...prev, { id: wildPickFor, letter: ch }]); setWildPickFor(null); }} className="p-1 text-[9px] font-mono bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800">
                          {ch}
                        </button>
                      ))}
                    </div>
                  )}
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
                  <div className="flex gap-1">
                    <button onClick={() => setAssembly([])} className="flex-1 p-1 text-[8px] font-mono bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 uppercase">Clear</button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
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
                      disabled={!isMyTurn || assembly.length < 3}
                      className="w-full p-3 bg-slate-900 text-slate-400 border border-slate-800 font-bold text-[10px] uppercase hover:bg-slate-800 disabled:opacity-30 transition-colors flex items-center justify-center gap-2"
                    >
                      <Zap className="w-3 h-3" /> ARM BOMB
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: My bank */}
          <div className="flex flex-col gap-1 mt-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-600 truncate">
                {viewingPlayer.name}
              </span>
              <button
                onClick={() => {
                  setSwapMode(m => !m);
                  setSwapIndex(null);
                }}
                className="text-[8px] font-mono text-slate-500 border border-slate-800 px-1"
              >
                {swapMode ? 'Done' : 'Swap'}
              </button>
            </div>
            {renderBankGrid(viewingPlayer.bank, false, true)}
          </div>
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
        onSetDifficulty={onSetDifficulty}
      />
    </div>
  );
};
