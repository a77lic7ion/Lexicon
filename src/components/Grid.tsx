import React from 'react';
import { motion } from 'motion/react';
import { CellState } from '../types';
import { Target, X, Shield, Zap, Skull, Copy } from 'lucide-react';

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
    <div className="flex flex-col gap-1 p-4 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800" onMouseLeave={onCellMouseLeave}>
      {/* Column Labels */}
      {showLabels && (
        <div className="flex ml-8">
          {cols.map(c => (
            <div key={c} className="w-10 h-8 flex items-center justify-center text-xs font-mono font-bold text-slate-500">
              {c}
            </div>
          ))}
        </div>
      )}

      <div className="flex">
        {/* Row Labels */}
        {showLabels && (
          <div className="flex flex-col mr-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="w-6 h-10 flex items-center justify-center text-xs font-mono font-bold text-slate-500">
                {i + 1}
              </div>
            ))}
          </div>
        )}

        {/* Grid Cells */}
        <div className="grid grid-cols-10 gap-1 bg-slate-800 p-1 rounded-lg">
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
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onCellClick?.(cell.row, cell.col)}
                onMouseEnter={() => onCellMouseEnter?.(cell.row, cell.col)}
                className={`
                  w-10 h-10 rounded-md border border-slate-700/50
                  flex items-center justify-center cursor-pointer relative
                  transition-colors duration-200
                  ${isEnemy ? 'bg-slate-900/50' : hasTile ? 'bg-white/10' : 'bg-slate-900/50'}
                  ${isHit ? 'bg-red-500/30 border-red-500 shadow-[inset_0_0_10px_rgba(239,68,68,0.2)]' : ''}
                  ${isMiss ? 'bg-slate-800 border-slate-700' : ''}
                  ${isRevealed ? 'bg-yellow-500/30 border-yellow-500 shadow-[inset_0_0_10px_rgba(234,179,8,0.2)]' : ''}
                  ${preview ? (preview.isValid ? 'bg-emerald-500/40 border-emerald-500' : 'bg-red-500/40 border-red-500') : ''}
                `}
              >
                {/* Content for Player's own grid */}
                {!isEnemy && hasTile && !isHit && (
                  <span className="text-xs font-serif font-bold text-slate-300">
                    {cell.letter}
                  </span>
                )}

                {/* Content for Enemy grid or Hit cells */}
                {isHit && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex flex-col items-center justify-center w-full h-full"
                  >
                    <Target className="w-5 h-5 text-red-500" />
                    {cell.letter && (
                      <motion.span 
                        initial={{ y: 5, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-[12px] font-serif font-black text-white absolute bg-red-600 px-1 rounded shadow-sm"
                      >
                        {cell.letter}
                      </motion.span>
                    )}
                  </motion.div>
                )}

                {isMiss && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    <X className="w-4 h-4 text-slate-600" />
                  </motion.div>
                )}

                {/* Special Indicators */}
                {!isEnemy && isSpecial && (
                  <div className="absolute top-0.5 right-0.5">
                    {isSpecial === 'vault' && <Shield className="w-2 h-2 text-blue-400" />}
                    {isSpecial === 'poison' && <Skull className="w-2 h-2 text-green-400" />}
                    {isSpecial === 'mirror' && <Copy className="w-2 h-2 text-purple-400" />}
                    {isSpecial === 'charged' && <Zap className="w-2 h-2 text-yellow-400" />}
                  </div>
                )}

                {/* Revealed (Spark/Surge) */}
                {isEnemy && isRevealed && !isHit && (
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-4 h-4 rounded-full bg-yellow-400/50 border border-yellow-400 flex items-center justify-center"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
