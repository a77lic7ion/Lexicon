import React from 'react';
import { motion } from 'motion/react';
import { CellState } from '../types';
import { Target, X, Shield, Zap, Skull, Copy } from 'lucide-react';

interface GridProps {
  grid: CellState[][];
  onCellClick?: (row: number, col: number) => void;
  isEnemy?: boolean;
  activePlayer?: 1 | 2;
  showLabels?: boolean;
}

export const Grid: React.FC<GridProps> = ({ grid, onCellClick, isEnemy, activePlayer, showLabels = true }) => {
  const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  return (
    <div className="flex flex-col gap-1 p-4 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800">
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

            return (
              <motion.div
                key={`${cell.row}-${cell.col}`}
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onCellClick?.(cell.row, cell.col)}
                className={`
                  w-10 h-10 rounded-md border border-slate-700/50
                  flex items-center justify-center cursor-pointer relative
                  transition-colors duration-200
                  ${isEnemy ? 'bg-slate-900/50' : hasTile ? 'bg-white/10' : 'bg-slate-900/50'}
                  ${isHit ? 'bg-red-500/20 border-red-500/50' : ''}
                  ${isMiss ? 'bg-slate-700/50' : ''}
                  ${isRevealed ? 'bg-yellow-500/20 border-yellow-500/50' : ''}
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
                  <div className="flex flex-col items-center">
                    <Target className="w-5 h-5 text-red-500" />
                    {cell.letter && (
                      <span className="text-[10px] font-bold text-red-400 absolute bottom-0.5">
                        {cell.letter}
                      </span>
                    )}
                  </div>
                )}

                {isMiss && <X className="w-4 h-4 text-slate-500" />}

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
                  <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
