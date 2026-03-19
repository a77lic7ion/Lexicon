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
    <div className="relative p-4 bg-slate-950 rounded-xl border-2 border-slate-900 shadow-xl overflow-hidden" onMouseLeave={onCellMouseLeave}>
      {/* Subtle Radial Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,41,59,0.2)_0%,transparent_70%)] pointer-events-none" />

      <div className="flex flex-col gap-1 relative z-10">
        {/* Column Labels */}
        {showLabels && (
          <div className="flex ml-8 mb-1">
            {cols.map(c => (
              <div key={c} className="w-8 h-5 flex items-center justify-center text-[9px] font-mono font-bold text-slate-600 tracking-widest uppercase">
                {c}
              </div>
            ))}
          </div>
        )}

        <div className="flex">
          {/* Row Labels */}
          {showLabels && (
            <div className="flex flex-col mr-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="w-5 h-8 flex items-center justify-center text-[9px] font-mono font-bold text-slate-600 tracking-widest">
                  {i + 1}
                </div>
              ))}
            </div>
          )}

          {/* Grid Cells Container */}
          <div className="grid grid-cols-10 gap-1 p-2 bg-slate-900/40 rounded-lg border border-slate-800/40 grid-blueprint shadow-inner">
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
                  whileHover={{ scale: 1.1, zIndex: 10 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onCellClick?.(cell.row, cell.col)}
                  onMouseEnter={() => onCellMouseEnter?.(cell.row, cell.col)}
                  className={`
                    w-8 h-8 rounded-md border
                    flex items-center justify-center cursor-pointer relative
                    transition-all duration-200 group
                    ${isEnemy ? 'bg-slate-950/60 border-slate-800/40' : hasTile ? 'bg-slate-800 border-slate-700 shadow-lg' : 'bg-slate-950/60 border-slate-800/40'}
                    ${isHit ? 'bg-red-950/40 border-red-500/60 shadow-[inset_0_0_10px_rgba(239,68,68,0.2)]' : ''}
                    ${isMiss ? 'bg-slate-900/80 border-slate-800/40 opacity-40' : ''}
                    ${isRevealed ? 'bg-yellow-950/30 border-yellow-500/60 shadow-[inset_0_0_10px_rgba(234,179,8,0.2)]' : ''}
                    ${preview ? (preview.isValid ? 'bg-emerald-500/20 border-emerald-500/60' : 'bg-red-500/20 border-red-500/60') : ''}
                    hover:border-slate-500 hover:shadow-[0_0_10px_rgba(255,255,255,0.1)]
                  `}
                >
                  {/* Content for Player's own grid */}
                  {!isEnemy && hasTile && !isHit && (
                    <span className="text-lg font-bold text-slate-500 group-hover:text-slate-300 transition-colors">
                      {cell.letter}
                    </span>
                  )}

                  {/* Content for Enemy grid or Hit cells */}
                  {isHit && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex flex-col items-center justify-center w-full h-full z-10"
                    >
                      <Target className="w-5 h-5 text-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
                      {cell.letter && (
                        <motion.span 
                          initial={{ y: 3, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className="text-[10px] font-bold text-white absolute bg-red-600 px-1.5 py-0.5 rounded shadow-lg border border-red-400/50 -bottom-0.5 z-20"
                        >
                          {cell.letter}
                        </motion.span>
                      )}
                    </motion.div>
                  )}

                  {isMiss && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.6 }}
                      className="text-slate-700 font-mono text-[7px] font-bold uppercase tracking-widest"
                    >
                      MISS
                    </motion.div>
                  )}

                  {/* Special Indicators */}
                  {!isEnemy && isSpecial && (
                    <div className="absolute top-0.5 right-0.5 z-20">
                      {isSpecial === 'vault' && <Shield className="w-2.5 h-2.5 text-blue-400" />}
                      {isSpecial === 'poison' && <Skull className="w-2.5 h-2.5 text-green-400" />}
                      {isSpecial === 'mirror' && <Copy className="w-2.5 h-2.5 text-purple-400" />}
                      {isSpecial === 'charged' && <Zap className="w-2.5 h-2.5 text-yellow-400" />}
                    </div>
                  )}

                  {/* Revealed (Spark/Surge) */}
                  {isEnemy && isRevealed && !isHit && (
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="w-5 h-5 rounded-full bg-yellow-400/10 border border-yellow-400/40 flex items-center justify-center shadow-[0_0_10px_rgba(234,179,8,0.3)]"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
                    </motion.div>
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
