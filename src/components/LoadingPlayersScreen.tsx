import React, { useEffect, useState } from 'react';
import { Database, Sparkles, RefreshCw, Zap } from 'lucide-react';

interface LoadingPlayersScreenProps {
  onSkip?: () => void;
  statusText?: string;
  isSlowConnection?: boolean;
}

const LOADING_MESSAGES = [
  'Conectando con la base de datos...',
  'Sincronizando cartas y valoraciones...',
  'Cargando plantillas de Fútbol 11 y Salto...',
  'Alineando estadísticas de los jugadores...',
];

export const LoadingPlayersScreen: React.FC<LoadingPlayersScreenProps> = ({
  onSkip,
  statusText,
  isSlowConnection = false,
}) => {
  const [messageIndex, setMessageIndex] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      id="loading-players-screen"
      className="fixed inset-0 z-50 bg-[#050505] flex flex-col items-center justify-center p-6 text-white overflow-hidden select-none"
    >
      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#38BDF8]/10 blur-[130px] rounded-full" />
        <div className="crt-scanlines absolute inset-0 opacity-20" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full animate-fadeIn">
        {/* Animated Soccer Ball & Database Badge */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-[#38BDF8]/20 to-[#38BDF8]/5 border border-[#38BDF8]/40 flex items-center justify-center shadow-[0_0_35px_rgba(56,189,248,0.25)] relative">
            <span className="text-3xl animate-bounce">⚽</span>
            <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-lg bg-black border border-[#38BDF8]/60 flex items-center justify-center text-[#38BDF8] shadow-md">
              <Database className="w-3.5 h-3.5 animate-pulse" />
            </div>
          </div>
          {/* Subtle spinning ring around */}
          <div className="absolute -inset-2 rounded-3xl border border-[#38BDF8]/20 border-t-[#38BDF8] animate-spin pointer-events-none" />
        </div>

        {/* Title */}
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-4 h-4 text-[#38BDF8]" />
          <h2 className="text-xl font-black tracking-wider uppercase font-display bg-gradient-to-r from-white via-slate-200 to-sky-400 bg-clip-text text-transparent">
            Cargando Jugadores
          </h2>
          <Sparkles className="w-4 h-4 text-[#38BDF8]" />
        </div>

        {/* App identity subtitle */}
        <p className="text-[12px] font-mono-code tracking-[0.25em] text-[#38BDF8]/80 uppercase mb-5">
          SOY DT • BASE DE DATOS
        </p>

        {/* Rotating Status Message */}
        <div className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 mb-4 backdrop-blur-sm min-h-[52px] flex items-center justify-center">
          <div className="flex items-center gap-2.5 text-xs text-white/80 font-mono-code">
            <RefreshCw className="w-3.5 h-3.5 text-[#38BDF8] animate-spin shrink-0" />
            <span className="tracking-wide transition-opacity duration-300">
              {statusText || LOADING_MESSAGES[messageIndex]}
            </span>
          </div>
        </div>

        {/* Slow connection warning or tip */}
        {isSlowConnection && (
          <div className="mb-4 text-[12px] font-mono-code text-amber-400/90 bg-amber-950/40 border border-amber-500/30 rounded-lg px-3 py-2 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span>Demora de red detectada. Conectando con servidor...</span>
          </div>
        )}

        {/* Skip button for poor network */}
        {onSkip && (
          <button
            id="skip-loading-players-btn"
            onClick={onSkip}
            className="mt-2 text-[12px] font-mono-code uppercase tracking-widest text-white/50 hover:text-white hover:border-white/30 px-3.5 py-1.5 rounded-lg border border-white/10 transition-all bg-white/[0.02]"
          >
            Continuar con plantilla local →
          </button>
        )}
      </div>
    </div>
  );
};
