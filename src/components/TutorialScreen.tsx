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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-slate-800 rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden z-10"
      >
        <div className="p-10 flex flex-col gap-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700">
                <BookOpen className="w-6 h-6 text-slate-400" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-2xl font-serif font-bold text-white">HOW TO PLAY</h2>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                  Stage {currentStage + 1} of {STAGES.length}
                </span>
              </div>
            </div>
            <button
              onClick={onBack}
              className="p-3 hover:bg-slate-800 rounded-full transition-colors"
            >
              <Home className="w-6 h-6 text-slate-500" />
            </button>
          </div>

          <div className="min-h-[300px] flex flex-col gap-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-6"
              >
                <div className="flex items-center gap-4">
                  {STAGES[currentStage].icon}
                  <h3 className="text-xl font-serif font-bold text-white">
                    {STAGES[currentStage].title}
                  </h3>
                </div>
                <div className="text-slate-300 font-sans leading-relaxed">
                  {STAGES[currentStage].content}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-between items-center pt-8 border-t border-slate-800">
            <button
              onClick={prev}
              disabled={currentStage === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-mono font-bold text-sm transition-all ${currentStage === 0 ? 'opacity-0 pointer-events-none' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              <ChevronLeft className="w-4 h-4" /> PREVIOUS
            </button>

            <div className="flex gap-2">
              {STAGES.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${i === currentStage ? 'bg-blue-500 w-6' : 'bg-slate-800'}`}
                />
              ))}
            </div>

            {currentStage === STAGES.length - 1 ? (
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl font-mono font-bold text-sm transition-all shadow-lg shadow-emerald-500/20"
              >
                GOT IT!
              </button>
            ) : (
              <button
                onClick={next}
                className="flex items-center gap-2 px-8 py-3 bg-blue-500 hover:bg-blue-400 text-white rounded-2xl font-mono font-bold text-sm transition-all shadow-lg shadow-blue-500/20"
              >
                NEXT <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
