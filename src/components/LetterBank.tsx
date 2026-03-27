import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LetterTile } from '../constants';
import { Tile } from './Tile';

interface LetterBankProps {
  bank: LetterTile[];
  onTileClick?: (tile: LetterTile) => void;
  title?: string;
  hidden?: boolean;
}

export const LetterBank: React.FC<LetterBankProps> = ({ bank, onTileClick, title = "Letter Bank", hidden = false }) => {
  return (
    <div className="flex flex-col gap-0.5 p-1.5 bg-slate-900/40 rounded-xl border border-slate-800 shadow-lg w-full backdrop-blur-md relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
      
      <div className="flex justify-between items-center px-1">
        <h3 className="text-[7px] font-mono font-bold text-slate-600 uppercase tracking-widest italic">
          {title}
        </h3>
        <span className="text-[7px] font-mono font-bold text-yellow-500/60 tracking-widest">
          {bank.length} UNITS
        </span>
      </div>
      
      <div className="flex flex-wrap gap-1 min-h-[40px] p-1 bg-slate-950/40 rounded-lg border border-slate-800/30 shadow-inner relative">
        <div className="absolute inset-0 bg-grid-slate-800/[0.05] pointer-events-none" />
        <AnimatePresence>
          {bank.map((tile, idx) => (
            <motion.div
              key={tile.uniqueId || `${tile.id}-${idx}`}
              layout
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <Tile 
                tile={tile} 
                onClick={() => onTileClick?.(tile)}
                className="w-8 h-8"
                showPoints={false}
                hidden={hidden}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        {bank.length === 0 && (
          <div className="flex items-center justify-center w-full h-full text-slate-800 text-[7px] font-mono font-bold uppercase tracking-widest italic opacity-30">
            Empty
          </div>
        )}
      </div>
    </div>
  );
};
