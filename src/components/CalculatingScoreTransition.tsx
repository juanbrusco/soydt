import React, { useEffect, useState } from 'react';
import { Sparkles, Trophy } from 'lucide-react';
import { sound } from '../utils/audio';
import { GameMode } from '../types/game';

interface CalculatingScoreTransitionProps {
  onComplete: () => void;
  durationMs?: number;
  mode?: GameMode;
}

const INTRIGUE_MESSAGES_SALTO = [
  'Sumando química y valoraciones...',
  'Procesando eventos y quilombos...',
  'Verificando el VAR en el Dickinson...',
  'Compilando el puntaje definitivo...',
];

const INTRIGUE_MESSAGES_GLOBAL = [
  'Sumando química y valoraciones...',
  'Procesando eventos y quilombos...',
  'Chequeando la jugada en el VAR...',
  'Compilando el puntaje definitivo...',
];

export const CalculatingScoreTransition: React.FC<CalculatingScoreTransitionProps> = ({
  onComplete,
  durationMs = 2600,
  mode = 'FUTBOL11_SALTO',
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [messageIndex, setMessageIndex] = useState<number>(0);

  const isSalto = mode === 'FUTBOL11_SALTO';
  const messages = isSalto ? INTRIGUE_MESSAGES_SALTO : INTRIGUE_MESSAGES_GLOBAL;

  useEffect(() => {
    // Tick sound cadence for tension
    const tickInterval = setInterval(() => {
      sound.playTick();
    }, 450);

    // Message rotation for mystery
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 650);

    // Smooth progress bar update
    const startTime = performance.now();
    let animationFrameId: number;

    const updateProgress = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const currentPct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setProgress(currentPct);

      if (elapsed < durationMs) {
        animationFrameId = requestAnimationFrame(updateProgress);
      } else {
        clearInterval(tickInterval);
        clearInterval(messageInterval);
        onComplete();
      }
    };

    animationFrameId = requestAnimationFrame(updateProgress);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(tickInterval);
      clearInterval(messageInterval);
    };
  }, [durationMs, onComplete, messages.length]);

  return (
    <div
      id="calculating-score-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-lg select-none animate-fadeIn"
    >
      <div
        id="calculating-score-card"
        className={`w-full max-w-md rounded-3xl p-6 sm:p-8 border ${
          isSalto ? 'border-amber-500/40' : 'border-[#38BDF8]/40'
        } bg-[#0c0f14] shadow-2xl relative overflow-hidden flex flex-col items-center text-center space-y-6`}
      >
        {/* Glow ambient lines */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-1.5 bg-gradient-to-r from-transparent ${
            isSalto ? 'via-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.8)]' : 'via-[#38BDF8] shadow-[0_0_20px_rgba(56,189,248,0.8)]'
          } to-transparent`}
        />
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-56 h-56 ${
            isSalto ? 'bg-amber-500/10' : 'bg-[#38BDF8]/10'
          } rounded-full blur-3xl pointer-events-none`}
        />

        {/* Top Badge */}
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${
            isSalto
              ? 'bg-amber-400/10 border-amber-400/30 text-amber-400'
              : 'bg-[#38BDF8]/10 border-[#38BDF8]/30 text-[#38BDF8]'
          } border text-[11px] font-mono-code font-black uppercase tracking-widest`}
        >
          <Sparkles className={`w-3 h-3 ${isSalto ? 'text-amber-400' : 'text-[#38BDF8]'} animate-spin`} />
          <span>{isSalto ? 'FÚTBOL 11 SALTO // FINAL' : 'FÚTBOL 11 // FINAL'}</span>
        </div>

        {/* Animated Soccer Ball / Icon */}
        <div className="relative my-2">
          <div
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br ${
              isSalto
                ? 'from-amber-400/20 to-emerald-500/10 border-amber-400/50 shadow-[0_0_30px_rgba(251,191,36,0.25)]'
                : 'from-[#38BDF8]/20 to-emerald-500/10 border-[#38BDF8]/50 shadow-[0_0_30px_rgba(56,189,248,0.25)]'
            } border-2 flex items-center justify-center relative`}
          >
            <span className="text-4xl sm:text-5xl animate-bounce leading-none">⚽</span>
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-2 bg-black/60 rounded-full blur-sm" />
        </div>

        {/* Main Title of Intrigue */}
        <div className="space-y-2">
          <h2
            id="calculating-score-title"
            className="text-xl sm:text-2xl font-black font-display text-white tracking-tight uppercase leading-tight"
          >
            Calculando los puntos del equipo
          </h2>
          <p
            id="calculating-score-subtitle"
            className={`text-xs sm:text-sm ${
              isSalto ? 'text-amber-300/90' : 'text-[#38BDF8]/90'
            } font-mono-code h-5 flex items-center justify-center transition-all duration-300`}
          >
            {messages[messageIndex]}
          </p>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="w-full space-y-2 pt-2">
          <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/15">
            <div
              id="calculating-score-progress-bar"
              className={`h-full rounded-full bg-gradient-to-r ${
                isSalto
                  ? 'from-amber-400 via-amber-300 to-emerald-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                  : 'from-[#38BDF8] via-sky-300 to-emerald-400 shadow-[0_0_12px_rgba(56,189,248,0.6)]'
              } transition-all duration-75`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono-code text-white/50 px-1 font-bold">
            <span>PROCESANDO FORMACIÓN</span>
            <span className={isSalto ? 'text-amber-400' : 'text-[#38BDF8]'}>{progress}%</span>
          </div>
        </div>

        {/* Subtle footer tip */}
        <div className="inline-flex items-center gap-1 text-[11px] font-mono-code text-white/40 pt-1">
          <Trophy className={`w-3 h-3 ${isSalto ? 'text-amber-400/60' : 'text-[#38BDF8]/60'}`} />
          <span>Determinando ranking y récord</span>
        </div>
      </div>
    </div>
  );
};
