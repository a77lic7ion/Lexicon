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
    // If it was player 1 and player 2 is human, show pass device
    if (playerId === 1 && !gameState.players[2].isAI) {
      setShowSetupPass(true);
    }
  };

  if (showTutorial) {
    return <TutorialScreen onBack={() => setShowTutorial(false)} />;
  }

  if (showMenu) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-12 overflow-hidden relative grid-blueprint">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(234,179,8,0.15),transparent_70%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-blue-500/5 rounded-full blur-[180px] pointer-events-none" />

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col items-center gap-16 z-10 max-w-2xl w-full relative"
        >
          <div className="flex flex-col items-center gap-10 text-center">
            <motion.div
              animate={{ rotate: [0, 3, -3, 0], scale: [1, 1.02, 1.02, 1] }}
              transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
              className="bg-slate-900 p-12 rounded-[4rem] border-8 border-slate-800 shadow-[0_60px_120px_rgba(0,0,0,0.8)] relative group overflow-hidden"
            >
              {/* Inner Bezel */}
              <div className="absolute inset-2 rounded-[3.5rem] border-4 border-white/5 bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-10" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-[4rem]" />
              <Sword className="w-32 h-32 text-yellow-500 drop-shadow-[0_0_25px_rgba(234,179,8,0.6)] relative z-20" />
            </motion.div>
            <div className="flex flex-col gap-4">
              <h1 className="text-[10rem] font-serif font-black text-white tracking-tighter drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] leading-[0.8]">
                LEXICON
              </h1>
              <p className="text-slate-500 font-mono text-[11px] font-black uppercase tracking-[0.6em] italic bg-slate-950/50 py-2 px-8 rounded-full border-2 border-slate-800/50 shadow-inner">
                The Ultimate Word-Harvesting Battle
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-10 w-full">
            <div className="grid grid-cols-2 gap-8">
              <div className="flex flex-col gap-4">
                <label className="text-[11px] font-mono font-black text-slate-500 uppercase tracking-[0.3em] px-4">Commander 1</label>
                <div className="relative group">
                  <input 
                    type="text" 
                    value={gameState.players[1].name}
                    onChange={(e) => updatePlayerName(1, e.target.value)}
                    className="w-full bg-slate-900/80 border-4 border-slate-800 rounded-3xl p-6 text-2xl font-serif font-black text-white focus:border-yellow-500/50 focus:outline-none transition-all shadow-2xl placeholder:text-slate-700 relative z-10"
                    placeholder="NAME..."
                  />
                  <div className="absolute inset-0 bg-yellow-500/0 group-hover:bg-yellow-500/5 blur-xl transition-all rounded-3xl" />
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center px-4">
                  <label className="text-[11px] font-mono font-black text-slate-500 uppercase tracking-[0.3em]">Commander 2</label>
                  <button 
                    onClick={() => toggleAI(2)}
                    className={`text-[10px] font-mono font-black px-4 py-1.5 rounded-xl border-2 transition-all tracking-[0.2em] uppercase ${gameState.players[2].isAI ? 'bg-yellow-500 text-slate-950 border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.4)]' : 'text-slate-500 border-slate-800 hover:border-slate-600'}`}
                  >
                    {gameState.players[2].isAI ? 'A.I. CORE' : 'HUMAN'}
                  </button>
                </div>
                <div className="relative group">
                  <input 
                    type="text" 
                    value={gameState.players[2].name}
                    onChange={(e) => updatePlayerName(2, e.target.value)}
                    disabled={gameState.players[2].isAI}
                    className={`w-full bg-slate-900/80 border-4 border-slate-800 rounded-3xl p-6 text-2xl font-serif font-black text-white focus:border-yellow-500/50 focus:outline-none transition-all shadow-2xl placeholder:text-slate-700 relative z-10 ${gameState.players[2].isAI ? 'opacity-30 cursor-not-allowed' : ''}`}
                    placeholder="NAME..."
                  />
                  {!gameState.players[2].isAI && <div className="absolute inset-0 bg-yellow-500/0 group-hover:bg-yellow-500/5 blur-xl transition-all rounded-3xl" />}
                </div>
                {gameState.players[2].isAI && (
                  <div className="flex gap-3 mt-2">
                    {(['easy', 'medium', 'hard'] as const).map(diff => (
                      <button
                        key={diff}
                        onClick={() => setDifficulty(2, diff)}
                        className={`flex-1 py-3 rounded-2xl text-[10px] font-mono font-black uppercase tracking-[0.2em] transition-all border-4 ${gameState.players[2].difficulty === diff ? 'bg-slate-100 text-slate-950 border-white shadow-[0_10px_20px_rgba(255,255,255,0.1)]' : 'bg-slate-900 text-slate-600 border-slate-800 hover:bg-slate-800'}`}
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
              className="group relative w-full p-10 bg-yellow-500 hover:bg-yellow-400 text-slate-950 rounded-[3rem] font-serif font-black text-5xl transition-all flex items-center justify-center gap-6 shadow-[0_30px_60px_rgba(234,179,8,0.3)] border-8 border-yellow-300 overflow-hidden active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent opacity-50" />
              <Play className="w-14 h-14 fill-current drop-shadow-xl group-hover:scale-110 transition-transform" />
              INITIATE BATTLE
            </button>

            <div className="grid grid-cols-2 gap-8">
              <button 
                onClick={() => setShowTutorial(true)}
                className="p-6 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-[2.5rem] font-mono font-black text-[11px] tracking-[0.4em] transition-all flex items-center justify-center gap-6 border-4 border-slate-800 shadow-2xl uppercase group active:scale-95"
              >
                <BookOpen className="w-8 h-8 text-slate-600 group-hover:text-yellow-500 transition-colors" />
                Codex
              </button>
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-6 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-[2.5rem] font-mono font-black text-[11px] tracking-[0.4em] transition-all flex items-center justify-center gap-6 border-4 border-slate-800 shadow-2xl uppercase group active:scale-95"
              >
                <Settings className="w-8 h-8 text-slate-600 group-hover:text-blue-500 transition-colors" />
                Config
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-8 w-full bg-slate-900/40 p-10 rounded-[4rem] border-4 border-slate-800 shadow-[0_40px_80px_rgba(0,0,0,0.4)] backdrop-blur-md relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            <div className="flex items-center gap-4 text-slate-500 relative z-10">
              <div className="p-2 bg-yellow-500/10 rounded-xl border-2 border-yellow-500/20">
                <Info className="w-6 h-6 text-yellow-500" />
              </div>
              <h4 className="text-[11px] font-mono font-black uppercase tracking-[0.4em]">Victory Protocol</h4>
            </div>
            <div className="flex gap-4 relative z-10">
              {(['classic', 'lexicon', 'hybrid'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setWinMode(mode)}
                  className={`flex-1 p-4 rounded-2xl text-[11px] font-mono font-black transition-all uppercase tracking-[0.2em] border-4 ${gameState.winMode === mode ? 'bg-slate-100 text-slate-950 border-white shadow-2xl scale-105' : 'bg-slate-900 text-slate-600 border-slate-800 hover:bg-slate-800'}`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <div className="bg-slate-950/50 p-6 rounded-3xl border-2 border-slate-800/50 relative z-10">
              <p className="text-[13px] font-mono font-black text-slate-500 italic text-center uppercase tracking-widest">
                {gameState.winMode === 'classic' && 'Destroy all 15 enemy tiles first'}
                {gameState.winMode === 'lexicon' && 'Fire an 8-letter Obliterate bomb to win'}
                {gameState.winMode === 'hybrid' && 'Destroy 10 tiles OR fire a 7+ letter bomb'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-yellow-500/30">
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
              <div className="flex flex-col items-center gap-16 p-20 bg-slate-900 rounded-[5rem] border-8 border-slate-800 shadow-[0_60px_120px_rgba(0,0,0,0.8)] text-center max-w-xl grid-blueprint relative overflow-hidden">
                {/* Inner Bezel */}
                <div className="absolute inset-2 rounded-[4.5rem] border-4 border-white/5 bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-10" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                
                <div className="w-32 h-32 bg-yellow-500/10 rounded-[3rem] flex items-center justify-center border-4 border-yellow-500/20 shadow-[0_0_40px_rgba(234,179,8,0.2)] relative z-20">
                  <Play className="w-16 h-16 text-yellow-500 fill-current drop-shadow-lg" />
                </div>
                
                <div className="flex flex-col gap-6 relative z-20">
                  <h2 className="text-7xl font-serif font-black text-white tracking-tighter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] uppercase">PASS DEVICE</h2>
                  <div className="bg-slate-950/50 py-3 px-8 rounded-full border-2 border-slate-800/50">
                    <p className="text-slate-500 font-mono text-[11px] font-black uppercase tracking-[0.5em] italic">
                      It is now {gameState.players[2].name.toUpperCase()}'s turn to deploy
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowSetupPass(false)}
                  className="relative group w-full p-10 bg-yellow-500 hover:bg-yellow-400 text-slate-950 rounded-[3rem] font-serif font-black text-4xl transition-all shadow-[0_30px_60px_rgba(234,179,8,0.3)] border-8 border-yellow-300 overflow-hidden active:scale-95 z-20"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent opacity-50" />
                  I AM READY
                </button>
              </div>
            ) : gameState.players[gameState.activePlayer].isAI ? (
              <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                <h2 className="text-2xl font-serif font-bold text-white">
                  {gameState.players[gameState.activePlayer].name} is placing tiles...
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
