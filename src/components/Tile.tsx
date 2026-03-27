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
  hidden?: boolean;
  compact?: boolean;
}

export const Tile: React.FC<TileProps> = ({ tile, isHit, isRevealed, onClick, className, showPoints = true, hidden = false, compact = false }) => {
  const tierStyle = TIERS[tile.tier];

  const content = (
    <motion.div
      whileHover={!hidden ? { scale: 1.05, y: -2 } : {}}
      whileTap={!hidden ? { scale: 0.95 } : {}}
      onClick={!hidden ? onClick : undefined}
      className={`
        relative flex flex-col items-center justify-center
        w-12 h-12 rounded-xl shadow-lg border-2
        ${hidden ? 'bg-slate-800 border-slate-700 shadow-inner' : `${tierStyle.color} ${tierStyle.border} ${tierStyle.glow}`}
        ${isHit ? 'opacity-40 grayscale scale-95' : ''}
        ${isRevealed ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-slate-950 z-20' : ''}
        ${hidden ? 'cursor-default' : 'cursor-pointer'} select-none group overflow-hidden transition-all duration-200
        ${className}
      `}
    >
      {/* Back Pattern for Hidden Tiles */}
      {hidden && (
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-600 via-transparent to-transparent" />
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-1 p-1">
            <div className="border border-slate-600/30 rounded-sm" />
            <div className="border border-slate-600/30 rounded-sm" />
            <div className="border border-slate-600/30 rounded-sm" />
            <div className="border border-slate-600/30 rounded-sm" />
          </div>
          <span className="text-slate-400 font-serif font-black text-lg">?</span>
        </div>
      )}

      {/* Special Icons */}
      {!hidden && tile.isSpecial && (
        <div className="absolute top-1 left-1 opacity-50 group-hover:opacity-100 transition-opacity">
          {tile.isSpecial === 'vault' && <Shield className={`w-3 h-3 ${tierStyle.textColor} drop-shadow-sm`} />}
          {tile.isSpecial === 'charged' && <Zap className={`w-3 h-3 ${tierStyle.textColor} drop-shadow-sm`} />}
          {tile.isSpecial === 'poison' && <Skull className={`w-3 h-3 ${tierStyle.textColor} drop-shadow-sm`} />}
          {tile.isSpecial === 'mirror' && <Copy className={`w-3 h-3 ${tierStyle.textColor} drop-shadow-sm`} />}
        </div>
      )}

      {/* Main Letter */}
      {!hidden && (
        <span className={`${compact ? 'text-sm' : 'text-xl'} font-serif font-black ${tierStyle.textColor} drop-shadow-md z-10 group-hover:scale-110 transition-transform`}>
          {tile.letter === '★' ? <Star className="w-5 h-5 fill-current" /> : tile.letter}
        </span>
      )}

      {/* Points */}
      {!hidden && showPoints && tile.points > 0 && (
        <span className="absolute top-1 right-1 text-[9px] font-mono font-bold text-slate-500/80 group-hover:text-white transition-colors">
          {tile.points}
        </span>
      )}

      {/* Tier Label */}
      {!hidden && !compact && (
        <div className={`absolute bottom-1 left-0 right-0 text-center`}>
          <span className={`text-[7px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-slate-950/60 ${tierStyle.textColor} border border-white/5`}>
            {tierStyle.label}
          </span>
        </div>
      )}

      {/* Hover Glow */}
      {!hidden && <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-200" />}
      
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
