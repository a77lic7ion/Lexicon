import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LetterTile, LETTER_POOL, SPECIAL_TILES } from '../constants';
import { Grid } from './Grid';
import { Tile } from './Tile';
import { RotateCw, Check, Trash2, Info, LogOut } from 'lucide-react';

interface PlacementScreenProps {
  player: { id: 1 | 2; name: string; grid: any; tilesPlaced: number };
  onPlace: (row: number, col: number, tile: LetterTile, orientation: 'h' | 'v') => void;
  onFinalize: () => void;
  onUndo: (playerId: 1 | 2) => void;
  onAutoPlace: (playerId: 1 | 2) => void;
  onQuit: () => void;
  error: string | null;
}

export const PlacementScreen: React.FC<PlacementScreenProps> = ({ 
  player, 
  onPlace, 
  onFinalize, 
  onUndo,
  onAutoPlace,
  onQuit,
  error 
}) => {
  const [selectedTile, setSelectedTile] = useState<LetterTile | null>(null);
  const [orientation, setOrientation] = useState<'h' | 'v'>('h');
  const [hoveredCell, setHoveredCell] = useState<{ r: number; c: number } | null>(null);

  // Filter pool to show what's available
  // We'll show unique letters per tier for selection
  const commonTiles = Array.from(new Set(LETTER_POOL.filter(t => t.tier === 'common').map(t => t.letter)))
    .map(letter => LETTER_POOL.find(t => t.letter === letter && t.tier === 'common')!);
  const uncommonTiles = Array.from(new Set(LETTER_POOL.filter(t => t.tier === 'uncommon').map(t => t.letter)))
    .map(letter => LETTER_POOL.find(t => t.letter === letter && t.tier === 'uncommon')!);
  const rareTiles = Array.from(new Set(LETTER_POOL.filter(t => t.tier === 'rare').map(t => t.letter)))
    .map(letter => LETTER_POOL.find(t => t.letter === letter && t.tier === 'rare')!);
  const wildcard = LETTER_POOL.find(t => t.tier === 'wildcard')!;

  const handleCellClick = (r: number, c: number) => {
    if (selectedTile) {
      onPlace(r, c, selectedTile, orientation);
      // We don't auto-deselect because they might want to place another of the same type?
      // Actually, tiles are unique in the pool. Let's deselect for now.
      setSelectedTile(null);
    }
  };

  const getPreviewCells = () => {
    if (!selectedTile || !hoveredCell) return [];
    
    const cells: { r: number; c: number; isValid: boolean }[] = [];
    let allValid = true;

    // Check bounds and basic validity for the whole shape first
    for (let i = 0; i < selectedTile.size; i++) {
      const r = orientation === 'v' ? hoveredCell.r + i : hoveredCell.r;
      const c = orientation === 'h' ? hoveredCell.c + i : hoveredCell.c;
      
      const outOfBounds = r >= 10 || c >= 10;
      const overlap = !outOfBounds && player.grid[r][c].tileId !== null;
      
      if (outOfBounds || overlap) {
        allValid = false;
      }
      
      if (!outOfBounds) {
        cells.push({ r, c, isValid: true }); // We'll set the final validity later
      }
    }

    // Check buffer rule for all cells in the potential placement
    if (allValid) {
      for (const cell of cells) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = cell.r + dr;
            const nc = cell.c + dc;
            if (nr >= 0 && nr < 10 && nc >= 0 && nc < 10) {
              const neighbor = player.grid[nr][nc];
              if (neighbor.tileId && neighbor.tileId !== selectedTile.id) {
                allValid = false;
                break;
              }
            }
          }
          if (!allValid) break;
        }
        if (!allValid) break;
      }
    }

    return cells.map(c => ({ ...c, isValid: allValid }));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start justify-center p-4 lg:p-8 bg-slate-950 min-h-screen grid-blueprint relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(234,179,8,0.05),transparent_70%)] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="flex flex-col gap-6 w-full lg:w-auto z-10 relative items-center lg:items-start">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start bg-slate-900/60 p-6 lg:p-8 rounded-2xl border-4 border-slate-800 shadow-2xl backdrop-blur-md relative group overflow-hidden w-full">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          
          <div className="flex flex-col gap-2 relative z-20 text-center sm:text-left mb-4 sm:mb-0">
            <h1 className="text-3xl lg:text-4xl font-serif font-black text-white tracking-tight drop-shadow-lg uppercase">
              {player.name}
            </h1>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <span className="bg-yellow-500 text-slate-950 px-4 py-1 rounded-lg font-mono font-bold text-[10px] tracking-[0.2em] uppercase shadow-[0_0_20px_rgba(234,179,8,0.3)] border-2 border-yellow-300">
                Setup Phase
              </span>
              <p className="text-slate-500 font-mono text-[10px] font-bold uppercase tracking-[0.3em] italic opacity-70">
                Deploy 15 tactical units
              </p>
            </div>
          </div>
          <button
            onClick={onQuit}
            className="group relative p-3 lg:p-4 bg-slate-950 hover:bg-red-600/10 text-slate-600 hover:text-red-400 rounded-xl border-2 border-slate-800 hover:border-red-500/40 transition-all flex items-center gap-3 text-[10px] font-mono font-bold tracking-[0.2em] shadow-xl uppercase overflow-hidden active:scale-95 z-20"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Abandon
          </button>
        </div>

        <div className="relative group p-2 bg-slate-900/40 rounded-2xl border-4 border-slate-800 shadow-2xl w-full overflow-x-auto pb-4 lg:pb-2">
          <div className="relative z-20 p-2 min-w-[380px] flex justify-center">
            <Grid 
              grid={player.grid} 
              onCellClick={handleCellClick}
              onCellMouseEnter={(r, c) => setHoveredCell({ r, c })}
              onCellMouseLeave={() => setHoveredCell(null)}
              previewCells={getPreviewCells()}
              showLabels={true}
            />
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-600/10 text-red-400 p-6 rounded-xl font-mono font-bold text-[10px] tracking-[0.2em] uppercase border-2 border-red-500/40 shadow-lg backdrop-blur-md flex items-center gap-4"
          >
            <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center border-2 border-red-500/20 shadow-inner">
              <Info className="w-5 h-5" />
            </div>
            {error}
          </motion.div>
        )}

        <div className="flex gap-4">
          <button
            onClick={() => onUndo(player.id)}
            disabled={player.tilesPlaced === 0}
            className="flex-1 p-6 bg-slate-900/80 hover:bg-slate-800 disabled:opacity-20 disabled:cursor-not-allowed rounded-xl font-mono font-bold text-[10px] tracking-[0.3em] text-slate-500 hover:text-red-400 transition-all flex items-center justify-center gap-4 border-2 border-slate-800 hover:border-red-500/20 shadow-xl group overflow-hidden active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Trash2 className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
            Undo Last
          </button>
          <button
            onClick={() => onAutoPlace(player.id)}
            disabled={player.tilesPlaced === 15}
            className="flex-1 p-6 bg-slate-900/80 hover:bg-slate-800 disabled:opacity-20 disabled:cursor-not-allowed rounded-xl font-mono font-bold text-[10px] tracking-[0.3em] text-slate-500 hover:text-yellow-400 transition-all flex items-center justify-center gap-4 border-2 border-slate-800 hover:border-yellow-500/20 shadow-xl group overflow-hidden active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <RotateCw className="w-5 h-5 text-yellow-500 group-hover:rotate-180 transition-transform duration-700" />
            Auto-Fill
          </button>
        </div>

        <button
          onClick={onFinalize}
          disabled={player.tilesPlaced < 15}
          className={`
            relative group w-full p-8 rounded-2xl font-serif font-black text-2xl transition-all flex items-center justify-center gap-6 border-4 overflow-hidden active:scale-[0.98]
            ${player.tilesPlaced < 15 
              ? 'bg-slate-900 border-slate-800 text-slate-800 cursor-not-allowed opacity-50' 
              : 'bg-emerald-600 border-emerald-400 text-white hover:bg-emerald-500 shadow-xl hover:scale-[1.01]'}
          `}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-30" />
          <Check className={`w-10 h-10 ${player.tilesPlaced < 15 ? 'text-slate-800' : 'text-emerald-200'} drop-shadow-md`} />
          <span className="drop-shadow-lg tracking-tight uppercase">
            READY ({player.tilesPlaced}/15)
          </span>
        </button>
      </div>

      <div className="flex flex-col gap-6 w-full lg:w-[32rem] z-10 relative">
        <div className="bg-slate-900/80 p-8 rounded-2xl border-4 border-slate-800 shadow-2xl backdrop-blur-md flex flex-col gap-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          
          <div className="flex flex-col gap-6 relative z-20">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.4em] italic">
                Tactical Tray
              </h3>
              <button
                onClick={() => setOrientation(prev => prev === 'h' ? 'v' : 'h')}
                className="flex items-center gap-3 px-6 py-3 bg-slate-950 hover:bg-slate-900 rounded-xl text-[10px] font-mono font-bold text-yellow-500 border-2 border-slate-800 hover:border-yellow-500/40 transition-all shadow-xl group/btn active:scale-95"
              >
                <RotateCw className="w-4 h-4 group-hover/btn:rotate-180 transition-transform duration-500" />
                {orientation === 'h' ? 'HORIZONTAL' : 'VERTICAL'}
              </button>
            </div>

            <div className="bg-slate-950/60 p-6 rounded-xl border-2 border-slate-800/60 flex flex-col gap-4">
              <div className="flex items-center gap-4 text-yellow-500">
                <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center border-2 border-yellow-500/20 shadow-inner">
                  <Info className="w-4 h-4" />
                </div>
                <h4 className="text-[10px] font-mono font-bold uppercase tracking-[0.3em]">Deployment Protocol</h4>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.4)]" />
                  Place exactly 15 tiles total
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.4)]" />
                  1-cell buffer required
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-10 relative z-20">
            <section className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-500/50 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.4)]" />
                  <span className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-[0.2em]">Common Tier (1x1)</span>
                </div>
                <div className="pl-5 flex flex-col gap-1">
                  <p className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                    Placement Rule: Min 3 vowels. Max: not stated (implied by 15 total).
                  </p>
                  <p className="text-[8px] font-mono font-bold text-slate-600 uppercase tracking-widest leading-relaxed italic opacity-70">
                    Standard harvest. The backbone of your vocabulary.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 p-4 bg-slate-950/80 rounded-xl border-2 border-slate-800/40 shadow-inner">
                {commonTiles.map(t => (
                  <Tile 
                    key={t.id} 
                    tile={t} 
                    onClick={() => setSelectedTile(t)}
                    className={selectedTile?.id === t.id ? 'ring-4 ring-yellow-500 scale-110 z-10 shadow-[0_0_20px_rgba(234,179,8,0.4)]' : 'scale-100 opacity-70 hover:opacity-100 hover:scale-105 transition-all'}
                  />
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500/50 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                  <span className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-[0.2em]">Uncommon Tier (1x2)</span>
                </div>
                <div className="pl-5 flex flex-col gap-1">
                  <p className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                    Tactical Note: Min: 0 · Max: not stated. Grants Bonus Draw when fully destroyed.
                  </p>
                  <p className="text-[8px] font-mono font-bold text-slate-600 uppercase tracking-widest leading-relaxed italic opacity-70">
                    1x2 Cells. Hitting both cells triggers a Bonus Draw (free extra shot).
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 p-4 bg-slate-950/80 rounded-xl border-2 border-slate-800/40 shadow-inner">
                {uncommonTiles.map(t => (
                  <Tile 
                    key={t.id} 
                    tile={t} 
                    onClick={() => setSelectedTile(t)}
                    className={selectedTile?.id === t.id ? 'ring-4 ring-yellow-500 scale-110 z-10 shadow-[0_0_20px_rgba(234,179,8,0.4)]' : 'scale-100 opacity-70 hover:opacity-100 hover:scale-105 transition-all'}
                  />
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500/50 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.4)]" />
                  <span className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-[0.2em]">Rare & Wildcard</span>
                </div>
                <div className="pl-5 flex flex-col gap-1">
                  <p className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                    Max 2 Rare / Max 1 Wildcard. Min: 0 for both (not stated).
                  </p>
                  <p className="text-[8px] font-mono font-bold text-slate-600 uppercase tracking-widest leading-relaxed italic opacity-70">
                    Rare counts double in word scoring. Wildcard represents any letter.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 p-4 bg-slate-950/80 rounded-xl border-2 border-slate-800/40 shadow-inner">
                {rareTiles.map(t => (
                  <Tile 
                    key={t.id} 
                    tile={t} 
                    onClick={() => setSelectedTile(t)}
                    className={selectedTile?.id === t.id ? 'ring-4 ring-yellow-500 scale-110 z-10 shadow-[0_0_20px_rgba(234,179,8,0.4)]' : 'scale-100 opacity-70 hover:opacity-100 hover:scale-105 transition-all'}
                  />
                ))}
                <Tile 
                  tile={wildcard} 
                  onClick={() => setSelectedTile(wildcard)}
                  className={selectedTile?.id === wildcard.id ? 'ring-4 ring-yellow-500 scale-110 z-10 shadow-[0_0_20px_rgba(234,179,8,0.4)]' : 'scale-100 opacity-70 hover:opacity-100 hover:scale-105 transition-all'}
                />
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500/50 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                  <span className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-[0.2em]">Special Assets</span>
                </div>
                <div className="pl-5 flex flex-col gap-1">
                  <p className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                    Constraint: Max 1 each. Min: 0 (not stated).
                  </p>
                  <p className="text-[8px] font-mono font-bold text-slate-600 uppercase tracking-widest leading-relaxed italic opacity-70">
                    Vault: 2 hits. Poison: Decoy. Mirror: Copy. Charged: Bonus shot.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 p-4 bg-slate-950/80 rounded-xl border-2 border-slate-800/40 shadow-inner">
                {SPECIAL_TILES.map(t => (
                  <Tile 
                    key={t.id} 
                    tile={t} 
                    onClick={() => setSelectedTile(t)}
                    className={selectedTile?.id === t.id ? 'ring-4 ring-yellow-500 scale-110 z-10 shadow-[0_0_20px_rgba(234,179,8,0.4)]' : 'scale-100 opacity-70 hover:opacity-100 hover:scale-105 transition-all'}
                  />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
