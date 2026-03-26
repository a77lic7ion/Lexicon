import React from 'react';
import { motion } from 'motion/react';
import { CellState } from '../types';
import { Target, X, Shield, Zap, Skull, Copy, Flame } from 'lucide-react';

interface UnifiedGridProps {
  myGrid: CellState[][];
  opponentGrid: CellState[][];
  onCellClick: (row: number, col: number) => void;
  onCellMouseEnter?: (row: number, col: number) => void;
  onCellMouseLeave?: () => void;
  previewCells?: { r: number; c: number; isValid: boolean }[];
  activePlayer: 1 | 2;
}

export const UnifiedGrid: React.FC<UnifiedGridProps> = ({ 
  myGrid, 
  opponentGrid, 
  onCellClick,
  onCellMouseEnter,
  onCellMouseLeave,
  previewCells,
  activePlayer
}) => {
  const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  return (
    <div 
      className="flex flex-col gap-3 p-4 bg-slate-950 rounded-xl shadow-xl border-2 border-slate-900 relative overflow-hidden"
      onMouseLeave={onCellMouseLeave}
    >
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.1),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 grid-blueprint opacity-15 pointer-events-none" />
      
      {/* Column Labels */}
      <div className="flex ml-8 mb-1">
        {cols.map(c => (
          <div key={c} className="w-8 h-5 flex items-center justify-center text-[9px] font-mono font-bold text-slate-600 tracking-widest uppercase">
            {c}
          </div>
        ))}
      </div>

      <div className="flex">
        {/* Row Labels */}
        <div className="flex flex-col mr-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="w-5 h-8 flex items-center justify-center text-[9px] font-mono font-bold text-slate-600">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Grid Cells Container */}
        <div className="grid grid-cols-10 gap-1 bg-slate-900/40 p-2 rounded-lg border border-slate-800/40 shadow-inner">
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

            const preview = previewCells?.find(p => p.r === r && p.c === c);

            // Determine Cell Background
            let bgColor = 'bg-slate-950/60';
            let borderColor = 'border-slate-800/40';
            let shadow = '';
            
            if (hasMyTile) {
              bgColor = isMyTileHit ? 'bg-orange-950/30' : 'bg-cyan-950/20';
              borderColor = isMyTileHit ? 'border-orange-500/40' : 'border-cyan-500/40';
              shadow = isMyTileHit ? 'shadow-[inset_0_0_8px_rgba(249,115,22,0.2)]' : 'shadow-[inset_0_0_8px_rgba(6,182,212,0.2)]';
            } else if (isMyTileMiss) {
              bgColor = 'bg-slate-900/80';
              borderColor = 'border-slate-800/60';
            }

            if (preview) {
              bgColor = preview.isValid ? 'bg-emerald-500/20' : 'bg-red-500/20';
              borderColor = preview.isValid ? 'border-emerald-500/60' : 'border-red-500/60';
            }

            return (
              <motion.div
                key={`${r}-${c}`}
                whileHover={{ scale: 1.1, zIndex: 10 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onCellClick(r, c)}
                onMouseEnter={() => onCellMouseEnter?.(r, c)}
                className={`
                  w-8 h-8 rounded-md border ${borderColor} ${bgColor} ${shadow}
                  flex items-center justify-center cursor-pointer relative
                  transition-all duration-200 group
                  hover:border-slate-500 hover:shadow-[0_0_10px_rgba(255,255,255,0.1)]
                `}
              >
                {/* My Ship Indicator (Small dot) */}
                {hasMyTile && !isMyTileHit && (
                  <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-cyan-400/40 shadow-[0_0_6px_rgba(34,211,238,0.5)]" />
                )}

                {/* Enemy Hit on Me (Flame/Damage) */}
                {isMyTileHit && (
                  <motion.div 
                    animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.9, 1.1, 0.9] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <Flame className="w-5 h-5 text-orange-500/30 blur-[1px]" />
                  </motion.div>
                )}

                {/* My Shot Indicators (Primary Focus) */}
                {iHitThem && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="z-10 flex flex-col items-center justify-center"
                  >
                    <Target className="w-5 h-5 text-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
                    {oppCell.letter && (
                      <span className="text-[9px] font-bold text-white absolute bg-red-600 px-1 py-0.5 rounded shadow-lg border border-red-400/50 -bottom-0.5 z-20">
                        {oppCell.letter}
                      </span>
                    )}
                  </motion.div>
                )}

                {iMissedThem && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="z-10"
                  >
                    <X className="w-4 h-4 text-slate-600/80" />
                  </motion.div>
                )}

                {/* Revealed Enemy Ship (Spark/Surge) */}
                {isOppRevealed && !iHitThem && (
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-yellow-400/10 rounded-md flex items-center justify-center"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend Container */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center border-t border-slate-900/60 pt-4">
        <div className="flex items-center gap-2 group">
          <div className="w-3 h-3 rounded bg-cyan-500/20 border border-cyan-500/40" />
          <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-400 transition-colors">Your Ship</span>
        </div>
        <div className="flex items-center gap-2 group">
          <div className="w-3 h-3 rounded bg-orange-500/20 border border-orange-500/40" />
          <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-400 transition-colors">Damaged</span>
        </div>
        <div className="flex items-center gap-2 group">
          <Target className="w-4 h-4 text-red-500" />
          <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-400 transition-colors">Enemy Hit</span>
        </div>
        <div className="flex items-center gap-2 group">
          <X className="w-4 h-4 text-slate-600" />
          <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-400 transition-colors">Miss</span>
        </div>
      </div>
    </div>

  );
};
