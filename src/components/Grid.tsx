import React from 'react';
import { motion } from 'motion/react';
import { CellState } from '../types';
import { Target, Shield, Zap, Skull, Copy } from 'lucide-react';

interface GridProps {
  grid: CellState[][];
  onCellClick?: (row: number, col: number) => void;
  onCellMouseEnter?: (row: number, col: number) => void;
  onCellMouseLeave?: () => void;
  previewCells?: { r: number; c: number; isValid: boolean }[];
  isEnemy?: boolean;
  activePlayer?: 1 | 2;
  showLabels?: boolean;
}

export const Grid: React.FC<GridProps> = ({ 
  grid, 
  onCellClick, 
  onCellMouseEnter,
  onCellMouseLeave,
  previewCells,
  isEnemy, 
  activePlayer, 
  showLabels = true 
}) => {
  const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  return (
    <div className="relative p-6 bg-slate-950 border border-slate-900 overflow-hidden" onMouseLeave={onCellMouseLeave}>
      <div className="relative z-10">
        <div className="grid grid-cols-[32px_1fr] grid-rows-[32px_1fr] gap-0">
          {/* Corner */}
          <div />

          {/* Column Labels */}
          {showLabels ? (
            <div className="grid grid-cols-10 gap-px px-2">
              {cols.map(c => (
                <div key={c} className="w-[6.5vmin] h-[6.5vmin] flex items-center justify-center text-[10px] font-mono text-slate-600 uppercase">
                  {c}
                </div>
              ))}
            </div>
          ) : <div />}

          {/* Row Labels */}
          {showLabels ? (
            <div className="grid grid-rows-10 gap-px py-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="w-[6.5vmin] h-[6.5vmin] flex items-center justify-center text-[10px] font-mono text-slate-600">
                  {i + 1}
                </div>
              ))}
            </div>
          ) : <div />}

          {/* Grid Cells Container */}
          <div className="grid grid-cols-10 gap-px p-2 bg-slate-900/40 border border-slate-800/40">
            {grid.flat().map((cell, idx) => {
              const isHit = cell.isHit;
              const isMiss = cell.isMiss;
              const isRevealed = cell.isRevealed;
              const hasTile = cell.tileId !== null;
              const isSpecial = cell.isSpecial;
              
              const preview = previewCells?.find(p => p.r === cell.row && p.c === cell.col);

              return (
                <motion.div
                  key={`${cell.row}-${cell.col}`}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onCellClick?.(cell.row, cell.col)}
                  onMouseEnter={() => onCellMouseEnter?.(cell.row, cell.col)}
                  className={`
                    w-[6.5vmin] h-[6.5vmin] border border-slate-900
                    flex items-center justify-center cursor-pointer relative
                    transition-colors duration-100 group
                    ${isEnemy ? 'bg-slate-950' : hasTile ? 'bg-slate-900 border-slate-800' : 'bg-slate-950'}
                    ${isHit ? 'bg-red-950/20' : ''}
                    ${isRevealed ? 'bg-yellow-950/20' : ''}
                    ${preview ? (preview.isValid ? 'bg-emerald-950/30' : 'bg-red-950/30') : ''}
                    hover:bg-slate-900/60
                  `}
                >
                  {/* Content for Player's own grid */}
                  {!isEnemy && hasTile && !isHit && (
                    <span className="text-sm font-bold text-slate-600 group-hover:text-slate-400 transition-colors">
                      {cell.letter}
                    </span>
                  )}

                  {/* Content for Enemy grid or Hit cells */}
                  {isHit && (
                    <div className="flex flex-col items-center justify-center w-full h-full z-10">
                      <Target className="w-4 h-4 text-red-600" />
                      {cell.letter && (
                        <span className="text-[10px] font-bold text-white absolute bg-slate-800 px-1 rounded border border-slate-700 -bottom-0.5">
                          {cell.letter}
                        </span>
                      )}
                    </div>
                  )}

                  {isMiss && (
                    <div className="text-slate-800 font-mono text-[6px] font-bold uppercase">
                      MISS
                    </div>
                  )}

                  {/* Special Indicators */}
                  {!isEnemy && isSpecial && (
                    <div className="absolute top-0.5 right-0.5 z-20">
                      {isSpecial === 'vault' && <Shield className="w-2 h-2 text-blue-600" />}
                      {isSpecial === 'poison' && <Skull className="w-2 h-2 text-green-600" />}
                      {isSpecial === 'mirror' && <Copy className="w-2 h-2 text-purple-600" />}
                      {isSpecial === 'charged' && <Zap className="w-2 h-2 text-yellow-600" />}
                    </div>
                  )}

                  {/* Revealed */}
                  {isEnemy && isRevealed && !isHit && (
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-600/40" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
