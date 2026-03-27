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
            <div key={c} className="w-[6.5vmin] h-[3.5vmin] flex items-center justify-center text-[10px] font-mono text-slate-500 uppercase">
              {c}
            </div>
          ))}
        </div>

        {/* Row Labels */}
        <div className="grid grid-rows-10 gap-0">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="w-[3.5vmin] h-[6.5vmin] flex items-center justify-center text-[10px] font-mono text-slate-500">
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
              ? opponentGrid.flat().filter(c => c.tileId === oppCell.tileId).every(c => c.isHit)
              : false;

            const isHighlighted = lastAction?.cells.some(cell => cell.r === r && cell.c === c);
            const preview = previewCells?.find(p => p.r === r && p.c === c);

            // Determine Cell Background
            let bgColor = "bg-slate-950";

            if (hasMyTile) {
              bgColor = isMyTileHit ? 'bg-orange-900/20' : 'bg-slate-900';
            } else if (isMyTileMiss) {
              bgColor = 'bg-slate-950';
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
                  w-[6.5vmin] h-[6.5vmin] ${bgColor}
                  flex items-center justify-center cursor-pointer relative
                  transition-colors duration-100 group
                  hover:bg-slate-800/40
                `}
              >
                {/* My Ship Indicator */}
                {hasMyTile && !isMyTileHit && (
                  <div className="w-2 h-2 rounded-full bg-slate-700" />
                )}

                {/* Enemy Hit on Me */}
                {isMyTileHit && (
                  <Flame className="w-4 h-4 text-orange-600/50" />
                )}

                {/* My Shot Indicators */}
                {iHitThem && (
                  <div className="relative flex items-center justify-center">
                    <Target className={`w-5 h-5 ${activePlayer === 1 ? 'text-red-600' : 'text-blue-600'}`} />
                    {oppCell.letter && isTileDestroyed && (
                      <span className="text-[10px] font-bold text-white absolute -bottom-1 bg-slate-800 px-1 rounded border border-slate-700">
                        {oppCell.letter}
                      </span>
                    )}
                  </div>
                )}

                {iMissedThem && (
                  <X className="w-4 h-4 text-slate-800" />
                )}

                {/* Revealed Enemy Ship */}
                {isOppRevealed && !iHitThem && (
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-600/50" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-6 justify-center text-[10px] font-mono text-slate-500 uppercase">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-700" />
          <span>Ship</span>
        </div>
        <div className="flex items-center gap-2">
          <Target className="w-3 h-3 text-red-600" />
          <span>Hit</span>
        </div>
        <div className="flex items-center gap-2">
          <X className="w-3 h-3 text-slate-800" />
          <span>Miss</span>
        </div>
      </div>
    </div>
  );
};
