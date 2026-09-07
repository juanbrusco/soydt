import React from 'react';
import { Info, X, ShieldCheck, HeartHandshake } from 'lucide-react';
import { sound } from '../utils/audio';

interface InfoDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoDisclaimerModal: React.FC<InfoDisclaimerModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleClose = () => {
    sound.playClick();
    onClose();
  };

  return (
    <div
      id="info-disclaimer-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none"
      onClick={handleClose}
    >
      <div
        id="info-disclaimer-card"
        className="w-full max-w-md sm:max-w-lg rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-sky-500/30 bg-[#0d1017] shadow-2xl relative overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top ambient highlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-[#38BDF8] to-transparent shadow-[0_0_12px_rgba(56,189,248,0.5)]" />

        {/* Header with Close Button */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] sm:text-[12px] font-black tracking-widest uppercase font-mono-code border bg-sky-500/10 text-[#38BDF8] border-sky-500/30">
            <Info className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>INFORMACIÓN DEL JUEGO</span>
          </div>

          <button
            id="close-info-disclaimer-btn"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-4 space-y-3.5 text-left">
          <h3 className="text-lg sm:text-xl font-black font-display text-white tracking-tight uppercase">
            Puntajes y Valoraciones
          </h3>

          {/* Section 1: FC26 */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10">
            <div className="p-2 rounded-lg bg-sky-500/15 text-[#38BDF8] shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-xs sm:text-sm text-white/85 leading-relaxed font-sans font-medium">
              <span className="text-white font-bold">Fútbol Internacional:</span> Los puntajes de los jugadores profesionales están basados en los valores y estadísticas oficiales proporcionados por el videojuego <span className="text-sky-300 font-bold">EA SPORTS FC 26</span>.
            </div>
          </div>

          {/* Section 2: Liga de Salto */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div className="text-xs sm:text-sm text-white/85 leading-relaxed font-sans font-medium">
              <span className="text-amber-300 font-bold">Liga de Salto:</span> Los valores asignados a los jugadores y personajes de la liga local son <span className="text-white font-bold">totalmente ficticios y recreativos</span>. Fueron creados con fines de entretenimiento, humor y cariño comunitario, sin intención de realizar juicios deportivos reales ni ofender a ninguna persona o institución.
            </div>
          </div>

          <p className="text-[12px] sm:text-xs text-white/50 font-mono-code text-center pt-1">
            ¡Gracias por jugar y apoyar el fútbol con buena onda! ⚽
          </p>
        </div>

        {/* Bottom Action Button */}
        <div className="mt-5 pt-3 border-t border-white/10">
          <button
            id="confirm-info-disclaimer-btn"
            onClick={handleClose}
            className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-[#38BDF8] hover:bg-[#0284C7] text-black font-display font-black text-xs sm:text-sm uppercase tracking-wider transition-all active:scale-[0.99] shadow-lg cursor-pointer flex items-center justify-center gap-2"
          >
            <span>ENTENDIDO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
