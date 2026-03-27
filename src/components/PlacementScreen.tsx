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
  onRemoveAt?: (playerId: 1 | 2, row: number, col: number) => void;
}

export const PlacementScreen: React.FC<PlacementScreenProps> = ({ 
  player, 
  onPlace, 
  onFinalize, 
  onUndo,
  onAutoPlace,
  onQuit,
  error,
  onRemoveAt
}) => {
  const [selectedTile, setSelectedTile] = useState<LetterTile | null>(null);
  const [orientation, setOrientation] = useState<'h' | 'v'>('h');
  const [hoveredCell, setHoveredCell] = useState<{ r: number; c: number } | null>(null);

  // Count placed tiles to handle limits
  const placedTiles = player.grid.flat().filter((cell: any) => cell.tileId !== null);
  const placedTileIds = new Set(placedTiles.map((cell: any) => cell.tileId));
  const allPossibleTiles = [...LETTER_POOL, ...SPECIAL_TILES];
  const placedTileObjects = Array.from(placedTileIds).map(id => allPossibleTiles.find(t => t.id === id)).filter(Boolean) as LetterTile[];

  const rareCount = placedTileObjects.filter(t => t.tier === 'rare').length;
  const wildcardCount = placedTileObjects.filter(t => t.tier === 'wildcard').length;

  const isTileDisabled = (tile: LetterTile) => {
    if (player.tilesPlaced >= 15) return true;
    if (tile.tier === 'rare' && rareCount >= 2) return true;
    if (tile.tier === 'wildcard' && wildcardCount >= 1) return true;
    if (tile.tier === 'special' && placedTileIds.has(tile.id)) return true;

    // Instance check for letters
    const instancesInPool = (tile.tier === 'special' ? SPECIAL_TILES : LETTER_POOL).filter(t => 
      (tile.tier === 'special' ? t.id === tile.id : (t.letter === tile.letter && t.tier === tile.tier))
    );
    const placedInstances = placedTileObjects.filter(t => 
      (tile.tier === 'special' ? t.id === tile.id : (t.letter === tile.letter && t.tier === tile.tier))
    );
    
    return placedInstances.length >= instancesInPool.length;
  };

  // Filter pool to show what's available
  const commonTiles = Array.from(new Set(LETTER_POOL.filter(t => t.tier === 'common').map(t => t.letter)))
    .map(letter => LETTER_POOL.find(t => t.letter === letter && t.tier === 'common')!);
  const uncommonTiles = Array.from(new Set(LETTER_POOL.filter(t => t.tier === 'uncommon').map(t => t.letter)))
    .map(letter => LETTER_POOL.find(t => t.letter === letter && t.tier === 'uncommon')!);
  const rareTiles = Array.from(new Set(LETTER_POOL.filter(t => t.tier === 'rare').map(t => t.letter)))
    .map(letter => LETTER_POOL.find(t => t.letter === letter && t.tier === 'rare')!);
  const wildcard = LETTER_POOL.find(t => t.tier === 'wildcard')!;

  const handleCellClick = (r: number, c: number) => {
    if (selectedTile) {
      const currentPlacedIds = new Set(player.grid.flat().filter((cell: any) => cell.tileId !== null).map((cell: any) => cell.tileId));
      const availableTile = LETTER_POOL.find(t => 
        t.letter === selectedTile.letter && 
        t.tier === selectedTile.tier && 
        !currentPlacedIds.has(t.id)
      ) || SPECIAL_TILES.find(t => 
        t.id === selectedTile.id && 
        !currentPlacedIds.has(t.id)
      );

      if (availableTile) {
        onPlace(r, c, availableTile, orientation);
        // Keep selection to allow rapid repeat placements or repositioning
      }
    } else {
      const cell = player.grid[r][c];
      if (cell?.tileId) {
        const fromPool = LETTER_POOL.find(t => t.id === cell.tileId) || SPECIAL_TILES.find(t => t.id === cell.tileId) || null;
        if (fromPool) {
          onRemoveAt?.(player.id, r, c);
          setSelectedTile(fromPool);
        }
      }
    }
  };

  const getPreviewCells = () => {
    if (!selectedTile || !hoveredCell) return [];
    
    const cells: { r: number; c: number; isValid: boolean }[] = [];
    let allValid = true;

    for (let i = 0; i < selectedTile.size; i++) {
      const r = orientation === 'v' ? hoveredCell.r + i : hoveredCell.r;
      const c = orientation === 'h' ? hoveredCell.c + i : hoveredCell.c;
      
      const outOfBounds = r >= 10 || c >= 10;
      const overlap = !outOfBounds && player.grid[r][c].tileId !== null;
      
      if (outOfBounds || overlap) {
        allValid = false;
      }
      
      if (!outOfBounds) {
        cells.push({ r, c, isValid: true });
      }
    }

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
    <div className="flex flex-col lg:flex-row gap-8 items-center justify-center p-2 bg-slate-950 h-full w-full relative overflow-hidden">
      <div className="flex flex-col gap-6 w-full lg:w-auto z-10 relative items-center lg:items-start">
        <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-900/40 p-6 rounded border border-slate-800 w-full">
          <div className="flex flex-col gap-1 relative z-20 text-center sm:text-left mb-4 sm:mb-0">
            <h1 className="text-2xl font-black text-white uppercase tracking-tight italic">
              {player.name}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-yellow-600 font-mono font-bold text-[8px] tracking-widest uppercase">
                Setup Phase
              </span>
            </div>
          </div>
          <button
            onClick={onQuit}
            className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-500 rounded border border-slate-800 transition-colors flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest active:scale-95"
          >
            <LogOut className="w-3 h-3" /> Abandon
          </button>
        </div>

        <div className="p-2 bg-slate-950 border border-slate-900 w-full overflow-x-auto">
          <div className="flex justify-center">
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
          <div className="bg-red-950/20 text-red-600 p-4 rounded font-mono font-bold text-[9px] uppercase border border-red-900/30 flex items-center gap-3">
            <Info className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="flex gap-4 w-full">
          <button
            onClick={() => onUndo(player.id)}
            disabled={player.tilesPlaced === 0}
            className="flex-1 p-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 rounded font-mono font-bold text-[9px] text-slate-500 transition-all flex items-center justify-center gap-3 border border-slate-800 active:scale-95"
          >
            <Trash2 className="w-4 h-4" /> Undo
          </button>
          <button
            onClick={() => onAutoPlace(player.id)}
            disabled={player.tilesPlaced === 15}
            className="flex-1 p-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 rounded font-mono font-bold text-[9px] text-slate-500 transition-all flex items-center justify-center gap-3 border border-slate-800 active:scale-95"
          >
            <RotateCw className="w-4 h-4" /> Auto-Fill
          </button>
        </div>

        <button
          onClick={onFinalize}
          disabled={player.tilesPlaced < 15}
          className={`
            w-full p-6 rounded font-bold text-lg transition-all flex items-center justify-center gap-4 border active:scale-[0.98]
            ${player.tilesPlaced < 15 
              ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed opacity-50'
              : 'bg-emerald-700 border-emerald-600 text-white hover:bg-emerald-600 shadow-sm'}
          `}
        >
          <Check className="w-6 h-6" />
          <span className="uppercase tracking-widest">
            READY ({player.tilesPlaced}/15)
          </span>
        </button>
      </div>

      <div className="flex flex-col gap-6 w-full lg:w-[24rem] z-10 relative overflow-y-auto custom-scrollbar h-full pr-1">
        <div className="bg-slate-900/40 p-6 rounded border border-slate-800 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h3 className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">
              Tactical Tray
            </h3>
            <button
              onClick={() => setOrientation(prev => prev === 'h' ? 'v' : 'h')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-950 hover:bg-slate-900 rounded text-[8px] font-mono font-bold text-yellow-600 border border-slate-800 transition-all active:scale-95"
            >
              <RotateCw className="w-3 h-3" />
              {orientation === 'h' ? 'HORIZONTAL' : 'VERTICAL'}
            </button>
          </div>

          <div className="bg-slate-950 p-4 rounded border border-slate-900 flex flex-col gap-3">
            <div className="flex items-center gap-3 text-yellow-600">
              <Info className="w-3 h-3" />
              <h4 className="text-[9px] font-mono font-bold uppercase tracking-widest">Deployment</h4>
            </div>
            <ul className="grid grid-cols-1 gap-1 text-[8px] font-mono text-slate-500 uppercase tracking-widest">
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-yellow-600 rounded-full" />
                Place exactly 15 tiles
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-yellow-600 rounded-full" />
                1-cell buffer required
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-8">
            <section className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-yellow-600/50 rounded-full" />
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">Common (1x1)</span>
              </div>
              <div className="flex flex-wrap gap-2 p-3 bg-slate-950 rounded border border-slate-900">
                {commonTiles.map(t => {
                  const disabled = isTileDisabled(t);
                  return (
                    <Tile 
                      key={t.id} 
                      tile={t} 
                  onClick={() => {
                    if (disabled) return;
                    if (selectedTile?.id === t.id) {
                      setOrientation(prev => prev === 'h' ? 'v' : 'h');
                    } else {
                      setSelectedTile(t);
                    }
                  }}
                      className={`
                        ${selectedTile?.id === t.id ? 'ring-2 ring-yellow-600 scale-105 z-10' : 'scale-100 opacity-60 hover:opacity-100 transition-all'}
                        ${disabled ? 'opacity-10 grayscale pointer-events-none' : ''}
                      `}
                    />
                  );
                })}
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600/50 rounded-full" />
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">Uncommon (1x2)</span>
              </div>
              <div className="flex flex-wrap gap-2 p-3 bg-slate-950 rounded border border-slate-900">
                {uncommonTiles.map(t => {
                  const disabled = isTileDisabled(t);
                  return (
                    <Tile 
                      key={t.id} 
                      tile={t} 
                  onClick={() => {
                    if (disabled) return;
                    if (selectedTile?.id === t.id) {
                      setOrientation(prev => prev === 'h' ? 'v' : 'h');
                    } else {
                      setSelectedTile(t);
                    }
                  }}
                      className={`
                        ${selectedTile?.id === t.id ? 'ring-2 ring-yellow-600 scale-105 z-10' : 'scale-100 opacity-60 hover:opacity-100 transition-all'}
                        ${disabled ? 'opacity-10 grayscale pointer-events-none' : ''}
                      `}
                    />
                  );
                })}
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-600/50 rounded-full" />
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">Rare & Wildcard</span>
              </div>
              <div className="flex flex-wrap gap-2 p-3 bg-slate-950 rounded border border-slate-900">
                {rareTiles.map(t => {
                  const disabled = isTileDisabled(t);
                  return (
                    <Tile 
                      key={t.id} 
                      tile={t} 
                  onClick={() => {
                    if (disabled) return;
                    if (selectedTile?.id === t.id) {
                      setOrientation(prev => prev === 'h' ? 'v' : 'h');
                    } else {
                      setSelectedTile(t);
                    }
                  }}
                      className={`
                        ${selectedTile?.id === t.id ? 'ring-2 ring-yellow-600 scale-105 z-10' : 'scale-100 opacity-60 hover:opacity-100 transition-all'}
                        ${disabled ? 'opacity-10 grayscale pointer-events-none' : ''}
                      `}
                    />
                  );
                })}
                {(() => {
                  const disabled = isTileDisabled(wildcard);
                  return (
                    <Tile 
                      tile={wildcard} 
                  onClick={() => {
                    if (disabled) return;
                    if (selectedTile?.id === wildcard.id) {
                      setOrientation(prev => prev === 'h' ? 'v' : 'h');
                    } else {
                      setSelectedTile(wildcard);
                    }
                  }}
                      className={`
                        ${selectedTile?.id === wildcard.id ? 'ring-2 ring-yellow-600 scale-105 z-10' : 'scale-100 opacity-60 hover:opacity-100 transition-all'}
                        ${disabled ? 'opacity-10 grayscale pointer-events-none' : ''}
                      `}
                    />
                  );
                })()}
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-600/50 rounded-full" />
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">Special</span>
              </div>
              <div className="flex flex-wrap gap-2 p-3 bg-slate-950 rounded border border-slate-900">
                {SPECIAL_TILES.map(t => {
                  const disabled = isTileDisabled(t);
                  return (
                    <Tile 
                      key={t.id} 
                      tile={t} 
                  onClick={() => {
                    if (disabled) return;
                    if (selectedTile?.id === t.id) {
                      setOrientation(prev => prev === 'h' ? 'v' : 'h');
                    } else {
                      setSelectedTile(t);
                    }
                  }}
                      className={`
                        ${selectedTile?.id === t.id ? 'ring-2 ring-yellow-600 scale-105 z-10' : 'scale-100 opacity-60 hover:opacity-100 transition-all'}
                        ${disabled ? 'opacity-10 grayscale pointer-events-none' : ''}
                      `}
                    />
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
