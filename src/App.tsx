import React, { useState } from 'react';
import { useGameLogic } from './hooks/useGameLogic';
import { PlacementScreen } from './components/PlacementScreen';
import { BattleScreen } from './components/BattleScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { TutorialScreen } from './components/TutorialScreen';
import { SettingsModal } from './components/SettingsModal';
import { motion, AnimatePresence } from 'motion/react';
import { Sword, BookOpen, Settings, Play, Info } from 'lucide-react';

export default function App() {
  const {
    gameState,
    message,
    error,
    placeTile,
    removeTileAt,
    finalizeSetup,
    fire,
    executeBomb,
    resetGame,
    setWinMode,
    updatePlayerName,
    toggleAI,
    setDifficulty,
    undoPlacement,
    autoPlace,
    toggleSound,
    isSoundEnabled,
    skipTurn,
    reorderBank,
  } = useGameLogic();

  const [showMenu, setShowMenu] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showSetupPass, setShowSetupPass] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleStartGame = () => {
    setShowMenu(false);
    setShowTutorial(false);
    setShowSetupPass(false);
    resetGame();
  };

  const handleFinalizeSetup = (playerId: 1 | 2) => {
    finalizeSetup(playerId);
    if (playerId === 1 && !gameState.players[2].isAI) {
      setShowSetupPass(true);
    }
  };

  if (showTutorial) {
    return <TutorialScreen onBack={() => setShowTutorial(false)} />;
  }

  if (showMenu) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-start p-4 overflow-y-auto relative custom-scrollbar">
        {isSettingsOpen && (
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            gameState={gameState}
            onRestart={resetGame}
            onQuit={() => {}}
            onToggleSound={toggleSound}
            isSoundEnabled={isSoundEnabled}
            onSetDifficulty={setDifficulty}
          />
        )}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col items-center gap-8 z-10 w-full max-w-6xl relative mx-auto"
        >
          <div className="flex flex-col items-center gap-6 text-center">
            <img 
              src="/new logo.png" 
              alt="LEXICON Logo" 
              className="w-full max-w-5xl max-h-[45vh] object-contain relative z-20"
            />
          </div>

          <div className="flex flex-col gap-10 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest px-2">Commander 1</label>
                <input
                  type="text"
                  value={gameState.players[1].name}
                  onChange={(e) => updatePlayerName(1, e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-5 text-xl font-bold text-white focus:border-yellow-600/50 focus:outline-none transition-all uppercase"
                  placeholder="NAME..."
                />
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center px-2">
                  <label className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest">Commander 2</label>
                  <button 
                    onClick={() => toggleAI(2)}
                    className={`text-[9px] font-mono font-bold px-3 py-1 rounded border transition-all uppercase ${gameState.players[2].isAI ? 'bg-yellow-600 text-slate-950 border-yellow-600' : 'text-slate-600 border-slate-800'}`}
                  >
                    {gameState.players[2].isAI ? 'A.I.' : 'HUMAN'}
                  </button>
                </div>
                <input
                  type="text"
                  value={gameState.players[2].name}
                  onChange={(e) => updatePlayerName(2, e.target.value)}
                  disabled={gameState.players[2].isAI}
                  className={`w-full bg-slate-900 border border-slate-800 rounded-xl p-5 text-xl font-bold text-white focus:border-yellow-600/50 focus:outline-none transition-all uppercase ${gameState.players[2].isAI ? 'opacity-30 cursor-not-allowed' : ''}`}
                  placeholder="NAME..."
                />
                {gameState.players[2].isAI && (
                  <div className="flex gap-2 mt-2">
                    {(['easy', 'medium', 'hard'] as const).map(diff => (
                      <button
                        key={diff}
                        onClick={() => setDifficulty(2, diff)}
                        className={`flex-1 py-2 rounded text-[9px] font-mono font-bold uppercase transition-all border ${gameState.players[2].difficulty === diff ? 'bg-slate-200 text-slate-950 border-white' : 'bg-slate-900 text-slate-600 border-slate-800'}`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleStartGame}
              className="w-full p-8 bg-yellow-600 hover:bg-yellow-500 text-slate-950 rounded-2xl font-black text-4xl transition-all flex items-center justify-center gap-4 border-4 border-yellow-500 shadow-xl active:scale-[0.98] uppercase"
            >
              <Play className="w-10 h-10 fill-current" />
              INITIATE
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <button onClick={() => setShowTutorial(true)} className="p-4 bg-slate-900 hover:bg-slate-800 text-slate-500 rounded-xl font-mono font-bold text-[10px] tracking-widest transition-all flex items-center justify-center gap-4 border border-slate-800 uppercase active:scale-95">
                <BookOpen className="w-5 h-5" /> Codex
              </button>
              <button onClick={() => setIsSettingsOpen(true)} className="p-4 bg-slate-900 hover:bg-slate-800 text-slate-500 rounded-xl font-mono font-bold text-[10px] tracking-widest transition-all flex items-center justify-center gap-4 border border-slate-800 uppercase active:scale-95">
                <Settings className="w-5 h-5" /> Config
              </button>
            </div>

          </div>

          <div className="flex flex-col gap-6 w-full bg-slate-900/40 p-6 sm:p-8 rounded-3xl border border-slate-800">
            <div className="flex items-center gap-3 text-slate-600 relative z-10">
              <Info className="w-4 h-4" />
              <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest">Victory Protocol</h4>
            </div>
            <div className="flex gap-3 relative z-10">
              {(['classic', 'lexicon', 'hybrid'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setWinMode(mode)}
                  className={`flex-1 p-3 rounded text-[10px] font-mono font-bold transition-all uppercase border ${gameState.winMode === mode ? 'bg-slate-100 text-slate-950 border-white' : 'bg-slate-900 text-slate-600 border-slate-800'}`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <div className="bg-slate-950/50 p-4 rounded border border-slate-800 relative z-10">
              <p className="text-[11px] font-mono font-bold text-slate-600 italic text-center uppercase tracking-widest">
                {gameState.winMode === 'classic' && 'Destroy all 15 enemy tiles'}
                {gameState.winMode === 'lexicon' && 'Fire an 8-letter bomb'}
                {gameState.winMode === 'hybrid' && 'Destroy 10 tiles OR fire 7-letter bomb'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-slate-950 text-slate-100 font-sans selection:bg-yellow-500/30">
      <AnimatePresence mode="wait">
        {isSettingsOpen && (
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            gameState={gameState}
            onRestart={resetGame}
            onQuit={() => setShowMenu(true)}
            onToggleSound={toggleSound}
            isSoundEnabled={isSoundEnabled}
            onSetDifficulty={setDifficulty}
          />
        )}
        {gameState.phase === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex items-center justify-center min-h-screen"
          >
            {showSetupPass ? (
              <div className="flex flex-col items-center gap-12 p-20 bg-slate-900 rounded-[3rem] border border-slate-800 text-center max-w-xl relative overflow-hidden">
                <h2 className="text-6xl font-black text-white tracking-tighter italic uppercase">PASS DEVICE</h2>
                <div className="bg-slate-950 py-3 px-8 rounded-full border border-slate-800">
                  <p className="text-slate-600 font-mono text-[10px] font-bold uppercase tracking-widest italic">
                    {gameState.players[2].name.toUpperCase()} DEPLOYMENT
                  </p>
                </div>
                <button
                  onClick={() => setShowSetupPass(false)}
                  className="w-full p-8 bg-yellow-600 hover:bg-yellow-500 text-slate-950 rounded-2xl font-black text-3xl transition-all border-4 border-yellow-500 uppercase active:scale-95"
                >
                  I AM READY
                </button>
              </div>
            ) : gameState.players[gameState.activePlayer].isAI ? (
              <div className="flex flex-col items-center gap-6">
                <div className="w-12 h-12 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin" />
                <h2 className="text-xl font-bold text-white uppercase italic">
                  Placing Tactical Units...
                </h2>
              </div>
            ) : (
              <PlacementScreen
                player={gameState.players[gameState.activePlayer]}
                onPlace={(r, c, t, o) => placeTile(gameState.activePlayer, r, c, t, o)}
                onFinalize={() => handleFinalizeSetup(gameState.activePlayer)}
                onUndo={undoPlacement}
                onAutoPlace={autoPlace}
                onQuit={() => setShowMenu(true)}
                error={error}
                onRemoveAt={(pid, r, c) => removeTileAt(pid, r, c)}
              />
            )}
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
              onReorderBank={reorderBank}
              onQuit={() => setShowMenu(true)}
              onRestart={resetGame}
              message={message}
              error={error}
              onToggleSound={toggleSound}
              isSoundEnabled={isSoundEnabled}
              onSetDifficulty={setDifficulty}
              onSkipTurn={skipTurn}
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
