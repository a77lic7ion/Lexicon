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
    <div className="flex flex-col gap-2 p-4 bg-slate-900 rounded-2xl shadow-xl border border-slate-800 w-full">
      <div className="flex justify-between items-center px-2">
        <h3 className="text-sm font-mono font-bold text-slate-500 uppercase tracking-widest">
          {title}
        </h3>
        <span className="text-xs font-mono font-bold text-slate-600">
          {bank.length} LETTERS
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2 min-h-[60px] p-2 bg-slate-950 rounded-lg border border-slate-800/50">
        <AnimatePresence>
          {bank.map((tile, idx) => (
            <motion.div
              key={`${tile.id}-${idx}`}
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0, y: -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
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
          <div className="flex items-center justify-center w-full h-full text-slate-700 text-xs font-mono italic">
            No letters harvested yet...
          </div>
        )}
      </div>
    </div>
  );
};
