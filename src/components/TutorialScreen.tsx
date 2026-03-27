import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Sword, Zap, Shield, Skull, Copy, Target, ChevronRight, ChevronLeft, Home } from 'lucide-react';

interface TutorialScreenProps {
  onBack: () => void;
}

const STAGES = [
  {
    title: "1. Strategic Deployment",
    icon: <Target className="w-8 h-8 text-blue-500" />,
    content: (
      <div className="flex flex-col gap-6">
        <p className="text-lg text-white font-serif italic">"A battle won in the mind is a battle won on the field."</p>
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-start gap-4 bg-slate-900/60 p-4 rounded-2xl border-2 border-slate-800">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 font-bold">01</div>
            <div>
              <h4 className="text-white font-bold text-sm mb-1">GRID PROTOCOL</h4>
              <p className="text-xs text-slate-400">Deploy 15 tiles on your 10x10 grid. Orientation can be horizontal or vertical.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-slate-900/60 p-4 rounded-2xl border-2 border-slate-800">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 font-bold">02</div>
            <div>
              <h4 className="text-white font-bold text-sm mb-1">BUFFER ZONE</h4>
              <p className="text-xs text-slate-400">Maintain a 1-cell empty buffer around every tile. No diagonal or adjacent touching allowed.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-slate-900/60 p-4 rounded-2xl border-2 border-slate-800">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 font-bold">03</div>
            <div>
              <h4 className="text-white font-bold text-sm mb-1">COMPOSITION</h4>
              <p className="text-xs text-slate-400">Min 5 Vowels (Common). Max 2 Rare. Max 1 Wildcard. Max 1 of each Special Asset.</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "2. The Arsenal",
    icon: <Zap className="w-8 h-8 text-yellow-500" />,
    content: (
      <div className="flex flex-col gap-6">
        <p className="text-slate-400">Your tiles are your lifeblood. Each tier serves a specific tactical purpose.</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-900/60 rounded-2xl border-2 border-slate-800">
            <span className="text-[10px] font-black text-slate-500 block mb-2 tracking-widest uppercase">Common</span>
            <div className="text-2xl font-serif font-black text-white mb-1">A, E, I, O, U...</div>
            <p className="text-[10px] text-slate-500 uppercase">1x1 Size // 1-3 Points</p>
          </div>
          <div className="p-4 bg-slate-900/60 rounded-2xl border-2 border-slate-800">
            <span className="text-[10px] font-black text-blue-500 block mb-2 tracking-widest uppercase">Uncommon</span>
            <div className="text-2xl font-serif font-black text-white mb-1">J, K, Q, X...</div>
            <p className="text-[10px] text-slate-500 uppercase">1x2 Size // 4-8 Points</p>
          </div>
          <div className="p-4 bg-slate-900/60 rounded-2xl border-2 border-slate-800">
            <span className="text-[10px] font-black text-purple-500 block mb-2 tracking-widest uppercase">Rare</span>
            <div className="text-2xl font-serif font-black text-white mb-1">Z, W, V...</div>
            <p className="text-[10px] text-slate-500 uppercase">1x1 Size // 10 Points</p>
          </div>
          <div className="p-4 bg-slate-900/60 rounded-2xl border-2 border-slate-800">
            <span className="text-[10px] font-black text-yellow-500 block mb-2 tracking-widest uppercase">Wildcard</span>
            <div className="text-2xl font-serif font-black text-white mb-1">?</div>
            <p className="text-[10px] text-slate-500 uppercase">1x1 Size // 0 Points</p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "3. The Harvest",
    icon: <Sword className="w-8 h-8 text-red-500" />,
    content: (
      <div className="flex flex-col gap-6">
        <p className="text-slate-400">Locate and extract enemy letters to build your bank.</p>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-6 p-4 bg-red-500/5 rounded-2xl border-2 border-red-500/20">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center text-red-500 font-black">HIT</div>
            <p className="text-xs text-slate-300">A successful strike harvests the letter into your bank. You keep firing until you miss.</p>
          </div>
          <div className="flex items-center gap-6 p-4 bg-slate-800/40 rounded-2xl border-2 border-slate-700/40">
            <div className="w-12 h-12 bg-slate-700/20 rounded-full flex items-center justify-center text-slate-500 font-black">MISS</div>
            <p className="text-xs text-slate-400">Missing an empty cell ends your turn. Control passes to the opponent.</p>
          </div>
          <div className="flex items-center gap-6 p-4 bg-blue-500/5 rounded-2xl border-2 border-blue-500/20">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-500 font-black">BONUS</div>
            <p className="text-xs text-slate-300">Destroying both halves of an <span className="text-blue-400 font-bold">Uncommon</span> tile yields a Bonus Shot.</p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "4. Word Bombs",
    icon: <Zap className="w-8 h-8 text-yellow-500" />,
    content: (
      <div className="flex flex-col gap-6">
        <p className="text-slate-400">Convert harvested letters into devastating tactical strikes. Longer words unlock higher tiers.</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { len: 3, name: "SPARK", desc: "Scan row/col for tile presence", color: "bg-yellow-500" },
            { len: 4, name: "BLAST", desc: "Precision strike on a single cell", color: "bg-orange-500" },
            { len: 5, name: "SURGE", desc: "Reveal all tiles in a row/col", color: "bg-teal-500" },
            { len: 6, name: "STORM", desc: "Heavy damage in a 2x2 area", color: "bg-purple-500" },
            { len: 7, name: "TEMPEST", desc: "Extract a random letter from enemy bank", color: "bg-pink-500" },
            { len: "8+", name: "OBLITERATE", desc: "Total destruction of a row or column", color: "bg-blue-500" },
          ].map((bomb, i) => (
            <div key={i} className="flex items-center gap-4 p-3 bg-slate-900/60 rounded-xl border border-slate-800 group hover:border-slate-700 transition-colors">
              <div className={`w-10 h-10 ${bomb.color} rounded-lg flex items-center justify-center text-black font-black text-xs shadow-lg`}>{bomb.len}</div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-[10px] tracking-widest">{bomb.name}</span>
                <span className="text-[10px] text-slate-500">{bomb.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    title: "5. Defensive Assets",
    icon: <Shield className="w-8 h-8 text-emerald-500" />,
    content: (
      <div className="flex flex-col gap-6">
        <p className="text-slate-400">Deploy these to disrupt enemy harvesting and protect your lexicon.</p>
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center gap-4 p-4 bg-slate-900/60 rounded-2xl border-2 border-slate-800">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400"><Shield className="w-6 h-6" /></div>
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest">Vault</h4>
              <p className="text-[10px] text-slate-500">Reinforced armor. Requires 2 hits to harvest the letter.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-slate-900/60 rounded-2xl border-2 border-slate-800">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-green-400"><Skull className="w-6 h-6" /></div>
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest">Poison</h4>
              <p className="text-[10px] text-slate-500">Toxic payload. Attacker discards a random letter from their bank.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-slate-900/60 rounded-2xl border-2 border-slate-800">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400"><Copy className="w-6 h-6" /></div>
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest">Mirror</h4>
              <p className="text-[10px] text-slate-500">Optical decoy. Yields a letter copy but remains unbroken once.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-slate-900/60 rounded-2xl border-2 border-slate-800">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center text-yellow-400"><Zap className="w-6 h-6" /></div>
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest">Charged</h4>
              <p className="text-[10px] text-slate-500">Kinetic energy. Grants a bonus shot if it's the last tile in its row/col.</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "6. Victory Protocol",
    icon: <Target className="w-8 h-8 text-emerald-500" />,
    content: (
      <div className="flex flex-col gap-8 items-center justify-center py-10">
        <div className="text-center space-y-4">
          <h4 className="text-white font-serif text-3xl italic">"The last word is the only one that matters."</h4>
          <p className="text-slate-400 max-w-xs mx-auto">Victory is achieved through total domination or linguistic superiority.</p>
        </div>
        <div className="grid grid-cols-2 gap-8 w-full">
          <div className="flex flex-col items-center gap-4 p-6 bg-emerald-500/5 rounded-[3rem] border-4 border-emerald-500/20">
            <div className="text-4xl font-black text-emerald-500">15</div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center">Tiles Destroyed</p>
          </div>
          <div className="flex flex-col items-center gap-4 p-6 bg-blue-500/5 rounded-[3rem] border-4 border-blue-500/20">
            <div className="text-4xl font-black text-blue-500">100</div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center">Lexicon Points</p>
          </div>
        </div>
        <p className="text-[10px] text-slate-600 font-mono uppercase tracking-[0.2em]">Hybrid Mode: First to reach either milestone wins.</p>
      </div>
    )
  }
];

export const TutorialScreen: React.FC<TutorialScreenProps> = ({ onBack }) => {
  const [currentStage, setCurrentStage] = useState(0);

  const next = () => setCurrentStage(prev => Math.min(prev + 1, STAGES.length - 1));
  const prev = () => setCurrentStage(prev => Math.max(prev - 1, 0));

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-start p-6 sm:p-12 relative overflow-y-auto custom-scrollbar grid-blueprint">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900/90 border-4 sm:border-8 border-slate-800 rounded-[2rem] sm:rounded-[5rem] shadow-[0_60px_120px_rgba(0,0,0,0.8)] w-full max-w-6xl z-10 backdrop-blur-md relative my-4"
      >
        {/* Inner Bezel */}
        <div className="absolute inset-2 rounded-[1.5rem] sm:rounded-[4.5rem] border-4 border-white/5 bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-10" />
        <div className="absolute inset-0 grid-blueprint opacity-10 pointer-events-none" />
        
        <div className="p-8 sm:p-10 flex flex-col gap-8 relative z-20">
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
              title="Back to Home"
              className="p-5 text-slate-600 hover:text-white hover:bg-slate-800 rounded-3xl border-4 border-transparent hover:border-slate-700 transition-all shadow-xl group"
            >
              <Home className="w-10 h-10 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          <div className="min-h-[300px] flex flex-col gap-6">
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

          <div className="flex justify-between items-center pt-8 border-t-4 border-slate-800/50">
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
