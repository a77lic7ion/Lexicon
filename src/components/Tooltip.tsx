import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  title?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, title }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute z-[100] bottom-full left-1/2 -translate-x-1/2 mb-4 w-56 p-4 bg-slate-950 border-4 border-slate-900 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] pointer-events-none"
          >
            {/* Inner Bezel */}
            <div className="absolute inset-1 rounded-xl border border-white/5 pointer-events-none" />

            {title && (
              <div className="text-[11px] font-mono font-black text-yellow-500 uppercase tracking-[0.2em] mb-2 border-b border-slate-900 pb-1">
                {title}
              </div>
            )}
            <div className="text-[13px] text-slate-400 font-sans font-medium leading-relaxed">
              {content}
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
              <div className="border-[10px] border-transparent border-t-slate-900" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
