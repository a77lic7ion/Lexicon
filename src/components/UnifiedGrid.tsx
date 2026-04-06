import React from 'react';
import { motion } from 'motion/react';
import { CellState } from '../types';
import { Target, X, Zap } from 'lucide-react';

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
        <div className="grid grid-cols-10 gap-px">
          {cols.map(c => (
            <div key={c} className="w-[9.2vmin] h-[24px] flex items-center justify-center text-[10px] font-mono text-slate-500 uppercase">
              {c}
            </div>
          ))}
        </div>

        {/* Row Labels */}
        <div className="grid grid-rows-10 gap-px">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="w-[24px] h-[9.2vmin] flex items-center justify-center text-[10px] font-mono text-slate-500">
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

            const isHighlighted = lastAction?.cells.some(cell => cell.r === r && cell.c === c);
            const preview = previewCells?.find(p => p.r === r && p.c === c);

            let bgClass = "bg-slate-950";
            if (preview) {
              bgClass = preview.isValid ? 'bg-emerald-900/30' : 'bg-red-900/30';
            } else if (isHighlighted) {
              bgClass = lastAction?.type === 'bomb' ? 'bg-yellow-900/10' : 'bg-blue-900/10';
            }

            return (
              <motion.div
                key={`${r}-${c}`}
                whileTap={{ scale: 0.98 }}
                onClick={() => onCellClick(r, c)}
                onMouseEnter={() => onCellMouseEnter?.(r, c)}
                className={`w-[9.2vmin] h-[9.2vmin] ${bgClass} flex items-center justify-center cursor-pointer relative transition-all duration-200 group`}
              >
                {/* LAYER 1: FLEET LAYER (70% Opacity) */}
                {hasMyTile && (
                  <div className={`absolute inset-0.5 rounded-sm flex items-center justify-center transition-opacity duration-300 ${
                    isMyTileHit ? "bg-red-950/70 border border-red-900/50" : "bg-red-800/70 border border-red-700/50"
                  }`}>
                    <span className={`text-[14px] font-black tracking-tighter ${
                      isMyTileHit ? "text-red-400/50" : "text-white"
                    }`}>
                      {myCell.letter}
                    </span>
                  </div>
                )}

                {/* LAYER 2: COMBAT OVERLAY (Transparent Background) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* Damage on Me */}
                  {isMyTileHit && (
                    <div className="absolute inset-0 bg-orange-600/10 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-orange-500 animate-pulse drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cracked-mud.png')] opacity-30 mix-blend-overlay" />
                    </div>
                  )}

                  {/* My Miss on Them */}
                  {isMyTileMiss && !hasMyTile && (
                     <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                       <X className="w-8 h-8 text-slate-700/50" />
                     </div>
                  )}

                  {/* My Hits on Them */}
                  {iHitThem && (
                    <div className="absolute inset-0 bg-cyan-950/10 flex items-center justify-center">
                      <Target className="w-10 h-10 text-cyan-400/40 absolute" />
                      {oppCell.letter && (
                        <span className="text-xl font-black text-cyan-300 drop-shadow-[0_0_10px_rgba(103,232,249,0.9)]">
                          {oppCell.letter}
                        </span>
                      )}
                    </div>
                  )}

                  {/* My Misses on Them */}
                  {iMissedThem && (
                    <X className="w-10 h-10 text-slate-400/40" />
                  )}

                  {/* Reveal Indicators */}
                  {isOppRevealed && !iHitThem && (
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 shadow-[0_0_10px_rgba(234,179,8,0.8)] animate-pulse" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-6 justify-center text-[10px] font-mono text-slate-500 uppercase font-bold mt-2">
        <div className="flex items-center gap-2 text-red-500/80">
          <div className="w-2 h-2 bg-red-800/70 rounded-sm" />
          <span>Your Fleet</span>
        </div>
        <div className="flex items-center gap-2 text-cyan-500/80">
          <Target className="w-3 h-3" />
          <span>Enemy Hit</span>
        </div>
        <div className="flex items-center gap-2">
          <X className="w-3 h-3 text-slate-700" />
          <span>Sector Clear</span>
        </div>
      </div>
    </div>
  );
};
