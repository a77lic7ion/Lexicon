import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LetterTile } from '../constants';
import { Tile } from './Tile';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableTileProps {
  tile: LetterTile;
  onClick?: (tile: LetterTile) => void;
  index: number;
}

const SortableTile: React.FC<SortableTileProps> = ({ tile, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tile.uniqueId || tile.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-none"
    >
      <Tile 
        tile={tile} 
        onClick={() => onClick?.(tile)}
        className="w-10 h-10 cursor-grab active:cursor-grabbing"
        showPoints={false}
      />
    </div>
  );
};

interface LetterBankProps {
  bank: LetterTile[];
  onTileClick?: (tile: LetterTile) => void;
  onReorder?: (newBank: LetterTile[]) => void;
  title?: string;
}

export const LetterBank: React.FC<LetterBankProps> = ({ 
  bank, 
  onTileClick, 
  onReorder,
  title = "Letter Bank" 
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = bank.findIndex((t) => (t.uniqueId || t.id) === active.id);
      const newIndex = bank.findIndex((t) => (t.uniqueId || t.id) === over.id);
      
      if (onReorder) {
        onReorder(arrayMove(bank, oldIndex, newIndex));
      }
    }
  };

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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={bank.map(t => t.uniqueId || t.id)}
            strategy={horizontalListSortingStrategy}
          >
            <AnimatePresence>
              {bank.map((tile, idx) => (
                <motion.div
                  key={tile.uniqueId || `${tile.id}-${idx}`}
                  layout
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 200, 
                    damping: 25,
                    layout: { duration: 0.3 }
                  }}
                >
                  <SortableTile 
                    tile={tile} 
                    onClick={onTileClick}
                    index={idx}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </SortableContext>
        </DndContext>
        {bank.length === 0 && (
          <div className="flex items-center justify-center w-full h-full text-slate-700 text-xs font-mono italic">
            No letters harvested yet...
          </div>
        )}
      </div>
    </div>
  );
};
