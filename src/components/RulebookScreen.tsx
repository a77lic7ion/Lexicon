import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Home, ChevronLeft, ChevronRight } from 'lucide-react';

interface RulebookScreenProps {
  onBack: () => void;
}

const IMAGES: Record<string, string> = {
  grid: "https://picsum.photos/seed/lexicon-grid/1200/600",
  turn: "https://picsum.photos/seed/lexicon-turn/1200/600",
  tiles: "https://picsum.photos/seed/lexicon-tiles/1200/600",
  special: "https://picsum.photos/seed/lexicon-special/1200/600",
  strategy: "https://picsum.photos/seed/lexicon-strategy/1200/600",
  flywheel: "https://picsum.photos/seed/lexicon-flywheel/1200/600",
  winconditions: "https://picsum.photos/seed/lexicon-win/1200/600",
};

export const RulebookScreen: React.FC<RulebookScreenProps> = ({ onBack }) => {
  const [activeRule, setActiveRule] = useState<number | null>(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleRule = (index: number) => {
    setActiveRule(activeRule === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#E8DFC8] font-serif selection:bg-yellow-500/30 overflow-x-hidden relative">
      {/* Noise Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
      />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-[#0a0e14]/90 backdrop-blur-md border-b border-yellow-500/20 h-14 flex items-center justify-between px-8">
        <div className="text-xl font-black text-yellow-500 tracking-widest uppercase">LEXICON</div>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-500 hover:text-yellow-500 transition-colors tracking-[0.2em]"
        >
          <Home className="w-4 h-4" /> RETURN TO MENU
        </button>
      </nav>

      {/* Cover */}
      <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[radial-gradient(ellipse_at_50%_40%,#1a2535_0%,#0D1117_60%)]">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[linear-gradient(0deg,transparent_69px,#f5a623_69px,#f5a623_70px),linear-gradient(90deg,transparent_69px,#f5a623_69px,#f5a623_70px)] bg-[size:70px_70px]" />
        
        <motion.span 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.7, y: 0 }}
          className="text-[0.7rem] font-mono tracking-[0.4em] text-[#C8922A] uppercase mb-8"
        >
          Official Tactical Rulebook · v1.0
        </motion.span>
        
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-[12vw] font-black leading-[0.9] text-[#FFD700] tracking-tighter drop-shadow-[0_0_80px_rgba(255,215,0,0.3)]"
        >
          LEXICON
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 0.5 }}
          className="text-2xl italic text-[#F5EDD6] mt-4 tracking-widest"
        >
          A Word-Harvesting Battle Game
        </motion.p>
        
        <div className="w-44 h-px bg-gradient-to-r from-transparent via-[#F5A623] to-transparent my-10" />
        
        <p className="text-sm font-mono tracking-[0.25em] text-[#C8922A] text-center max-w-lg leading-loose">
          Your vocabulary is your weapon.<br />Every hit is a resource. The smartest word wins.
        </p>

        <div className="flex gap-4 mt-12 flex-wrap justify-center">
          {['2 Players', '10×10 Grid', '15–40 min', 'Age 10+', '3 Game Modes'].map(badge => (
            <span key={badge} className="text-[0.65rem] font-mono tracking-widest px-4 py-1.5 border border-yellow-500/20 text-slate-500 uppercase">
              {badge}
            </span>
          ))}
        </div>
      </section>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-8 py-24 flex flex-col gap-32">
        
        {/* 01 - Concept */}
        <section id="concept" className="flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <span className="text-[0.65rem] font-mono tracking-[0.35em] text-[#C8922A] uppercase">01 — What is Lexicon</span>
            <h2 className="text-5xl font-bold text-[#F5EDD6] leading-tight">Two ancient games.<br /><span className="text-[#F5A623] italic font-normal">One ruthless hybrid.</span></h2>
            <div className="w-16 h-0.5 bg-[#F5A623]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <div className="text-xl leading-relaxed text-[#B8A88A] flex flex-col gap-6">
              <p>Lexicon takes the <strong className="text-[#F5EDD6]">deductive tension of Battleships</strong> — the blind targeting, the hidden grids, the slow accumulation of intelligence — and fuses it with the <strong className="text-[#F5EDD6]">vocabulary depth of Scrabble</strong>.</p>
              <p>But there is a critical twist. In Lexicon, <em className="text-[#F5A623]">hitting an enemy tile is not the end of the action</em>. It is the beginning. Every hit harvests a letter into your bank. Letters are spent to cast <strong className="text-[#F5EDD6]">Word Bombs</strong> — devastating area attacks whose power scales entirely with the quality of your vocabulary.</p>
            </div>
            <div className="grid grid-cols-2 gap-px bg-yellow-500/20 border border-yellow-500/20">
              {[
                { n: "10×10", l: "Battle Grid" },
                { n: "15", l: "Tiles Per Player" },
                { n: "26", l: "Letter Tiles + Wildcard" },
                { n: "6", l: "Word Bomb Tiers" },
                { n: "3", l: "Bluff Layers" },
                { n: "3", l: "Win Conditions" },
              ].map(stat => (
                <div key={stat.l} className="bg-[#0a0e14] p-8 text-center">
                  <div className="text-4xl font-bold text-[#F5A623]">{stat.n}</div>
                  <div className="text-[0.6rem] font-mono tracking-widest text-slate-500 uppercase mt-2">{stat.l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 02 - Rules */}
        <section id="rules" className="flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <span className="text-[0.65rem] font-mono tracking-[0.35em] text-[#C8922A] uppercase">02 — Core Rules</span>
            <h2 className="text-5xl font-bold text-[#F5EDD6] leading-tight">How the game<br /><span className="text-[#F5A623] italic font-normal">is played.</span></h2>
            <div className="w-16 h-0.5 bg-[#F5A623]" />
          </div>

          <div className="w-full overflow-hidden rounded-lg border border-yellow-500/20 mb-8">
            <img src={IMAGES.grid} alt="Grid Mapping" className="w-full opacity-90 hover:opacity-100 transition-opacity" />
          </div>

          <div className="flex flex-col border border-yellow-500/20 bg-yellow-500/10 divide-y divide-yellow-500/20">
            {[
              { 
                id: "I", t: "The Grid — Standard 10×10 Mapping", 
                c: ["Both players use a private 10×10 grid — Columns A–J, Rows 1–10", "Your own grid is always fully visible to you. The enemy grid shows only hit/miss markers", "Coordinates are called as column first, row second — e.g., D7 means Column D, Row 7"] 
              },
              { 
                id: "II", t: "Phase 1 — Grid Composition (Hide)", 
                c: ["Before the game begins, each player secretly places exactly 15 letter tiles on their grid", "Tiles may be placed horizontally or vertically only — no diagonal placement", "A 1-cell buffer is required on all sides of every tile — no tiles may touch", "Players must include at least 3 vowels and no more than 2 Rare tiles"] 
              },
              { 
                id: "III", t: "Phase 2 — Battle (Turn Structure)", 
                c: ["Each turn, the active player chooses exactly one action: FIRE or BOMB", "FIRE: Call any coordinate not previously targeted. Miss -> mark empty. Hit -> collect letter", "BOMB: Declare a valid word using letters in your bank. Spend letters to trigger effects"] 
              },
              { 
                id: "IV", t: "Harvesting Letters", 
                c: ["When you hit an enemy tile, that letter goes into your Letter Bank — visible only to you", "Uncommon (1×2) tiles require two separate hits. The letter is collected on the first hit", "Hitting the second cell of an Uncommon tile triggers a Bonus Draw (extra shot)"] 
              }
            ].map((rule, idx) => (
              <div key={rule.id} className="bg-[#090d13]">
                <button 
                  onClick={() => toggleRule(idx)}
                  className="w-full flex items-center gap-6 p-6 text-left hover:bg-[#0d1420] transition-colors"
                >
                  <span className="text-2xl font-bold text-[#C8922A] w-8">{rule.id}</span>
                  <span className="flex-1 text-lg text-[#F5EDD6]">{rule.t}</span>
                  <span className={`text-xl text-[#C8922A] transition-transform ${activeRule === idx ? 'rotate-45' : ''}`}>+</span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${activeRule === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-8 pl-20 border-t border-yellow-500/20 text-[#9A8A72] text-lg leading-relaxed">
                    <ul className="flex flex-col gap-3">
                      {rule.c.map(line => <li key={line} className="before:content-['—'] before:mr-4 before:text-[#C8922A]">{line}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 03 - Tiles */}
        <section id="tiles" className="flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <span className="text-[0.65rem] font-mono tracking-[0.35em] text-[#C8922A] uppercase">03 — The Tile Set</span>
            <h2 className="text-5xl font-bold text-[#F5EDD6] leading-tight">Your letters.<br /><span className="text-[#F5A623] italic font-normal">Your arsenal.</span></h2>
            <div className="w-16 h-0.5 bg-[#F5A623]" />
          </div>

          <div className="w-full overflow-hidden rounded-lg border border-yellow-500/20">
            <img src={IMAGES.tiles} alt="Tile Set" className="w-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 border border-yellow-500/20 bg-yellow-500/20 divide-x divide-yellow-500/20">
            <div className="bg-[#090d13] p-8 border-t-4 border-[#F5A623]">
              <div className="text-[0.7rem] font-bold tracking-widest text-[#F5A623] mb-4 uppercase">COMMON · 1PT</div>
              <div className="text-2xl font-bold text-[#F5EDD6] mb-2">The Backbone</div>
              <div className="text-xs font-mono tracking-widest opacity-60 mb-6 uppercase">E · A · I · O · R · T · N · S</div>
              <p className="text-sm leading-relaxed text-[#8A7A62]">Standard 1×1 tiles. Low point value but critical for word-building. <strong className="text-[#F5EDD6]">Minimum 3 vowels</strong> required in every grid.</p>
            </div>
            <div className="bg-[#090d13] p-8 border-t-4 border-[#00D4FF]">
              <div className="text-[0.7rem] font-bold tracking-widest text-[#00D4FF] mb-4 uppercase">UNCOMMON · 1–4PT</div>
              <div className="text-2xl font-bold text-[#F5EDD6] mb-2">The Double-Cell</div>
              <div className="text-xs font-mono tracking-widest opacity-60 mb-6 uppercase">B · C · D · F · G · H · L · M · P</div>
              <p className="text-sm leading-relaxed text-[#8A7A62]">Occupies <strong className="text-[#F5EDD6]">2 cells</strong>. Hitting both cells triggers a <strong className="text-[#F5EDD6]">Bonus Draw</strong> — an immediate free extra shot.</p>
            </div>
            <div className="bg-[#090d13] p-8 border-t-4 border-[#E94560]">
              <div className="text-[0.7rem] font-bold tracking-widest text-[#E94560] mb-4 uppercase">RARE · 4–10PT (×2)</div>
              <div className="text-2xl font-bold text-[#F5EDD6] mb-2">High Risk, High Reward</div>
              <div className="text-xs font-mono tracking-widest opacity-60 mb-6 uppercase">J · K · Q · V · W · X · Y · Z</div>
              <p className="text-sm leading-relaxed text-[#8A7A62]">Standard 1×1. Max 2 per grid. Every Rare letter <strong className="text-[#F5EDD6]">counts double</strong> in word scoring. Hunt them greedily.</p>
            </div>
          </div>
        </section>

        {/* 04 - Arsenal */}
        <section id="arsenal" className="flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <span className="text-[0.65rem] font-mono tracking-[0.35em] text-[#C8922A] uppercase">04 — The Arsenal Staircase</span>
            <h2 className="text-5xl font-bold text-[#F5EDD6] leading-tight">Six tiers.<br /><span className="text-[#F5A623] italic font-normal">Six weapons.</span></h2>
            <div className="w-16 h-0.5 bg-[#F5A623]" />
          </div>

          <p className="text-xl text-[#9A8A72] max-w-2xl leading-relaxed">
            Word Bombs are cast by spending letters from your bank. Power scales directly with word length. Each tier fires a different effect — escalating from reconnaissance to total annihilation.
          </p>

          <div className="overflow-x-auto border border-yellow-500/20 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#060a0f] border-b border-yellow-500/20 text-[0.65rem] font-mono tracking-widest text-slate-500 uppercase">
                  <th className="p-4">Tier</th>
                  <th className="p-4">Bomb Name</th>
                  <th className="p-4">Length</th>
                  <th className="p-4">Effect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-yellow-500/10">
                {[
                  { id: "I", n: "SPARK", l: "3 letters", e: "Reveal if any tile exists in a chosen row or column (Yes/No). Exact positions remain hidden.", c: "text-[#F5A623]" },
                  { id: "II", n: "BLAST", l: "4 letters", e: "Precision Strike. Hits any 1 specific cell of your choice — no guessing required.", c: "text-[#E94560]" },
                  { id: "III", n: "SURGE", l: "5 letters", e: "Full Scan. Reveals all tile positions and empty cells in one full row or column.", c: "text-[#00D4FF]" },
                  { id: "IV", n: "STORM", l: "6 letters", e: "Carpet Bomb. Simultaneously detonates all 4 cells in any 2×2 area you choose.", c: "text-[#9B40E0]" },
                  { id: "V", n: "TEMPEST", l: "7 letters", e: "Intercept. Bypasses the board entirely. Steals one random letter from enemy bank.", c: "text-[#E040FB]" },
                  { id: "VI", n: "OBLITERATE", l: "8+ letters", e: "Absolute Zero. Simultaneously destroys and harvests every tile in an entire row OR column.", c: "text-[#00AAFF]" },
                ].map(bomb => (
                  <tr key={bomb.id} className="bg-[#090d13] hover:bg-white/5 transition-colors">
                    <td className={`p-6 font-mono font-bold ${bomb.c}`}>{bomb.id}</td>
                    <td className={`p-6 font-bold text-lg ${bomb.c}`}>{bomb.n}</td>
                    <td className="p-6 font-mono text-sm">{bomb.l}</td>
                    <td className="p-6 text-[#9A8A72] text-sm leading-relaxed">{bomb.e}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 05 - Strategy */}
        <section id="strategy" className="flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <span className="text-[0.65rem] font-mono tracking-[0.35em] text-[#C8922A] uppercase">05 — Strategic Depth</span>
            <h2 className="text-5xl font-bold text-[#F5EDD6] leading-tight">Three layers<br /><span className="text-[#F5A623] italic font-normal">of deception.</span></h2>
            <div className="w-16 h-0.5 bg-[#F5A623]" />
          </div>

          <p className="text-xl text-[#9A8A72] max-w-2xl leading-relaxed">
            Lexicon is a game of incomplete information. Mastery lies in controlling what your opponent thinks they know at each of the three bluff layers.
          </p>

          <div className="flex flex-col border border-yellow-500/20 bg-yellow-500/20 divide-y divide-yellow-500/20">
            {[
              { 
                n: "01", t: "Layer 1 — Grid Composition Bluff", 
                b: "Placing common vowels visibly in the first two rows invites early hits — the enemy harvests weak letters. Hiding your Rare tiles in corner clusters denies them high-value harvests.",
                e: "SURFACE LEVEL: They see where you hit and miss. Placing vowels visibly baits them into feeding you weak letters."
              },
              { 
                n: "02", t: "Layer 2 — Bank Management Bluff", 
                b: "Your opponent can deduce exactly how many letters you've collected, but they can never know which letters. Firing a weak 3-letter Spark signals you're not ready for a big word.",
                e: "SUB-SURFACE: They know *how many* letters you have, but not *which* ones. Firing weak Sparks feigns a poor hand."
              },
              { 
                n: "03", t: "Layer 3 — Word Timing Bluff", 
                b: "The most advanced layer. You know exactly which word you're building. Holding a 7-letter Tempest while acting like you only have a 3-letter Spark lets you wait until their bank is full.",
                e: "THE CORE: Holding a Tempest while acting like you only have a Spark — strike when their bank is fullest."
              }
            ].map(layer => (
              <div key={layer.n} className="bg-[#090d13] p-10 grid grid-cols-1 md:grid-cols-[80px_1fr] gap-8 hover:bg-[#0d1420] transition-colors relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-[#F5A623]">
                <div className="text-6xl font-black text-white/5 leading-none">{layer.n}</div>
                <div className="flex flex-col gap-4">
                  <h4 className="text-xl font-bold text-[#F5EDD6]">{layer.t}</h4>
                  <p className="text-[#8A7A62] leading-relaxed">{layer.b}</p>
                  <div className="mt-4 p-4 bg-yellow-500/5 border-l-2 border-[#C8922A] font-mono text-xs text-[#C8922A] tracking-wider leading-relaxed">
                    {layer.e}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 06 - Victory */}
        <section id="victory" className="flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <span className="text-[0.65rem] font-mono tracking-[0.35em] text-[#C8922A] uppercase">06 — Victory</span>
            <h2 className="text-5xl font-bold text-[#F5EDD6] leading-tight">Three roads<br /><span className="text-[#F5A623] italic font-normal">to winning.</span></h2>
            <div className="w-16 h-0.5 bg-[#F5A623]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 border border-yellow-500/20 bg-yellow-500/20 divide-x divide-yellow-500/20">
            {[
              { m: "Mode A", n: "Classic", c: "Destroy all 15 enemy letter tiles first. Standard elimination — every tile matters. The game is won through thorough grid hunting and methodical deduction.", s: "PLAYSTYLE: Pure Battleships logic. Favors board dominance and systematic hunting.", w: "A" },
              { m: "Mode B", n: "Lexicon", c: "Be the first player to successfully fire an 8-letter Obliterate bomb. The grid is secondary — your bank is everything. Build toward a single cataclysmic vocabulary shot.", s: "PLAYSTYLE: Vocabulary race. Favors hoarding letters and strategic firing.", w: "B" },
              { m: "Mode C", n: "Hybrid", c: "Win by either destroying 10 enemy tiles OR firing a 7+ letter bomb — whichever comes first. Two separate clocks running simultaneously.", s: "PLAYSTYLE: Dynamic and unpredictable. Watch both tracks simultaneously.", w: "C" },
            ].map(win => (
              <div key={win.n} className="bg-[#090d13] p-10 relative overflow-hidden group">
                <div className="text-[0.65rem] font-mono tracking-[0.3em] text-[#C8922A] mb-4 uppercase">{win.m}</div>
                <div className="text-3xl font-bold text-[#F5EDD6] mb-6">{win.n}</div>
                <p className="text-[#8A7A62] text-sm leading-relaxed pb-6 border-b border-yellow-500/20 mb-6">{win.c}</p>
                <div className="text-[0.7rem] font-mono text-slate-500 tracking-widest leading-relaxed uppercase">{win.s}</div>
                <div className="absolute -bottom-4 -right-2 text-8xl font-black text-yellow-500/5 group-hover:text-yellow-500/10 transition-colors pointer-events-none">{win.w}</div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer className="bg-[#060a0f] border-t border-yellow-500/20 py-16 text-center flex flex-col items-center gap-4">
        <div className="text-4xl font-black text-yellow-500/10 tracking-[0.3em]">LEXICON</div>
        <div className="text-[0.7rem] font-mono tracking-[0.3em] text-[#C8922A] uppercase">Your vocabulary is your weapon</div>
        <p className="text-sm italic text-slate-600">Official Tactical Rulebook · Version 1.0 · All rules subject to game mode selection</p>
      </footer>
    </div>
  );
};
