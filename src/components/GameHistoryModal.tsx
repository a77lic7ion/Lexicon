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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md grid-blueprint">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-slate-900/95 border-4 border-slate-800 rounded-2xl p-8 w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh] relative overflow-hidden"
        >
          <div className="flex justify-between items-center mb-8 relative z-20">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-slate-950 rounded-xl border-2 border-slate-800 shadow-lg relative group">
                <div className="absolute inset-0 bg-cyan-500/5 blur-xl rounded-full group-hover:bg-cyan-500/10 transition-all" />
                <History className="w-6 h-6 text-slate-400 drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] relative z-10" />
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-serif font-black text-white tracking-tight uppercase drop-shadow-lg">Battle Log</h2>
                <div className="flex items-center gap-3">
                  <div className="h-0.5 w-8 bg-slate-800 rounded-full" />
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">Combat Archives</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 text-slate-600 hover:text-white hover:bg-slate-800 rounded-xl border-2 border-transparent hover:border-slate-700 transition-all shadow-lg group"
            >
              <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-4 space-y-6 custom-scrollbar relative z-20">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-6 opacity-20">
                <History className="w-16 h-16 text-slate-700" />
                <div className="text-center text-slate-700 font-mono font-bold text-[10px] uppercase tracking-widest italic">
                  No events recorded in the archives.
                </div>
              </div>
            ) : (
              history.map((event) => (
                <div 
                  key={event.id}
                  className="flex items-start gap-6 p-6 rounded-2xl bg-slate-950/60 border-2 border-slate-800/60 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all hover:translate-y-[-2px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 grid-blueprint opacity-5 pointer-events-none" />
                  
                  <div className={`p-3 rounded-lg mt-0.5 border-2 shadow-lg relative z-10 ${
                    event.type === 'bomb' 
                      ? 'bg-purple-950/40 text-purple-400 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                      : 'bg-blue-950/40 text-blue-400 border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                  }`}>
                    {event.type === 'bomb' ? <Zap className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                  </div>

                  <div className="flex-1 flex flex-col gap-2 relative z-10">
                    <div className="flex justify-between items-start">
                      <span className="text-xl font-serif font-black text-white tracking-tight uppercase drop-shadow-sm">
                        {event.playerName}
                      </span>
                      <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 uppercase tracking-widest shadow-md">
                        TURN {event.turn}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-slate-800/40 shadow-inner">
                      {event.action}
                    </div>
                    <div className={`text-[11px] font-mono font-bold mt-1 uppercase tracking-widest flex items-center gap-3 p-2 rounded-lg border ${
                      event.result.includes('HIT') 
                        ? 'text-red-500 bg-red-500/5 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]' 
                        : 'text-slate-600 bg-slate-900/40 border-slate-800/40'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        event.result.includes('HIT') 
                          ? 'bg-red-500 animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.8)]' 
                          : 'bg-slate-700'
                      }`} />
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
