import React, { useEffect, useState } from 'react';
import { Player, Position } from '../types/game';
import { RefreshCw, Check, Flame, Shield, HeartHandshake, ShieldCheck } from 'lucide-react';
import { sound } from '../utils/audio';

interface PlayerCardProps {
  player: Player | null;
  position: Position;
  positionLabel: string;
  changesRemaining: number;
  totalChangesAllowed: number;
  isRolling: boolean;
  onCambiar: () => void;
  onSeleccionar: () => void;
  disabled?: boolean;
  currentMode: string;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  position,
  positionLabel,
  changesRemaining,
  totalChangesAllowed,
  isRolling,
  onCambiar,
  onSeleccionar,
  disabled = false,
  currentMode
}) => {
  const [scrambledName, setScrambledName] = useState<string>('');
  const [showSpecialOverlay, setShowSpecialOverlay] = useState(false);

  useEffect(() => {
    if (!player?.special) return;
    setShowSpecialOverlay(true);
    sound.playGoalRoar();
    const t = setTimeout(() => setShowSpecialOverlay(false), 2800);
    return () => clearTimeout(t);
  }, [player?.id]);

  // Scramble text effect on player appearance / reroll
  useEffect(() => {
    if (!player) return;

    if (isRolling) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let iter = 0;
      const interval = setInterval(() => {
        setScrambledName(
          player.name
            .split('')
            .map((char, index) => {
              if (char === ' ') return ' ';
              if (index < iter) return player.name[index];
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('')
        );
        sound.playShuffleBlip();
        iter += 1 / 2;
        if (iter >= player.name.length) {
          clearInterval(interval);
          setScrambledName(player.name);
        }
      }, 35);

      return () => clearInterval(interval);
    } else {
      setScrambledName(player.name);
    }
  }, [player?.id, player?.name, isRolling]);

  if (showSpecialOverlay && player) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 cursor-pointer"
        onClick={() => setShowSpecialOverlay(false)}
      >
        {/* scanlines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.18) 3px, rgba(0,0,0,0.18) 4px)',
          }}
        />
        <div
          className="relative flex flex-col items-center gap-5 px-10 py-8 animate-fadeIn"
          style={{
            border: '4px solid #f59e0b',
            boxShadow: '0 0 0 2px #000, 0 0 0 4px #f59e0b, 0 0 60px rgba(245,158,11,0.35)',
            background: '#000',
          }}
        >
          <span className="text-6xl animate-bounce">⚽</span>

          <p
            className="font-mono-code font-black text-amber-400 text-xs tracking-[0.35em] uppercase text-center"
            style={{ textShadow: '0 0 10px rgba(245,158,11,0.8)' }}
          >
            ★ LEYENDA ★
          </p>

          <div className="w-full h-[2px] bg-amber-400/50" />

          <p className="font-mono-code font-black text-white text-2xl uppercase tracking-wider text-center leading-tight">
            {player.name}
          </p>

          <p
            className="font-mono-code font-black text-amber-400 text-5xl"
            style={{ textShadow: '0 0 20px rgba(245,158,11,0.7)' }}
          >
            {player.ovr}
          </p>

          <div className="w-full h-[2px] bg-amber-400/50" />

          <p className="font-mono-code text-white/30 text-[11px] uppercase tracking-[0.3em] animate-pulse">
            TOCA PARA CONTINUAR
          </p>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="w-full max-w-md mx-auto h-80 flex flex-col items-center justify-center bg-[#0d0d0d] rounded-2xl border border-white/10 p-8 text-center animate-pulse">
        <p className="text-[11px] tracking-[0.3em] uppercase font-bold text-[#38BDF8] mb-2">BUSCANDO CANDIDATO</p>
        <span className="text-xl font-bold font-display text-white/50">GENERANDO RNG...</span>
      </div>
    );
  }

  // OVR Visual Tier Logic
  const isGalactico = player.ovr >= 90;
  const isElite = player.ovr >= 85 && player.ovr < 90;
  const isSolido = player.ovr >= 80 && player.ovr < 85;

  let cardBorder = 'border-white/10';
  let ovrColor = 'text-white';

  if (isGalactico) {
    cardBorder = 'border-amber-500/50 shadow-2xl shadow-amber-500/10';
    ovrColor = 'text-amber-400';
  } else if (isElite) {
    cardBorder = 'border-[#38BDF8]/40 shadow-xl shadow-[#38BDF8]/10';
    ovrColor = 'text-[#38BDF8]';
  } else if (isSolido) {
    cardBorder = 'border-emerald-500/30';
    ovrColor = 'text-emerald-400';
  }

  const isEventGenerated = player.source === 'EVENT';

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center">
      {/* Main Candidate Card with Bold Typography Style */}
      <div
        className={`w-full relative rounded-2xl p-4 sm:p-5 border bg-[#0a0a0a] transition-all duration-300 shadow-2xl ${cardBorder}`}
      >
        {/* Subtle Watermark Typography */}
        <div className="absolute top-1 right-3 text-5xl sm:text-6xl font-black text-white/[0.03] leading-none pointer-events-none select-none font-display">
          {position}
        </div>

        {/* Compact Horizontal Layout: Score on the Left, Player Info on the Right */}
        <div className="flex items-center gap-4 sm:gap-6 relative z-10">
          {/* Left Column: Big OVR Typography */}
          <div className="flex flex-col items-center justify-center min-w-[76px] sm:min-w-[90px] border-r border-white/10 pr-3 sm:pr-5">
            <span className={`text-5xl sm:text-6xl font-black tracking-tighter font-display leading-none ${ovrColor}`}>
              {player.ovr}
            </span>
          </div>

          {/* Right Column: Name, Position, Club, Flag / Country */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            {/* Position badge */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2.5 py-0.5 rounded bg-[#38BDF8]/15 border border-[#38BDF8]/40 text-[#38BDF8] text-xs font-black font-mono-code tracking-wider">
                {position}
              </span>
            </div>

            {/* Player Name */}
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-display uppercase truncate leading-tight mt-0.5">
              {scrambledName || player.name}
            </h2>

            {/* Club & Country Details */}
            <div className="flex items-center gap-2 mt-1 text-xs text-white/70 font-semibold truncate">
              {player.club && <span className="truncate">{player.club}</span>}
              {player.country && (
                <span className="text-base leading-none" title={player.nationality || ''}>
                  {player.country}
                </span>
              )}
              {!player.country && player.nationality && (
                <span className="text-white/40">({player.nationality})</span>
              )}
            </div>
          </div>
        </div>

        {/* Changes Remaining Counter (Compact) */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/10 relative z-10">
          <span className="text-[11px] uppercase tracking-[0.15em] font-bold font-mono-code text-white/50">
            CAMBIOS DISPONIBLES:
          </span>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalChangesAllowed }).map((_, i) => {
              const isAvailable = i < changesRemaining;
              return (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-md flex items-center justify-center text-xs transition-all ${isAvailable
                    ? 'bg-[#38BDF8]/20 border border-[#38BDF8] text-[#38BDF8]'
                    : 'bg-white/[0.02] border border-white/10 text-white/20'
                    }`}
                  title={isAvailable ? 'Cambio disponible' : 'Cambio agotado'}
                >
                  <RefreshCw className={`w-3 h-3 ${isAvailable ? 'stroke-[2.5]' : 'stroke-1'}`} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Buttons: [ 🔄 CAMBIAR ] and [ ✓ SELECCIONAR ] */}
      <div className="w-full grid grid-cols-2 gap-2.5 sm:gap-3 mt-3 sm:mt-4">
        <button
          onClick={onCambiar}
          disabled={disabled || changesRemaining <= 0 || isRolling}
          className={`py-3 sm:py-4 px-3 sm:px-4 rounded-xl font-bold font-display uppercase tracking-wider flex items-center justify-center gap-2 text-xs sm:text-base transition-all active:scale-95 shadow-lg ${changesRemaining > 0 && !disabled && !isRolling
            ? 'bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/20 hover:border-white/40 shadow-black'
            : 'bg-white/[0.02] text-white/30 border border-white/5 cursor-not-allowed'
            }`}
        >
          <RefreshCw className={`w-4 h-4 ${isRolling ? 'animate-spin text-[#38BDF8]' : 'text-white/70'}`} />
          <span>CAMBIAR ({changesRemaining})</span>
        </button>

        <button
          onClick={onSeleccionar}
          disabled={disabled || isRolling}
          className={`py-3 sm:py-4 px-3 sm:px-4 rounded-xl font-black font-display uppercase tracking-wider flex items-center justify-center gap-2 text-xs sm:text-base transition-all active:scale-95 shadow-lg ${!disabled && !isRolling
            ? 'bg-[#38BDF8] hover:bg-[#7dd3fc] text-black shadow-[#38BDF8]/20 hover:shadow-[#38BDF8]/40'
            : 'bg-white/[0.05] text-white/30 border border-white/5 cursor-not-allowed'
            }`}
        >
          <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
          <span>SELECCIONAR</span>
        </button>
      </div>

      <br></br>
      {currentMode == 'FUTBOL11_SALTO' && (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <div className="text-xs sm:text-sm text-white/85 leading-relaxed font-sans font-medium">
            <span className="text-amber-300 font-bold">Liga de Salto:</span> Los valores asignados a los jugadores y personajes de la liga local son <span className="text-white font-bold">totalmente ficticios y recreativos</span>. Fueron creados con fines de entretenimiento, humor y cariño comunitario, sin intención de realizar juicios deportivos reales ni ofender a ninguna persona o institución.
          </div>
        </div>
      )}

      {currentMode == 'FUTBOL11' && (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10">
          <div className="p-2 rounded-lg bg-sky-500/15 text-[#38BDF8] shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-xs sm:text-sm text-white/85 leading-relaxed font-sans font-medium">
            <span className="text-white font-bold">Fútbol Internacional:</span> Los puntajes de los jugadores profesionales se basan en las estadísticas oficiales del videojuego EA SPORTS FC 26.
          </div>
        </div>
      )}

    </div>
  );
};


