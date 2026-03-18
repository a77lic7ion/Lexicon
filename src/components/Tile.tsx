import React from 'react';
import { motion } from 'motion/react';
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
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        relative flex items-center justify-center
        w-12 h-12 rounded-lg shadow-md border-2
        ${tierStyle.color} ${tierStyle.border}
        ${isHit ? 'opacity-50 grayscale' : ''}
        ${isRevealed ? 'ring-2 ring-yellow-400' : ''}
        cursor-pointer select-none
        ${className}
      `}
    >
      <span className="text-2xl font-serif font-bold text-slate-800">
        {tile.letter}
      </span>
      {showPoints && tile.points > 0 && (
        <span className="absolute bottom-1 right-1 text-[10px] font-sans font-bold text-slate-500">
          {tile.points}
        </span>
      )}
      {tile.isSpecial && (
        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 shadow-sm" />
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
