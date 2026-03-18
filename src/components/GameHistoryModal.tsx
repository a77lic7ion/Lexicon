import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, History, Zap, Target } from 'lucide-react';
import { HistoryEvent } from '../types';

interface GameHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryEvent[];
}

export const GameHistoryModal: React.FC<GameHistoryModalProps> = ({ isOpen, onClose, history }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-2xl shadow-2xl flex flex-col max-h-[80vh]"
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-xl">
                <History className="w-6 h-6 text-slate-400" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-white">Battle Log</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {history.length === 0 ? (
              <div className="text-center text-slate-500 py-8 font-mono text-sm">
                No events recorded yet.
              </div>
            ) : (
              history.map((event) => (
                <div 
                  key={event.id}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50"
                >
                  <div className={`p-2 rounded-xl mt-1 ${event.type === 'bomb' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {event.type === 'bomb' ? <Zap className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex justify-between items-start">
                      <span className="font-serif font-bold text-slate-200">
                        {event.playerName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        TURN {event.turn}
                      </span>
                    </div>
                    <div className="text-sm font-mono text-slate-400">
                      {event.action}
                    </div>
                    <div className={`text-xs font-mono font-bold mt-1 ${event.result.includes('HIT') ? 'text-red-400' : 'text-slate-500'}`}>
                      {event.result}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
