import React from 'react';
import { GameEvent } from '../types/game';
import { Flame, Dices, ChevronRight } from 'lucide-react';
import { sound } from '../utils/audio';

interface EventModalProps {
  event: GameEvent;
  onChooseOption: (option: 'A' | 'B') => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  event,
  onChooseOption,
}) => {
  const handleSelect = (opt: 'A' | 'B') => {
    sound.playClick();
    onChooseOption(opt);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-fadeIn">
      {/* Modal Container */}
      <div className="w-full max-w-lg rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-orange-500/50 bg-[#0d0d0d] shadow-2xl shadow-orange-500/20 relative overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent" />

        {/* Scrollable Body Container */}
        <div className="overflow-y-auto pr-0.5 space-y-3 sm:space-y-4 flex-1">
          {/* Category Header Badge */}
          <div className="flex items-center justify-between pt-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] sm:text-[12px] font-black tracking-widest uppercase font-mono-code border bg-orange-500/15 text-orange-400 border-orange-500/40">
              <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
              <span>EVENTO // QUILOMBO</span>
            </div>
          </div>

          {/* Event Title */}
          <h3 className="text-xl sm:text-2xl font-black tracking-tight uppercase font-display text-orange-400 leading-tight">
            {event.title}
          </h3>

          {/* Context Narrative */}
          <p className="text-xs sm:text-sm text-white/85 leading-relaxed font-normal">
            {event.description}
          </p>

          {/* Instructions / Info Box */}
          <div className="bg-white/[0.03] border border-orange-500/30 rounded-xl p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/15 text-orange-300 flex-shrink-0">
              <Dices className="w-4 h-4" />
            </div>
            <div className="text-[12px] sm:text-xs text-white/80 leading-snug">
              Elegí una respuesta para resolver el quilombo. El resultado sumará o restará puntos en el puntaje final del equipo.
            </div>
          </div>

          {/* Decision Options Buttons */}
          <div className="flex flex-col gap-2.5 pt-1">
            <button
              onClick={() => handleSelect('A')}
              className="w-full py-3 sm:py-3.5 px-3.5 rounded-xl bg-white/[0.06] hover:bg-orange-500/10 border border-white/15 hover:border-orange-500/60 text-white font-bold font-display uppercase tracking-wider text-xs sm:text-sm flex items-center justify-between transition-all active:scale-[0.98] shadow-md group text-left"
            >
              <span className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-md bg-white/[0.1] group-hover:bg-orange-500 group-hover:text-black flex items-center justify-center text-xs font-mono-code font-black text-white transition-colors flex-shrink-0 mt-0.5">
                  A
                </span>
                <span className="font-semibold leading-snug">{event.optionA}</span>
              </span>
              <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-orange-400 group-hover:translate-x-1 transition-transform flex-shrink-0 ml-2" />
            </button>

            <button
              onClick={() => handleSelect('B')}
              className="w-full py-3 sm:py-3.5 px-3.5 rounded-xl bg-white/[0.06] hover:bg-orange-500/10 border border-white/15 hover:border-orange-500/60 text-white font-bold font-display uppercase tracking-wider text-xs sm:text-sm flex items-center justify-between transition-all active:scale-[0.98] shadow-md group text-left"
            >
              <span className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-md bg-white/[0.1] group-hover:bg-orange-500 group-hover:text-black flex items-center justify-center text-xs font-mono-code font-black text-white transition-colors flex-shrink-0 mt-0.5">
                  B
                </span>
                <span className="font-semibold leading-snug">{event.optionB}</span>
              </span>
              <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-orange-400 group-hover:translate-x-1 transition-transform flex-shrink-0 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


