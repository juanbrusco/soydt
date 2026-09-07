import React from 'react';
import { Formation, Player } from '../types/game';

interface MiniPitchProps {
  formation: Formation;
  currentSlotIndex: number;
  selectedPlayers: (Player | null)[];
}

export const MiniPitch: React.FC<MiniPitchProps> = ({
  formation,
  currentSlotIndex,
  selectedPlayers,
}) => {
  const totalSlots = formation.slots.length;

  return (
    <div className="w-full max-w-xl mx-auto bg-[#0a0a0a] border border-white/10 rounded-2xl p-2.5 sm:p-3.5 relative overflow-hidden shadow-xl">
      {/* Tactical Field Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-15">
        {/* Field Outer Border */}
        <div className="absolute inset-2 border border-white/40 rounded-xl" />
        {/* Center Line & Circle */}
        <div className="absolute top-1/2 left-2 right-2 border-t border-white/40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-white/40" />
        {/* Penalty Areas */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-12 border-b border-x border-white/40 rounded-b" />
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-12 border-t border-x border-white/40 rounded-t" />
      </div>

      {/* Formation Title & Progress in Bold Typography Style */}
      <div className="flex items-center justify-between mb-2 relative z-10 px-1">
        <div className="flex items-center gap-2">
          <p className="text-[11px] tracking-[0.25em] uppercase font-bold text-[#38BDF8]">
            ESQUEMA
          </p>
          <span className="text-xs font-black tracking-tight text-white uppercase font-display">
            {formation.name}
          </span>
        </div>
        <div className="flex items-baseline gap-1 font-mono-code text-xs">
          <span className="text-[10px] uppercase tracking-wider text-white/50">PROGRESO:</span>
          <strong className="text-white font-bold">{Math.min(currentSlotIndex, totalSlots)}</strong>
          <span className="text-white/40">/{totalSlots}</span>
        </div>
      </div>

      {/* Slots Pitch Layout */}
      <div className="relative w-full h-44 sm:h-48 z-10">
        {formation.slots.map((slot, idx) => {
          const isCompleted = idx < currentSlotIndex && !!selectedPlayers[idx];
          const isActive = idx === currentSlotIndex;
          const player = selectedPlayers[idx];

          return (
            <div
              key={slot.id}
              style={{
                left: `${slot.gridX}%`,
                top: `${slot.gridY}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute flex flex-col items-center group transition-all duration-300"
            >
              {/* Slot Node / Pin */}
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-[11px] sm:text-xs font-bold transition-all shadow-md ${
                  isCompleted
                    ? 'bg-[#38BDF8] text-black font-black border border-white scale-100'
                    : isActive
                    ? 'bg-white text-black font-black border-2 border-[#38BDF8] scale-110 glow-active'
                    : 'bg-white/[0.05] text-white/40 border border-white/10'
                }`}
              >
                {isCompleted ? (
                  <span className="text-[11px] font-mono-code font-black">{player?.ovr}</span>
                ) : (
                  <span className="font-mono-code">{slot.position}</span>
                )}
              </div>

              {/* Player Name / Position Label Underneath */}
              <div className="mt-0.5 max-w-[70px] truncate text-center">
                {isCompleted && player ? (
                  <span className="text-[10px] sm:text-[11px] text-white/90 font-bold uppercase truncate block leading-tight font-display">
                    {player.name.split(' ').pop()}
                  </span>
                ) : (
                  <span
                    className={`text-[9px] sm:text-[10px] font-mono-code block leading-tight uppercase tracking-wider ${
                      isActive ? 'text-[#38BDF8] font-bold' : 'text-white/40'
                    }`}
                  >
                    {slot.label}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


