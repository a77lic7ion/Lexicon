import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Sword, Zap, Shield, Skull, Copy, Target, 
  ChevronRight, ChevronLeft, Home, Trophy, Star
} from 'lucide-react';

interface RulebookScreenProps {
  onBack: () => void;
}

const STAGES = [
  {
    title: "01. The Concept",
    icon: <BookOpen className="w-8 h-8 text-blue-500" />,
    content: (
      <div className="flex flex-col gap-4">
        <p className="text-lg">Lexicon is a <span className="text-yellow-500 font-bold">ruthless hybrid</span> of Battleships and Scrabble.</p>
        <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
          <p className="text-slate-300">Every hit on an enemy tile harvests a letter into your bank. Spend these letters to cast devastating <span className="text-yellow-500">Word Bombs</span>. The smarter the word, the bigger the blast.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
            <div className="text-xl font-bold text-yellow-500">10x10</div>
            <div className="text-[10px] text-slate-500 uppercase font-mono">Battle Grid</div>
          </div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
            <div className="text-xl font-bold text-yellow-500">15</div>
            <div className="text-[10px] text-slate-500 uppercase font-mono">Tiles Per Player</div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "02. The Grid & Setup",
    icon: <Target className="w-8 h-8 text-blue-500" />,
    content: (
      <div className="flex flex-col gap-4">
        <p>Before battle, secretly place <span className="text-white font-bold">15 Letter Tiles</span> on your grid.</p>
        <ul className="space-y-2 text-slate-400 text-sm">
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
            <span>Tiles can be placed <span className="text-white">horizontally or vertically</span>.</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
            <span>A <span className="text-white">1-cell buffer</span> is required between all tiles.</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
            <span>Must include at least <span className="text-white">3 vowels</span> (Common tier).</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
            <span>Max <span className="text-white">2 Rare tiles</span> and <span className="text-white">1 Wildcard</span>.</span>
          </li>
        </ul>
      </div>
    )
  },
  {
    title: "03. The Tile Set",
    icon: <Star className="w-8 h-8 text-amber-500" />,
    content: (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3">
          <div className="p-4 bg-slate-800/50 rounded-2xl border-l-4 border-yellow-500">
            <div className="text-xs font-bold text-yellow-500 uppercase mb-1">Common (1pt)</div>
            <p className="text-sm text-slate-300">E, A, I, O, U, R, T, N, S. The backbone of your bank.</p>
          </div>
          <div className="p-4 bg-slate-800/50 rounded-2xl border-l-4 border-blue-400">
            <div className="text-xs font-bold text-blue-400 uppercase mb-1">Uncommon (1-4pt)</div>
            <p className="text-sm text-slate-300">B, C, D, F, G, H, L, M, P. Occupy 2 cells. Hit both for a <span className="text-white">Bonus Draw</span>.</p>
          </div>
          <div className="p-4 bg-slate-800/50 rounded-2xl border-l-4 border-red-500">
            <div className="text-xs font-bold text-red-500 uppercase mb-1">Rare (4-10pt)</div>
            <p className="text-sm text-slate-300">J, K, Q, V, W, X, Y, Z. Worth <span className="text-white font-bold">DOUBLE</span> in word scoring.</p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "04. Word Bombs",
    icon: <Zap className="w-8 h-8 text-yellow-500" />,
    content: (
      <div className="flex flex-col gap-4">
        <p className="text-sm">Spend letters to trigger powerful effects. Power scales with word length:</p>
        <div className="grid grid-cols-1 gap-2 text-[11px] font-mono">
          <div className="flex justify-between p-2 bg-slate-800 rounded border border-slate-700">
            <span className="text-yellow-500 font-bold">3: SPARK</span> <span className="text-slate-400 text-right">Scan row/col for tiles</span>
          </div>
          <div className="flex justify-between p-2 bg-slate-800 rounded border border-slate-700">
            <span className="text-orange-500 font-bold">4: BLAST</span> <span className="text-slate-400 text-right">Precision hit on 1 cell</span>
          </div>
          <div className="flex justify-between p-2 bg-slate-800 rounded border border-slate-700">
            <span className="text-teal-400 font-bold">5: SURGE</span> <span className="text-slate-400 text-right">Full row/col scan</span>
          </div>
          <div className="flex justify-between p-2 bg-slate-800 rounded border border-slate-700">
            <span className="text-purple-400 font-bold">6: STORM</span> <span className="text-slate-400 text-right">2x2 Carpet Bomb</span>
          </div>
          <div className="flex justify-between p-2 bg-slate-800 rounded border border-slate-700">
            <span className="text-pink-500 font-bold">7: TEMPEST</span> <span className="text-slate-400 text-right">Intercept random letter</span>
          </div>
          <div className="flex justify-between p-2 bg-slate-800 rounded border border-slate-700">
            <span className="text-blue-500 font-bold">8+: OBLITERATE</span> <span className="text-slate-400 text-right">Destroy full row/col</span>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "05. Special Tiles",
    icon: <Shield className="w-8 h-8 text-emerald-500" />,
    content: (
      <div className="flex flex-col gap-4 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <Shield className="w-4 h-4" /> <span className="font-bold">VAULT</span>
            </div>
            <p className="text-[10px] text-slate-400">Armored. Requires 2 hits to harvest.</p>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="flex items-center gap-2 text-green-400 mb-1">
              <Skull className="w-4 h-4" /> <span className="font-bold">POISON</span>
            </div>
            <p className="text-[10px] text-slate-400">Attacker loses a random letter.</p>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="flex items-center gap-2 text-purple-400 mb-1">
              <Copy className="w-4 h-4" /> <span className="font-bold">MIRROR</span>
            </div>
            <p className="text-[10px] text-slate-400">Yields copy; original stays.</p>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="flex items-center gap-2 text-yellow-400 mb-1">
              <Zap className="w-4 h-4" /> <span className="font-bold">CHARGED</span>
            </div>
            <p className="text-[10px] text-slate-400">Bonus shot if last in row/col.</p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "06. Victory Modes",
    icon: <Trophy className="w-8 h-8 text-yellow-500" />,
    content: (
      <div className="flex flex-col gap-4">
        <div className="space-y-3">
          <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="text-xs font-bold text-white mb-1">CLASSIC</div>
            <p className="text-[11px] text-slate-400">Destroy all 15 enemy tiles to win.</p>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="text-xs font-bold text-white mb-1">LEXICON</div>
            <p className="text-[11px] text-slate-400">Be the first to fire an 8-letter Obliterate bomb.</p>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="text-xs font-bold text-white mb-1">HYBRID</div>
            <p className="text-[11px] text-slate-400">Destroy 10 tiles OR fire a 7+ letter bomb.</p>
          </div>
        </div>
      </div>
    )
  }
];

export const RulebookScreen: React.FC<RulebookScreenProps> = ({ onBack }) => {
  const [currentStage, setCurrentStage] = useState(0);

  const next = () => setCurrentStage(prev => Math.min(prev + 1, STAGES.length - 1));
  const prev = () => setCurrentStage(prev => Math.max(prev - 1, 0));

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-yellow-500/5 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-slate-800 rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden z-10"
      >
        <div className="p-10 flex flex-col gap-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700">
                <BookOpen className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-2xl font-serif font-bold text-white uppercase tracking-tight">RULEBOOK</h2>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                  Section {currentStage + 1} of {STAGES.length}
                </span>
              </div>
            </div>
            <button
              onClick={onBack}
              className="p-3 hover:bg-slate-800 rounded-full transition-colors group"
            >
              <Home className="w-6 h-6 text-slate-500 group-hover:text-yellow-500 transition-colors" />
            </button>
          </div>

          <div className="min-h-[340px] flex flex-col gap-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-6"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-slate-800 rounded-xl border border-slate-700">
                    {STAGES[currentStage].icon}
                  </div>
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
                  className={`w-2 h-2 rounded-full transition-all ${i === currentStage ? 'bg-yellow-500 w-6' : 'bg-slate-800'}`}
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
                className="flex items-center gap-2 px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-950 rounded-2xl font-mono font-bold text-sm transition-all shadow-lg shadow-yellow-500/20"
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
