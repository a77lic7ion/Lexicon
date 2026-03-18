import React from 'react';
import { motion } from 'motion/react';
import { CellState } from '../types';
import { Target, X, Shield, Zap, Skull, Copy, Flame } from 'lucide-react';

interface UnifiedGridProps {
  myGrid: CellState[][];
  opponentGrid: CellState[][];
  onCellClick: (row: number, col: number) => void;
  activePlayer: 1 | 2;
}

export const UnifiedGrid: React.FC<UnifiedGridProps> = ({ 
  myGrid, 
  opponentGrid, 
  onCellClick,
  activePlayer
}) => {
  const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  return (
    <div className="flex flex-col gap-1 p-6 bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.05),transparent_50%)] pointer-events-none" />
      
      {/* Column Labels */}
      <div className="flex ml-8">
        {cols.map(c => (
          <div key={c} className="w-12 h-8 flex items-center justify-center text-[10px] font-mono font-bold text-slate-500 tracking-widest">
            {c}
          </div>
        ))}
      </div>

      <div className="flex">
        {/* Row Labels */}
        <div className="flex flex-col mr-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="w-6 h-12 flex items-center justify-center text-[10px] font-mono font-bold text-slate-500">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Grid Cells */}
        <div className="grid grid-cols-10 gap-1.5 bg-slate-950/50 p-2 rounded-2xl border border-slate-800/50">
          {myGrid.flat().map((myCell, idx) => {
            const r = myCell.row;
            const c = myCell.col;
            const oppCell = opponentGrid[r][c];
            
            const hasMyTile = myCell.tileId !== null;
            const isMyTileHit = myCell.isHit; // Enemy hit me
            const isMyTileMiss = myCell.isMiss; // Enemy missed me
            
            const iHitThem = oppCell.isHit;
            const iMissedThem = oppCell.isMiss;
            const isOppRevealed = oppCell.isRevealed;

            // Determine Cell Background
            let bgColor = 'bg-slate-900/40';
            let borderColor = 'border-slate-800/50';
            
            if (hasMyTile) {
              bgColor = isMyTileHit ? 'bg-orange-500/20' : 'bg-cyan-500/10';
              borderColor = isMyTileHit ? 'border-orange-500/50' : 'border-cyan-500/30';
            } else if (isMyTileMiss) {
              bgColor = 'bg-slate-800/30';
            }

            return (
              <motion.div
                key={`${r}-${c}`}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onCellClick(r, c)}
                className={`
                  w-12 h-12 rounded-xl border-2 ${borderColor} ${bgColor}
                  flex items-center justify-center cursor-pointer relative
                  transition-all duration-300 group
                `}
              >
                {/* My Ship Indicator (Small dot or letter) */}
                {hasMyTile && !isMyTileHit && (
                  <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-cyan-400/50 shadow-[0_0_5px_rgba(34,211,238,0.5)]" />
                )}

                {/* Enemy Hit on Me (Flame/Damage) */}
                {isMyTileHit && (
                  <motion.div 
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <Flame className="w-8 h-8 text-orange-500/20 blur-sm" />
                  </motion.div>
                )}

                {/* My Shot Indicators (Primary Focus) */}
                {iHitThem && (
                  <motion.div 
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="z-10 flex flex-col items-center justify-center"
                  >
                    <Target className="w-6 h-6 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                    {oppCell.letter && (
                      <span className="text-[10px] font-serif font-black text-white absolute bg-red-600 px-1 rounded shadow-lg">
                        {oppCell.letter}
                      </span>
                    )}
                  </motion.div>
                )}

                {iMissedThem && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="z-10"
                  >
                    <X className="w-5 h-5 text-slate-600" />
                  </motion.div>
                )}

                {/* Revealed Enemy Ship (Spark/Surge) */}
                {isOppRevealed && !iHitThem && (
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-yellow-400/10 rounded-lg flex items-center justify-center"
                  >
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                  </motion.div>
                )}

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 justify-center border-t border-slate-800 pt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-cyan-500/20 border border-cyan-500/50" />
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Your Ship</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-orange-500/20 border border-orange-500/50" />
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Ship Damaged</span>
        </div>
        <div className="flex items-center gap-2">
          <Target className="w-3 h-3 text-red-500" />
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Enemy Hit</span>
        </div>
        <div className="flex items-center gap-2">
          <X className="w-3 h-3 text-slate-600" />
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Miss</span>
        </div>
      </div>
    </div>
  );
};
