import React, { useState } from 'react';
import { useGameLogic } from './hooks/useGameLogic';
import { PlacementScreen } from './components/PlacementScreen';
import { BattleScreen } from './components/BattleScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { TutorialScreen } from './components/TutorialScreen';
import { motion, AnimatePresence } from 'motion/react';
import { Sword, BookOpen, Settings, Play, Info } from 'lucide-react';

export default function App() {
  const {
    gameState,
    message,
    error,
    placeTile,
    finalizeSetup,
    fire,
    executeBomb,
    resetGame,
    setWinMode,
    updatePlayerName,
    toggleAI,
    undoPlacement,
    autoPlace,
  } = useGameLogic();

  const [showMenu, setShowMenu] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);

  const handleStartGame = () => {
    setShowMenu(false);
    setShowTutorial(false);
    resetGame();
  };

  if (showTutorial) {
    return <TutorialScreen onBack={() => setShowTutorial(false)} />;
  }

  if (showMenu) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8 overflow-hidden relative">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(234,179,8,0.05),transparent_70%)]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col items-center gap-12 z-10 max-w-lg w-full"
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 6 }}
              className="bg-yellow-500/10 p-6 rounded-3xl border-2 border-yellow-500/20 shadow-[0_0_50px_rgba(234,179,8,0.1)]"
            >
              <Sword className="w-24 h-24 text-yellow-500" />
            </motion.div>
            <div className="flex flex-col gap-2">
              <h1 className="text-7xl font-serif font-bold text-white tracking-tighter">
                LEXICON
              </h1>
              <p className="text-slate-500 font-mono text-sm uppercase tracking-[0.3em]">
                A Word-Harvesting Battle Game
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6 w-full">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest px-1">Player 1 Name</label>
                <input 
                  type="text" 
                  value={gameState.players[1].name}
                  onChange={(e) => updatePlayerName(1, e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm font-serif font-bold text-white focus:border-yellow-500/50 focus:outline-none transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Player 2 Name</label>
                  <button 
                    onClick={() => toggleAI(2)}
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border transition-all ${gameState.players[2].isAI ? 'bg-yellow-500 text-slate-950 border-yellow-500' : 'text-slate-500 border-slate-800 hover:border-slate-600'}`}
                  >
                    {gameState.players[2].isAI ? 'AI ACTIVE' : 'HUMAN'}
                  </button>
                </div>
                <input 
                  type="text" 
                  value={gameState.players[2].name}
                  onChange={(e) => updatePlayerName(2, e.target.value)}
                  disabled={gameState.players[2].isAI}
                  className={`bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm font-serif font-bold text-white focus:border-yellow-500/50 focus:outline-none transition-colors ${gameState.players[2].isAI ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>

            <button
              onClick={handleStartGame}
              className="group relative w-full p-6 bg-yellow-500 hover:bg-yellow-400 text-slate-950 rounded-2xl font-serif font-bold text-2xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-yellow-500/20 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-[-20deg]" />
              <Play className="w-8 h-8 fill-current" />
              NEW GAME
            </button>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setShowTutorial(true)}
                className="p-4 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-2xl font-serif font-bold text-lg transition-all flex items-center justify-center gap-3 border border-slate-800"
              >
                <BookOpen className="w-6 h-6" />
                TUTORIAL
              </button>
              <button className="p-4 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-2xl font-serif font-bold text-lg transition-all flex items-center justify-center gap-3 border border-slate-800">
                <Settings className="w-6 h-6" />
                SETTINGS
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full bg-slate-900/50 p-6 rounded-3xl border border-slate-800/50">
            <div className="flex items-center gap-2 text-slate-500">
              <Info className="w-4 h-4" />
              <h4 className="text-xs font-mono font-bold uppercase tracking-widest">Select Win Mode</h4>
            </div>
            <div className="flex gap-2">
              {(['classic', 'lexicon', 'hybrid'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setWinMode(mode)}
                  className={`flex-1 p-2 rounded-lg text-[10px] font-mono font-bold transition-all uppercase ${gameState.winMode === mode ? 'bg-slate-100 text-slate-950' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-600 italic text-center">
              {gameState.winMode === 'classic' && 'Destroy all 15 enemy tiles first'}
              {gameState.winMode === 'lexicon' && 'Fire an 8-letter Obliterate bomb to win'}
              {gameState.winMode === 'hybrid' && 'Destroy 10 tiles OR fire a 7+ letter bomb'}
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-yellow-500/30">
      <AnimatePresence mode="wait">
        {gameState.phase === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <PlacementScreen
              player={gameState.players[gameState.activePlayer]}
              onPlace={(r, c, t, o) => placeTile(gameState.activePlayer, r, c, t, o)}
              onFinalize={() => finalizeSetup(gameState.activePlayer)}
              onUndo={undoPlacement}
              onAutoPlace={autoPlace}
              error={error}
            />
          </motion.div>
        )}

        {gameState.phase === 'battle' && (
          <motion.div
            key="battle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <BattleScreen
              gameState={gameState}
              onFire={fire}
              onExecuteBomb={executeBomb}
              message={message}
              error={error}
            />
          </motion.div>
        )}

        {gameState.phase === 'gameover' && (
          <motion.div
            key="gameover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GameOverScreen
              gameState={gameState}
              onRestart={() => {
                resetGame();
                setShowMenu(true);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
