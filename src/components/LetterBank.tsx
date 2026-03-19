import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LetterTile } from '../constants';
import { Tile } from './Tile';

interface LetterBankProps {
  bank: LetterTile[];
  onTileClick?: (tile: LetterTile) => void;
  title?: string;
}

export const LetterBank: React.FC<LetterBankProps> = ({ bank, onTileClick, title = "Letter Bank" }) => {
  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-900/60 rounded-2xl border-2 border-slate-800 shadow-xl w-full backdrop-blur-md relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
      
      <div className="flex justify-between items-center px-1">
        <h3 className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest italic">
          {title}
        </h3>
        <span className="text-[8px] font-mono font-bold text-yellow-500 bg-slate-950 px-3 py-1 rounded-full border border-slate-800 shadow-md tracking-widest">
          {bank.length} UNITS
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2 min-h-[80px] p-3 bg-slate-950/80 rounded-xl border-2 border-slate-800/50 shadow-inner relative">
        <div className="absolute inset-0 bg-grid-slate-800/[0.05] pointer-events-none" />
        <AnimatePresence>
          {bank.map((tile, idx) => (
            <motion.div
              key={tile.uniqueId || `${tile.id}-${idx}`}
              layout
              initial={{ scale: 0, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0, y: -10 }}
              transition={{ 
                type: 'spring', 
                stiffness: 400, 
                damping: 25,
                layout: { duration: 0.2 }
              }}
            >
              <Tile 
                tile={tile} 
                onClick={() => onTileClick?.(tile)}
                className="w-10 h-10"
                showPoints={false}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        {bank.length === 0 && (
          <div className="flex items-center justify-center w-full h-full text-slate-800 text-[9px] font-mono font-bold uppercase tracking-widest italic opacity-50">
            No tactical units harvested...
          </div>
        )}
      </div>
    </div>
  );
};
