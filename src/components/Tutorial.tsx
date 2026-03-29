import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GamePhase } from '../types';
import { Target, Move, Check, ChevronDown, X } from 'lucide-react';

interface TutorialProps {
  phase: GamePhase;
  isAiMode: boolean;
}

export const Tutorial: React.FC<TutorialProps> = ({ phase, isAiMode }) => {
  if (!isAiMode) return null;

  const [collapsed, setCollapsed] = React.useState(false);
  const [closed, setClosed] = React.useState(false);

  return (
    <AnimatePresence>
      {(phase === GamePhase.Setup || phase === GamePhase.Battle) && !closed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 left-4 right-4 max-w-md z-40"
        >
          <motion.div
            className="bg-gradient-to-r from-blue-900/95 to-slate-900/95 border-2 border-blue-500/50 rounded-xl p-3 sm:p-4 backdrop-blur-md shadow-2xl"
            layout
          >
            {/* Header */}
            <div className="w-full flex items-center justify-between mb-2">
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-1"
              >
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-400 animate-pulse" />
                <h3 className="font-clash text-sm sm:text-base text-yellow-400 font-bold">TUTORIAL</h3>
                <motion.div
                  animate={{ rotate: collapsed ? -180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-auto"
                >
                  <ChevronDown size={18} className="text-blue-300" />
                </motion.div>
              </button>
              <button
                onClick={() => setClosed(true)}
                className="flex-shrink-0 p-1 text-blue-300 hover:text-white hover:bg-white/10 rounded transition-colors ml-2"
                title="Close tutorial"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <motion.div
              layout
              animate={{ opacity: collapsed ? 0 : 1, height: collapsed ? 0 : 'auto' }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {phase === GamePhase.Setup ? (
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="bg-blue-950/50 rounded-lg p-2.5 border border-blue-500/30">
                    <p className="text-blue-100 font-bold mb-1.5">📍 Розташування кораблів (30 сек)</p>
                    <p className="text-blue-200 leading-relaxed">
                      Клікни на корабель, потім перетягни його в бажану клітинку снизу. Твої кораблі повинні бути в нижній частині дошки.
                    </p>
                  </div>
                  <div className="bg-yellow-950/50 rounded-lg p-2.5 border border-yellow-500/30">
                    <p className="text-yellow-100 text-[10px] sm:text-[11px] font-bold">💡 ПІДКАЗКА: Розташуй кораблі стратегічно!</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-xs sm:text-sm">
                  <p className="text-blue-100 font-bold text-center mb-2">⚔️ БОЙ: Послідовність дій</p>
                  
                  <div className="bg-amber-950/60 rounded-lg p-2.5 border border-amber-500/40 flex gap-2.5">
                    <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 bg-amber-600 rounded-full font-bold text-white text-[10px] sm:text-xs">
                      1
                    </div>
                    <div>
                      <p className="font-bold text-amber-100 text-[10px] sm:text-xs">FIRE (Вистріл)</p>
                      <p className="text-amber-200 text-[9px] sm:text-[10px] leading-tight">
                        Клікни на корабель → на кнопку FIRE → вибери ціль (червоний гекс)
                      </p>
                    </div>
                  </div>

                  <div className="bg-cyan-950/60 rounded-lg p-2.5 border border-cyan-500/40 flex gap-2.5">
                    <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 bg-cyan-600 rounded-full font-bold text-white text-[10px] sm:text-xs">
                      2
                    </div>
                    <div>
                      <p className="font-bold text-cyan-100 text-[10px] sm:text-xs">MOVE (Хід)</p>
                      <p className="text-cyan-200 text-[9px] sm:text-[10px] leading-tight">
                        Перетягни корабель на сусідню клітинку (синя область)
                      </p>
                    </div>
                  </div>

                  <div className="bg-emerald-950/60 rounded-lg p-2.5 border border-emerald-500/40 flex gap-2.5">
                    <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 bg-emerald-600 rounded-full font-bold text-white text-[10px] sm:text-xs">
                      3
                    </div>
                    <div>
                      <p className="font-bold text-emerald-100 text-[10px] sm:text-xs">END TURN</p>
                      <p className="text-emerald-200 text-[9px] sm:text-[10px] leading-tight">
                        Натисни END TURN щоб закінчити твій хід
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                    <p className="text-white/80 text-[9px] sm:text-[10px] text-center font-mono">
                      💬 Вистріл → Хід → END TURN → Повтори!
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
