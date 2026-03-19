import React from 'react';
import { motion } from 'motion/react';
import { Shield, Zap, Skull, Copy, Star } from 'lucide-react';
import { LetterTile, TIERS } from '../constants';
import { Tooltip } from './Tooltip';

interface TileProps {
  tile: LetterTile;
  isHit?: boolean;
  isRevealed?: boolean;
  onClick?: () => void;
  className?: string;
  showPoints?: boolean;
}

export const Tile: React.FC<TileProps> = ({ tile, isHit, isRevealed, onClick, className, showPoints = true }) => {
  const tierStyle = TIERS[tile.tier];

  const content = (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        relative flex flex-col items-center justify-center
        w-12 h-12 rounded-xl shadow-lg border-2
        ${tierStyle.color} ${tierStyle.border} ${tierStyle.glow}
        ${isHit ? 'opacity-40 grayscale scale-95' : ''}
        ${isRevealed ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-slate-950 z-20' : ''}
        cursor-pointer select-none group overflow-hidden transition-all duration-200
        ${className}
      `}
    >
      {/* Special Icons */}
      {tile.isSpecial && (
        <div className="absolute top-1 left-1 opacity-50 group-hover:opacity-100 transition-opacity">
          {tile.isSpecial === 'vault' && <Shield className={`w-3 h-3 ${tierStyle.textColor} drop-shadow-sm`} />}
          {tile.isSpecial === 'charged' && <Zap className={`w-3 h-3 ${tierStyle.textColor} drop-shadow-sm`} />}
          {tile.isSpecial === 'poison' && <Skull className={`w-3 h-3 ${tierStyle.textColor} drop-shadow-sm`} />}
          {tile.isSpecial === 'mirror' && <Copy className={`w-3 h-3 ${tierStyle.textColor} drop-shadow-sm`} />}
        </div>
      )}

      {/* Main Letter */}
      <span className={`text-xl font-serif font-black ${tierStyle.textColor} drop-shadow-md z-10 group-hover:scale-110 transition-transform`}>
        {tile.letter === '★' ? <Star className="w-5 h-5 fill-current" /> : tile.letter}
      </span>

      {/* Points */}
      {showPoints && tile.points > 0 && (
        <span className="absolute top-1 right-1 text-[9px] font-mono font-bold text-slate-500/80 group-hover:text-white transition-colors">
          {tile.points}
        </span>
      )}

      {/* Tier Label */}
      <div className={`absolute bottom-1 left-0 right-0 text-center`}>
        <span className={`text-[7px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-slate-950/60 ${tierStyle.textColor} border border-white/5`}>
          {tierStyle.label}
        </span>
      </div>

      {/* Hover Glow */}
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-200" />
      
      {/* Damage Overlay */}
      {isHit && (
        <div className="absolute inset-0 bg-red-950/40 flex items-center justify-center">
          <div className="w-full h-0.5 bg-red-500/50 rotate-45 absolute" />
          <div className="w-full h-0.5 bg-red-500/50 -rotate-45 absolute" />
        </div>
      )}
    </motion.div>
  );

  if (tile.description) {
    return (
      <Tooltip content={tile.description} title={tile.isSpecial ? `${tile.isSpecial.toUpperCase()} TILE` : 'WILDCARD'}>
        {content}
      </Tooltip>
    );
  }

  return content;
};
