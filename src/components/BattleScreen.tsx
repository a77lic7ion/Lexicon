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
    <div className="grid grid-cols-[240px_1fr_360px] bg-slate-950 h-screen w-full relative overflow-hidden">
      {/* LEFT COLUMN: Logo & Win Conditions */}
      <div className="flex flex-col gap-6 p-4 border-r border-slate-900 bg-slate-950/50 overflow-y-auto custom-scrollbar">
        <div className="flex flex-col gap-4">
          <img 
            src="/new logo.png" 
            alt="LEXICON Logo" 
            className="w-full object-contain rounded-lg border border-slate-800 shadow-xl"
          />
          <span className="text-xl font-serif font-black text-yellow-500 tracking-tight uppercase text-center">LEXICON</span>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-slate-500 px-1">
            <Trophy className="w-4 h-4" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Win Conditions</span>
          </div>
          <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 flex flex-col gap-3 shadow-inner">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Classic</span>
              <span className="text-[10px] font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded">15 Tiles</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Lexicon</span>
              <span className="text-[10px] font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded">100 Pts</span>
            </div>
            <div className="pt-2 border-t border-slate-800 mt-1">
              <p className="text-[9px] font-mono text-slate-600 italic leading-relaxed">
                {gameState.winMode === 'classic' && 'Destroy all 15 enemy tiles to achieve victory.'}
                {gameState.winMode === 'lexicon' && 'Fire an 8-letter bomb to achieve victory.'}
                {gameState.winMode === 'hybrid' && 'Destroy 10 tiles OR fire 7-letter bomb.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE COLUMN: Game Board */}
      <div className="flex flex-col items-center justify-center p-4 min-h-0 overflow-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/20 to-transparent">
        <div className="w-full h-full flex items-center justify-center">
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

      {/* RIGHT COLUMN: Player Info & Controls */}
      <div className="border-l border-slate-900 bg-slate-950 flex flex-col h-screen relative z-20 shrink-0 overflow-hidden">
        <div className="p-4 flex flex-col h-full overflow-y-auto custom-scrollbar gap-6">
          {/* Opponent Section */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-baseline px-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-600">
                Enemy Commander
              </span>
              <span className="text-xs font-bold text-red-600 uppercase italic">
                {opponent.name}
              </span>
            </div>
            {renderBankGrid(opponent.bank, true, false)}
          </div>

          <div className="h-px bg-slate-900 mx-2" />

          {/* Turn & Status Section */}
          <div className="flex flex-col gap-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={message}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`w-full p-3 rounded-lg text-center uppercase border shadow-lg ${
                  isTargeting 
                  ? 'bg-yellow-900/20 border-yellow-600/50 text-yellow-500' 
                  : 'bg-slate-900 border-slate-800 text-slate-400'
                } text-[11px] font-mono font-bold`}
              >
                {isTargeting ? `SELECT TARGET: ${currentEffect?.name}` : message}
              </motion.div>
            </AnimatePresence>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={onSkipTurn}
                disabled={!isMyTurn}
                className="col-span-1 p-2 bg-slate-900 hover:bg-slate-800 text-slate-500 border border-slate-800 rounded font-mono text-[9px] font-bold uppercase transition-all disabled:opacity-30"
              >
                Skip
              </button>
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-500 border border-slate-800 rounded flex items-center justify-center transition-all"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsHistoryModalOpen(true)}
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-500 border border-slate-800 rounded flex items-center justify-center transition-all"
                title="Game History"
              >
                <History className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-2 bg-red-950/20 text-red-500 text-[10px] font-mono uppercase text-center border border-red-900/30 rounded"
              >
                {error}
              </motion.div>
            )}
          </div>

          <div className="h-px bg-slate-900 mx-2" />

          {/* Word Bomb Section */}
          <div className="flex flex-col gap-3 flex-1 min-h-0">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-slate-500">
                <Zap className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Tactical Bomb</span>
              </div>
              {assembly.length > 0 && (
                <button 
                  onClick={() => setAssembly([])} 
                  className="text-[9px] font-mono text-red-500 hover:text-red-400 uppercase font-bold"
                >
                  Clear
                </button>
              )}
            </div>
            
            <div className="flex flex-col gap-3 p-3 bg-slate-900/40 border border-slate-800 rounded-xl shadow-inner min-h-[140px]">
              <div className="flex flex-wrap gap-2 min-h-[40px] items-start">
                {assembly.map((t, i) => (
                  <motion.div 
                    key={`${t.id}-${i}`} 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative"
                  >
                    <Tile tile={{ id: t.id, letter: t.letter, tier: 'common', points: 0, size: 1 } as any} className="w-8 h-8 rounded-lg shadow-md" showPoints={false} />
                    <button 
                      onClick={() => setAssembly(prev => prev.filter((_, idx) => idx !== i))} 
                      className="absolute -top-1.5 -right-1.5 text-[8px] w-4 h-4 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 border border-slate-700 hover:bg-red-900 hover:text-white transition-colors"
                    >
                      ×
                    </button>
                  </motion.div>
                ))}
                {assembly.length === 0 && (
                  <div className="w-full flex flex-col items-center justify-center py-4 text-slate-700 gap-1 opacity-50">
                    <span className="text-[9px] font-mono uppercase tracking-widest">Assembly Required</span>
                    <span className="text-[8px] font-mono italic">Select tiles to build bomb</span>
                  </div>
                )}
              </div>

              {wildPickFor && (
                <div className="grid grid-cols-7 gap-1 p-2 bg-slate-950 rounded border border-slate-800 mt-1">
                  {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(ch => (
                    <button 
                      key={ch} 
                      onClick={() => { setAssembly(prev => [...prev, { id: wildPickFor, letter: ch }]); setWildPickFor(null); }} 
                      className="aspect-square flex items-center justify-center text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-400 hover:bg-yellow-600 hover:text-slate-950 transition-all rounded"
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              )}

              {bombError && (
                <span className="text-[9px] font-mono font-bold text-red-600 uppercase bg-red-950/20 px-2 py-1 rounded">
                  {bombError}
                </span>
              )}

              {currentEffect && (
                <div className="flex flex-col gap-1 p-2 bg-yellow-950/10 border border-yellow-900/20 rounded">
                  <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-tight">{currentEffect.name}</span>
                  <span className="text-[9px] font-mono text-slate-500 leading-tight">
                    {currentEffect.description}
                  </span>
                </div>
              )}

              <div className="mt-auto">
                {isTargeting ? (
                  <div className="flex flex-col gap-2">
                    {(wordLen === 3 || wordLen === 5 || wordLen >= 8) && (
                      <div className="flex gap-1 p-1 bg-slate-950 rounded border border-slate-800">
                        <button 
                          onClick={() => setRowColToggle('row')}
                          className={`flex-1 py-1.5 text-[9px] font-mono font-bold transition-all rounded ${rowColToggle === 'row' ? 'bg-yellow-600 text-slate-950' : 'text-slate-500'}`}
                        >ROW</button>
                        <button 
                          onClick={() => setRowColToggle('col')}
                          className={`flex-1 py-1.5 text-[9px] font-mono font-bold transition-all rounded ${rowColToggle === 'col' ? 'bg-yellow-600 text-slate-950' : 'text-slate-500'}`}
                        >COL</button>
                      </div>
                    )}
                    <button
                      onClick={() => setIsTargeting(false)}
                      className="w-full p-2.5 bg-red-950/20 text-red-500 border border-red-900/30 rounded font-bold text-[10px] uppercase tracking-widest hover:bg-red-900/20 transition-all"
                    >
                      Cancel Target
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleArmBomb}
                    disabled={!isMyTurn || assembly.length < 3}
                    className="w-full p-3 bg-yellow-600 hover:bg-yellow-500 disabled:bg-slate-900 text-slate-950 disabled:text-slate-700 rounded-xl border-b-4 border-yellow-700 disabled:border-slate-800 font-black text-[12px] uppercase transition-all flex items-center justify-center gap-2 active:translate-y-0.5 active:border-b-0 shadow-lg"
                  >
                    <Zap className="w-4 h-4 fill-current" /> ARM BOMB
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-900 mx-2" />

          {/* Active Player Section */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-600">
                Commanding Officer
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-500 uppercase italic">
                  {viewingPlayer.name}
                </span>
                <button
                  onClick={() => {
                    setSwapMode(m => !m);
                    setSwapIndex(null);
                  }}
                  className={`text-[9px] font-mono px-2 py-0.5 rounded transition-all border ${
                    swapMode 
                    ? 'bg-yellow-600 text-slate-950 border-yellow-700 font-bold' 
                    : 'text-slate-500 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  {swapMode ? 'FINISH' : 'SWAP'}
                </button>
              </div>
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
