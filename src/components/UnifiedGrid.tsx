import React from 'react';
import { motion } from 'motion/react';
import { CellState } from '../types';
import { Target, X, Flame } from 'lucide-react';

interface UnifiedGridProps {
  myGrid: CellState[][];
  opponentGrid: CellState[][];
  onCellClick: (row: number, col: number) => void;
  onCellMouseEnter?: (row: number, col: number) => void;
  onCellMouseLeave?: () => void;
  previewCells?: { r: number; c: number; isValid: boolean }[];
  activePlayer: 1 | 2;
  lastAction?: {
    type: 'fire' | 'bomb';
    cells: { r: number; c: number }[];
    playerId: 1 | 2;
  };
}

export const UnifiedGrid: React.FC<UnifiedGridProps> = ({ 
  myGrid, 
  opponentGrid, 
  onCellClick,
  onCellMouseEnter,
  onCellMouseLeave,
  previewCells,
  activePlayer,
  lastAction
}) => {
  const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  return (
    <div 
      className="flex flex-col gap-2 p-1.5 sm:p-4 bg-slate-950 rounded border border-slate-800 shadow-sm transition-all duration-300"
      onMouseLeave={onCellMouseLeave}
    >
      <div className="grid grid-cols-[24px_1fr] grid-rows-[24px_1fr] gap-0">
        {/* Corner */}
        <div />

        {/* Column Labels */}
        <div className="grid grid-cols-10 gap-0">
          {cols.map(c => (
            <div key={c} className="w-[9.2vmin] h-[4.6vmin] flex items-center justify-center text-[10px] font-mono text-slate-500 uppercase">
              {c}
            </div>
          ))}
        </div>

        {/* Row Labels */}
        <div className="grid grid-rows-10 gap-0">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="w-[4.6vmin] h-[9.2vmin] flex items-center justify-center text-[10px] font-mono text-slate-500">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Grid Cells Container */}
        <div className="grid grid-cols-10 gap-px bg-slate-800 border border-slate-800">
          {myGrid.flat().map((myCell, idx) => {
            const r = myCell.row;
            const c = myCell.col;
            const oppCell = opponentGrid[r][c];

            const hasMyTile = myCell.tileId !== null;
            const isMyTileHit = myCell.isHit;
            const isMyTileMiss = myCell.isMiss;

            const iHitThem = oppCell.isHit;
            const iMissedThem = oppCell.isMiss;
            const isOppRevealed = oppCell.isRevealed;

            const isTileDestroyed = oppCell.tileId
              ? opponentGrid.flat().filter(cell => cell.tileId === oppCell.tileId).every(cell => cell.isHit)
              : false;

            const isHighlighted = lastAction?.cells.some(cell => cell.r === r && cell.c === c);
            const preview = previewCells?.find(p => p.r === r && p.c === c);

            // Determine Cell Background
            let bgColor = "bg-slate-950";

            if (hasMyTile) {
              bgColor = isMyTileHit ? 'bg-red-900/40' : 'bg-red-800';
            } else if (isMyTileMiss) {
              bgColor = 'bg-slate-900';
            }

            if (preview) {
              bgColor = preview.isValid ? 'bg-emerald-900/30' : 'bg-red-900/30';
            } else if (isHighlighted) {
              bgColor = lastAction?.type === 'bomb' ? 'bg-yellow-900/20' : 'bg-red-900/20';
            }

            return (
              <motion.div
                key={`${r}-${c}`}
                whileTap={{ scale: 0.98 }}
                onClick={() => onCellClick(r, c)}
                onMouseEnter={() => onCellMouseEnter?.(r, c)}
                className={`
                  w-[9.2vmin] h-[9.2vmin] ${bgColor}
                  flex items-center justify-center cursor-pointer relative
                  transition-colors duration-100 group
                  hover:bg-slate-800/40
                `}
              >
                {/* My Tile Indicator with Letter */}
                {hasMyTile && !isMyTileHit && (
                  <span className="text-sm font-black text-white drop-shadow-md">
                    {myCell.letter}
                  </span>
                )}

                {/* Enemy Hit on Me */}
                {isMyTileHit && (
                  <>
                    <span className="text-sm font-black text-white/30 absolute">
                      {myCell.letter}
                    </span>
                    <Flame className="w-6 h-6 text-orange-500 z-10 animate-pulse" />
                    <div className="absolute inset-0 border-2 border-red-600/50 mix-blend-overlay" />
                  </>
                )}

                {/* My Shot Indicators (Blue/Teal) */}
                {iHitThem && (
                  <div className="relative flex items-center justify-center w-full h-full bg-cyan-950/20">
                    <Target className={`w-7 h-7 ${activePlayer === 1 ? 'text-cyan-500' : 'text-teal-500'} drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]`} />
                    {oppCell.letter && isTileDestroyed && (
                      <span className="text-[12px] font-black text-white absolute bg-cyan-900 border-2 border-cyan-400 px-1 rounded shadow-lg z-10">
                        {oppCell.letter}
                      </span>
                    )}
                  </div>
                )}

                {iMissedThem && (
                  <X className="w-6 h-6 text-slate-700 opacity-50" />
                )}

                {/* Revealed Enemy Letter */}
                {isOppRevealed && !iHitThem && (
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-6 justify-center text-[10px] font-mono text-slate-500 uppercase font-bold mt-2">
        <div className="flex items-center gap-2 text-red-500">
          <div className="w-2 h-2 bg-red-800 rounded-sm" />
          <span>Your Fleet</span>
        </div>
        <div className="flex items-center gap-2 text-cyan-500">
          <Target className="w-3 h-3" />
          <span>Enemy Hit</span>
        </div>
        <div className="flex items-center gap-2">
          <X className="w-3 h-3 text-slate-800" />
          <span>Sector Clear</span>
        </div>
      </div>
    </div>
  );
};
