import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Sword, Zap, Shield, Skull, Copy, Target, ChevronRight, ChevronLeft, Home } from 'lucide-react';

interface TutorialScreenProps {
  onBack: () => void;
}

const STAGES = [
  {
    title: "1. The Grid & Setup",
    icon: <Target className="w-8 h-8 text-blue-500" />,
    content: (
      <div className="flex flex-col gap-4">
        <p>Lexicon is played on a 10x10 grid. Before the battle begins, you must secretly place 15 Letter Tiles.</p>
        <ul className="list-disc pl-5 space-y-2 text-slate-400 text-sm">
          <li>Tiles can be placed <span className="text-white font-bold">horizontally or vertically</span>.</li>
          <li>A <span className="text-white font-bold">1-cell buffer</span> is required between all tiles (no touching!).</li>
          <li>You must include at least <span className="text-white font-bold">3 vowels</span> (Common tier).</li>
          <li>Max <span className="text-white font-bold">2 Rare tiles</span> and <span className="text-white font-bold">1 Wildcard</span>.</li>
        </ul>
      </div>
    )
  },
  {
    title: "2. Harvesting Letters",
    icon: <Sword className="w-8 h-8 text-red-500" />,
    content: (
      <div className="flex flex-col gap-4">
        <p>On your turn, you can <span className="text-white font-bold">FIRE</span> at a coordinate on the enemy grid.</p>
        <ul className="list-disc pl-5 space-y-2 text-slate-400 text-sm">
          <li><span className="text-emerald-500 font-bold">HIT:</span> You harvest that letter into your <span className="text-white font-bold">Letter Bank</span>.</li>
          <li><span className="text-slate-500 font-bold">MISS:</span> Mark the cell as empty. Your turn ends.</li>
          <li><span className="text-blue-400 font-bold">UNCOMMON TILES:</span> These occupy 2 cells. Hit both for a <span className="text-white font-bold">Bonus Draw</span> (extra shot!).</li>
        </ul>
      </div>
    )
  },
  {
    title: "3. Word Bombs",
    icon: <Zap className="w-8 h-8 text-yellow-500" />,
    content: (
      <div className="flex flex-col gap-4">
        <p>Instead of firing, you can spend letters from your bank to cast a <span className="text-white font-bold">Word Bomb</span>. The longer the word, the more powerful the effect!</p>
        <div className="grid grid-cols-1 gap-2 text-xs font-mono">
          <div className="flex justify-between p-2 bg-slate-800 rounded border-l-4 border-yellow-500">
            <span>3: SPARK</span> <span className="text-slate-500">Scan row/col for tiles</span>
          </div>
          <div className="flex justify-between p-2 bg-slate-800 rounded border-l-4 border-orange-500">
            <span>4: BLAST</span> <span className="text-slate-500">Precision hit on 1 cell</span>
          </div>
          <div className="flex justify-between p-2 bg-slate-800 rounded border-l-4 border-teal-500">
            <span>5: SURGE</span> <span className="text-slate-500">Reveal all tiles in row/col</span>
          </div>
          <div className="flex justify-between p-2 bg-slate-800 rounded border-l-4 border-purple-500">
            <span>6: STORM</span> <span className="text-slate-500">Hit a 2x2 area</span>
          </div>
          <div className="flex justify-between p-2 bg-slate-800 rounded border-l-4 border-magenta-500">
            <span>7: TEMPEST</span> <span className="text-slate-500">Steal random enemy letter</span>
          </div>
          <div className="flex justify-between p-2 bg-slate-800 rounded border-l-4 border-blue-500">
            <span>8+: OBLITERATE</span> <span className="text-slate-500">Destroy full row/col</span>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "4. Special Tiles",
    icon: <Shield className="w-8 h-8 text-emerald-500" />,
    content: (
      <div className="flex flex-col gap-4">
        <p>Protect your grid with special defensive tiles:</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-800 rounded-xl flex flex-col gap-1">
            <div className="flex items-center gap-2 text-blue-400">
              <Shield className="w-4 h-4" /> <span className="text-xs font-bold">VAULT</span>
            </div>
            <p className="text-[10px] text-slate-400">Requires 2 hits to harvest. Armored.</p>
          </div>
          <div className="p-3 bg-slate-800 rounded-xl flex flex-col gap-1">
            <div className="flex items-center gap-2 text-green-400">
              <Skull className="w-4 h-4" /> <span className="text-xs font-bold">POISON</span>
            </div>
            <p className="text-[10px] text-slate-400">Attacker discards a random letter.</p>
          </div>
          <div className="p-3 bg-slate-800 rounded-xl flex flex-col gap-1">
            <div className="flex items-center gap-2 text-purple-400">
              <Copy className="w-4 h-4" /> <span className="text-xs font-bold">MIRROR</span>
            </div>
            <p className="text-[10px] text-slate-400">Attacker gets a copy; tile stays.</p>
          </div>
          <div className="p-3 bg-slate-800 rounded-xl flex flex-col gap-1">
            <div className="flex items-center gap-2 text-yellow-400">
              <Zap className="w-4 h-4" /> <span className="text-xs font-bold">CHARGED</span>
            </div>
            <p className="text-[10px] text-slate-400">Bonus shot if last in row/col.</p>
          </div>
        </div>
      </div>
    )
  }
];

export const TutorialScreen: React.FC<TutorialScreenProps> = ({ onBack }) => {
  const [currentStage, setCurrentStage] = useState(0);

  const next = () => setCurrentStage(prev => Math.min(prev + 1, STAGES.length - 1));
  const prev = () => setCurrentStage(prev => Math.max(prev - 1, 0));

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-12 relative overflow-hidden grid-blueprint">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900/90 border-8 border-slate-800 rounded-[5rem] shadow-[0_60px_120px_rgba(0,0,0,0.8)] w-full max-w-3xl overflow-hidden z-10 backdrop-blur-md relative"
      >
        {/* Inner Bezel */}
        <div className="absolute inset-2 rounded-[4.5rem] border-4 border-white/5 bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-10" />
        <div className="absolute inset-0 grid-blueprint opacity-10 pointer-events-none" />
        
        <div className="p-16 flex flex-col gap-12 relative z-20">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <div className="p-6 bg-slate-950 rounded-3xl border-4 border-slate-800 shadow-2xl relative group">
                <div className="absolute inset-0 bg-yellow-500/5 blur-xl rounded-full group-hover:bg-yellow-500/10 transition-all" />
                <BookOpen className="w-10 h-10 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)] relative z-10" />
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-6xl font-serif font-black text-white tracking-tighter uppercase drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">Tactical Codex</h2>
                <div className="flex items-center gap-4">
                  <div className="h-1 w-12 bg-slate-800 rounded-full" />
                  <span className="text-[11px] font-mono font-black text-slate-500 uppercase tracking-[0.5em]">
                    Module {currentStage + 1} // {STAGES.length}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onBack}
              className="p-5 text-slate-600 hover:text-white hover:bg-slate-800 rounded-3xl border-4 border-transparent hover:border-slate-700 transition-all shadow-xl group"
            >
              <Home className="w-10 h-10 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          <div className="min-h-[450px] flex flex-col gap-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStage}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                className="flex flex-col gap-10"
              >
                <div className="flex items-center gap-8">
                  <div className="p-5 bg-slate-950 rounded-2xl border-4 border-slate-800 shadow-2xl">
                    {STAGES[currentStage].icon}
                  </div>
                  <h3 className="text-4xl font-serif font-black text-white tracking-tight uppercase border-b-4 border-yellow-500/30 pb-2 drop-shadow-md">
                    {STAGES[currentStage].title}
                  </h3>
                </div>
                <div className="text-slate-400 font-mono text-[13px] leading-relaxed uppercase tracking-[0.15em] bg-slate-950/40 p-10 rounded-[3rem] border-4 border-slate-800/40 shadow-inner">
                  {STAGES[currentStage].content}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-between items-center pt-12 border-t-4 border-slate-800/50">
            <button
              onClick={prev}
              disabled={currentStage === 0}
              className={`flex items-center gap-4 px-10 py-5 rounded-[2rem] font-mono font-black text-[11px] tracking-[0.3em] transition-all border-4 ${
                currentStage === 0 
                  ? 'opacity-0 pointer-events-none' 
                  : 'bg-slate-950 text-slate-500 border-slate-800 hover:bg-slate-900 hover:text-white hover:border-slate-700 shadow-xl active:scale-95'
              }`}
            >
              <ChevronLeft className="w-6 h-6" /> PREV
            </button>

            <div className="flex gap-4">
              {STAGES.map((_, i) => (
                <div
                  key={i}
                  className={`h-2.5 rounded-full transition-all duration-500 border-2 ${
                    i === currentStage 
                      ? 'bg-yellow-500 w-12 border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.6)]' 
                      : 'bg-slate-800 w-4 border-slate-700'
                  }`}
                />
              ))}
            </div>

            {currentStage === STAGES.length - 1 ? (
              <button
                onClick={onBack}
                className="relative group flex items-center gap-4 px-12 py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[2rem] font-mono font-black text-[11px] tracking-[0.3em] transition-all shadow-[0_20px_40px_rgba(16,185,129,0.3)] border-4 border-emerald-400 overflow-hidden active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50" />
                DEPLOY NOW
              </button>
            ) : (
              <button
                onClick={next}
                className="relative group flex items-center gap-4 px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-mono font-black text-[11px] tracking-[0.3em] transition-all shadow-[0_20px_40px_rgba(59,130,246,0.3)] border-4 border-blue-400 overflow-hidden active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50" />
                NEXT <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
