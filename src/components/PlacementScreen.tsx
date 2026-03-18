import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LetterTile, LETTER_POOL, SPECIAL_TILES } from '../constants';
import { Grid } from './Grid';
import { Tile } from './Tile';
import { RotateCw, Check, Trash2, Info } from 'lucide-react';

interface PlacementScreenProps {
  player: { id: 1 | 2; name: string; grid: any; tilesPlaced: number };
  onPlace: (row: number, col: number, tile: LetterTile, orientation: 'h' | 'v') => void;
  onFinalize: () => void;
  onUndo: (playerId: 1 | 2) => void;
  onAutoPlace: (playerId: 1 | 2) => void;
  error: string | null;
}

export const PlacementScreen: React.FC<PlacementScreenProps> = ({ 
  player, 
  onPlace, 
  onFinalize, 
  onUndo,
  onAutoPlace,
  error 
}) => {
  const [selectedTile, setSelectedTile] = useState<LetterTile | null>(null);
  const [orientation, setOrientation] = useState<'h' | 'v'>('h');

  // Filter pool to show what's available
  // For simplicity, we'll just show a selection of tiles
  const commonTiles = LETTER_POOL.filter(t => t.tier === 'common').slice(0, 8);
  const uncommonTiles = LETTER_POOL.filter(t => t.tier === 'uncommon').slice(0, 4);
  const rareTiles = LETTER_POOL.filter(t => t.tier === 'rare').slice(0, 4);
  const wildcard = LETTER_POOL.find(t => t.tier === 'wildcard')!;

  const handleCellClick = (r: number, c: number) => {
    if (selectedTile) {
      onPlace(r, c, selectedTile, orientation);
      // We don't auto-deselect because they might want to place another of the same type?
      // Actually, tiles are unique in the pool. Let's deselect for now.
      setSelectedTile(null);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start justify-center p-8 bg-slate-950 min-h-screen">
      <div className="flex flex-col gap-6 w-full lg:w-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-serif font-bold text-white tracking-tight">
            {player.name}: SETUP
          </h1>
          <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">
            Place 15 tiles to begin the battle
          </p>
        </div>

        <Grid 
          grid={player.grid} 
          onCellClick={handleCellClick}
          showLabels={true}
        />

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-500 text-sm font-mono font-bold"
          >
            {error}
          </motion.div>
        )}

        <div className="flex gap-4">
          <button
            onClick={() => onUndo(player.id)}
            disabled={player.tilesPlaced === 0}
            className="flex-1 p-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-mono font-bold text-slate-300 transition-all flex items-center justify-center gap-2 border border-slate-700"
          >
            <Trash2 className="w-5 h-5" />
            UNDO
          </button>
          <button
            onClick={() => onAutoPlace(player.id)}
            disabled={player.tilesPlaced === 15}
            className="flex-1 p-4 bg-yellow-500/10 hover:bg-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-mono font-bold text-yellow-500 transition-all flex items-center justify-center gap-2 border border-yellow-500/20"
          >
            <RotateCw className="w-5 h-5" />
            RANDOM
          </button>
        </div>

        <button
          onClick={onFinalize}
          disabled={player.tilesPlaced < 15}
          className={`
            w-full p-6 rounded-2xl font-serif font-bold text-2xl transition-all flex items-center justify-center gap-3
            ${player.tilesPlaced < 15 
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
              : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'}
          `}
        >
          <Check className="w-8 h-8" />
          FINALIZE PLACEMENT ({player.tilesPlaced}/15)
        </button>
      </div>

      <div className="flex flex-col gap-8 w-full lg:w-96">
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-mono font-bold text-slate-500 uppercase tracking-widest">
              Tile Tray
            </h3>
            <button
              onClick={() => setOrientation(prev => prev === 'h' ? 'v' : 'h')}
              className="flex items-center gap-2 px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-full text-[10px] font-mono font-bold text-slate-300 transition-colors"
            >
              <RotateCw className="w-3 h-3" />
              {orientation === 'h' ? 'HORIZONTAL' : 'VERTICAL'}
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <section className="flex flex-col gap-2">
              <span className="text-[10px] font-mono font-bold text-slate-600 uppercase">Common (1x1)</span>
              <div className="flex flex-wrap gap-2">
                {commonTiles.map(t => (
                  <Tile 
                    key={t.id} 
                    tile={t} 
                    onClick={() => setSelectedTile(t)}
                    className={selectedTile?.id === t.id ? 'ring-4 ring-yellow-500' : ''}
                  />
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-2">
              <span className="text-[10px] font-mono font-bold text-slate-600 uppercase">Uncommon (1x2)</span>
              <div className="flex flex-wrap gap-2">
                {uncommonTiles.map(t => (
                  <Tile 
                    key={t.id} 
                    tile={t} 
                    onClick={() => setSelectedTile(t)}
                    className={selectedTile?.id === t.id ? 'ring-4 ring-yellow-500' : ''}
                  />
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-2">
              <span className="text-[10px] font-mono font-bold text-slate-600 uppercase">Rare & Wildcard</span>
              <div className="flex flex-wrap gap-2">
                {rareTiles.map(t => (
                  <Tile 
                    key={t.id} 
                    tile={t} 
                    onClick={() => setSelectedTile(t)}
                    className={selectedTile?.id === t.id ? 'ring-4 ring-yellow-500' : ''}
                  />
                ))}
                <Tile 
                  tile={wildcard} 
                  onClick={() => setSelectedTile(wildcard)}
                  className={selectedTile?.id === wildcard.id ? 'ring-4 ring-yellow-500' : ''}
                />
              </div>
            </section>

            <section className="flex flex-col gap-2">
              <span className="text-[10px] font-mono font-bold text-slate-600 uppercase">Special Tiles</span>
              <div className="flex flex-wrap gap-2">
                {SPECIAL_TILES.map(t => (
                  <Tile 
                    key={t.id} 
                    tile={t} 
                    onClick={() => setSelectedTile(t)}
                    className={selectedTile?.id === t.id ? 'ring-4 ring-yellow-500' : ''}
                  />
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800/50 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-slate-500">
            <Info className="w-4 h-4" />
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest">Rules</h4>
          </div>
          <ul className="text-[10px] font-sans text-slate-400 flex flex-col gap-2 list-disc pl-4">
            <li>Place exactly 15 tiles total</li>
            <li>Min 3 vowels (Common tier)</li>
            <li>Max 2 Rare tiles</li>
            <li>Max 1 Wildcard</li>
            <li>1-cell buffer required between tiles</li>
            <li>Uncommon tiles occupy 2 cells</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
