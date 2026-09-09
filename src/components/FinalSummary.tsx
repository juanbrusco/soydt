import React, { useState, useEffect } from 'react';
import { Formation, ModeRecord, Player, RankingTier } from '../types/game';
import { Trophy, Share2, Check, RotateCcw, Flame, X, ExternalLink, Sparkles, Crown, Home } from 'lucide-react';
import { sound } from '../utils/audio';

interface FinalSummaryProps {
  score: number;
  rankingTier: RankingTier;
  selectedPlayers: (Player | null)[];
  formation: Formation;
  runCode?: string;
  isNewRecord: boolean;
  bestRecord?: ModeRecord | null;
  onRestart?: () => void;
  onNewRun?: () => void;
  onGoHome?: () => void;
  eventsDisabled?: boolean;
  eventScoreModifier?: number;
  initialPlayerName?: string;
  onSavePlayerName?: (name: string) => Promise<boolean>;
  isNeonConnected?: boolean;
  friendRoomResult?: {
    roomCode: string;
    roomName: string;
    rank: number;
    totalPlayers: number;
  } | null;
  onOpenFriendRoom?: (roomCode: string) => void;
}

export const FinalSummary: React.FC<FinalSummaryProps> = ({
  score,
  rankingTier,
  selectedPlayers,
  formation,
  runCode,
  isNewRecord,
  onRestart,
  onNewRun,
  onGoHome,
  eventsDisabled,
  eventScoreModifier,
  initialPlayerName = 'DT',
  onSavePlayerName,
  isNeonConnected = true,
  friendRoomResult,
  onOpenFriendRoom,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const dtName = initialPlayerName;
  const totalSlots = formation.slots.length;

  // Maximum DT tier check ("DT LEYENDA MUNDIAL" or Salto legend/champion)
  const isMaxTier =
    rankingTier.title === 'DT LEYENDA MUNDIAL' ||
    rankingTier.title === 'DT LEYENDA DE LA LIGA DE SALTO' ||
    rankingTier.title === 'DT CAMPEÓN DE LA LIGA DE SALTO';

  useEffect(() => {
    sound.playWhistle();
    // Auto-save name to DB to link it to this run
    const cleanName = initialPlayerName.trim().toUpperCase();
    if (cleanName && cleanName !== 'DT' && onSavePlayerName) {
      onSavePlayerName(cleanName).catch(() => {});
    }
    if (isMaxTier) {
      const timer = setTimeout(() => { sound.playVictoryFanfare(); }, 1400);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRestart = () => {
    sound.playClick();
    if (onRestart) onRestart();
    if (onNewRun) onNewRun();
  };

  // Formation short code (e.g., 4-3-3 or 1-2-1)
  const formationCode =
    formation.name.includes('4-3-3') || formation.id.includes('433') || totalSlots === 11
      ? '4-3-3'
      : '1-2-1';

  const appUrl = typeof window !== 'undefined' ? window.location.origin || window.location.href : 'https://soydt-salto.vercel.app/';

  const generateShareText = () => {
    const playerLines = formation.slots
      .map((slot, idx) => {
        const p = selectedPlayers[idx];
        return p ? `• ${slot.position}: ${p.name} (${p.ovr})` : '';
      })
      .filter(Boolean)
      .join('\n');

    const eventsNote = eventsDisabled ? '\n⚠️ (Partida jugada sin QUILOMBOS)' : '';
    const dtLabel = dtName.trim() ? `\n🧢 DT: ${dtName.trim().toUpperCase()}` : '';
    return `🏆 ¡Armé mi equipo en SoyDT!${dtLabel}\n⚽ FORMACIÓN: ${formationCode}\n⭐ TOTAL: ${score} PTS\n🎖️ RANGO: ${rankingTier.title} ${rankingTier.badge}${eventsNote}\n\n📋 MI EQUIPO:\n${playerLines}\n\n👉 Jugá y armá tu formación acá: ${appUrl}`;
  };

  const handleShareClick = async () => {
    sound.playClick();
    setShowShareModal(true);

    const shareData = {
      title: 'SoyDT - Mi Equipo Final',
      text: generateShareText(),
      url: appUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or share dismissed
      }
    }
  };

  const handleCopyShareContent = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText());
      setCopiedLink(true);
      sound.playClick();
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center relative">
      {/* Confetti & Glow particles animation for Max Tier */}
      {isMaxTier && (
        <div className="absolute -inset-4 sm:-inset-8 pointer-events-none z-20 overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-amber-400/5 blur-3xl animate-pulse rounded-full" />
          {/* Subtle floating golden stars */}
          <div className="absolute top-2 left-6 text-amber-300 text-2xl animate-bounce delay-100">✨</div>
          <div className="absolute top-8 right-8 text-yellow-300 text-3xl animate-bounce delay-300">⭐</div>
          <div className="absolute bottom-20 left-10 text-amber-400 text-xl animate-pulse">🌟</div>
          <div className="absolute top-1/3 right-4 text-amber-200 text-2xl animate-bounce delay-200">✨</div>
        </div>
      )}

      {/* Hero Summary Card */}
      <div
        className={`w-full rounded-2xl p-6 sm:p-10 border bg-[#0a0a0a] text-center relative overflow-hidden shadow-2xl mb-6 transition-all duration-500 ${
          isMaxTier
            ? 'border-amber-400/60 shadow-[0_0_50px_rgba(251,191,36,0.25)] ring-1 ring-amber-400/40'
            : 'border-white/10'
        }`}
      >
        {/* Subtle Watermark Typography */}
        <div className="absolute top-1 right-2 text-9xl font-black text-white/[0.02] leading-none pointer-events-none select-none font-display">
          DT
        </div>

        {/* Max Tier Special Celebration Pill */}
        {isMaxTier && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-black text-[12px] uppercase tracking-widest mb-4 shadow-lg animate-pulse">
            <Crown className="w-4 h-4 fill-black" />
            <span>¡MÁXIMA GLORIA ALCANZADA!</span>
            <Sparkles className="w-4 h-4" />
          </div>
        )}

        {/* New Record Banner */}
        {isNewRecord && !isMaxTier && (
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-400 text-black font-black text-xs uppercase tracking-widest mb-5 shadow-lg">
            <Trophy className="w-4 h-4" />
            <span>¡NUEVO RÉCORD DE MODO!</span>
          </div>
        )}

        <div className={`text-4xl sm:text-5xl mb-3 ${isMaxTier ? 'animate-bounce' : ''}`}>
          {rankingTier.badge}
        </div>

        <p className="text-[11px] tracking-[0.3em] uppercase font-bold text-[#38BDF8] mb-1">
          EVALUACIÓN TÁCTICA FINAL
        </p>

        <h2
          className={`text-3xl sm:text-4xl font-black tracking-tighter uppercase font-display mb-2 ${
            isMaxTier
              ? 'text-amber-300 drop-shadow-[0_2px_12px_rgba(251,191,36,0.5)]'
              : 'text-white'
          }`}
        >
          {rankingTier.title}
        </h2>
        <p className=" text-white/70 max-w-md mx-auto mb-8 font-medium">
          “{rankingTier.comment}”
        </p>

        {/* Hero Score & FORMACIÓN Display */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 border-t border-white/10 pt-6 max-w-md mx-auto">
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#38BDF8] font-bold">SCORE TOTAL</p>
            <div className="flex items-baseline justify-center gap-1">
              <span
                className={`text-4xl sm:text-6xl font-black tracking-tighter font-display ${
                  isMaxTier ? 'text-amber-300' : 'text-white'
                }`}
              >
                {score}
              </span>
              <span className="text-xs text-white/40 font-mono-code">PTS</span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#38BDF8] font-bold">FORMACIÓN</p>
            <div className="flex items-baseline justify-center">
              <span className="text-4xl sm:text-6xl font-black tracking-tight text-white font-display font-mono-code">
                {formationCode}
              </span>
            </div>
          </div>

          {/* Quilombo Modifier if events affected final score */}
          {eventScoreModifier !== undefined && eventScoreModifier !== 0 && (
            <div className="col-span-2 flex items-center justify-center gap-1.5 pt-1 text-xs font-mono-code">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-white/60 uppercase text-[12px]">Efecto Quilombos:</span>
              <span className={`font-bold ${eventScoreModifier > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {eventScoreModifier > 0 ? `+${eventScoreModifier}` : eventScoreModifier} PTS
              </span>
            </div>
          )}
        </div>

        {/* Torneo de Amigos: Resultado en la Sala */}
        {friendRoomResult && (
          <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-black to-[#38BDF8]/10 border border-emerald-500/30 text-center space-y-3 max-w-md mx-auto shadow-lg">
            <div className="flex items-center justify-center gap-2 text-[12px] font-mono-code font-bold uppercase text-emerald-400">
              <Trophy className="w-4 h-4" />
              <span>SALA: {friendRoomResult.roomName}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 py-1.5 px-2 bg-black/60 rounded-xl border border-white/5">
              <div>
                <span className="text-[11px] font-mono-code text-white/40 uppercase block mb-0.5">POSICIÓN</span>
                <span className="text-xl sm:text-2xl font-display font-black text-amber-300">
                  #{friendRoomResult.rank} <span className="text-[11px] font-mono-code text-white/40 font-normal">/ {friendRoomResult.totalPlayers}</span>
                </span>
              </div>
              <div className="border-x border-white/10 px-1">
                <span className="text-[11px] font-mono-code text-white/40 uppercase block mb-0.5">NOMBRE</span>
                <span className="text-sm sm:text-base font-display font-black uppercase text-white truncate block">
                  {dtName}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-mono-code text-white/40 uppercase block mb-0.5">PUNTAJE</span>
                <span className="text-xl sm:text-2xl font-mono-code font-black text-[#38BDF8]">
                  {score}
                </span>
              </div>
            </div>

            {onOpenFriendRoom && (
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenFriendRoom(friendRoomResult.roomCode);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-display font-black uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <span>VER TABLA DE POSICIONES DEL GRUPO</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Informative notice if played with Quilombo events disabled */}
        {eventsDisabled && (
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-white/70 font-mono-code text-[12px] uppercase tracking-wider bg-orange-500/5 py-2.5 px-3.5 rounded-xl border border-orange-500/20 max-w-md mx-auto">
            <div className="relative flex items-center justify-center flex-shrink-0">
              <Flame className="w-3.5 h-3.5 text-orange-400/60" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-4 h-[1.5px] bg-rose-500 rotate-45 rounded-full" />
              </div>
            </div>
            <span className="text-orange-200/90 font-bold">
              Partida jugada sin QUILOMBOS
            </span>
          </div>
        )}
      </div>

      {/* Complete Formation Table */}
      <div className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl mb-6">
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <p className="text-[11px] tracking-[0.25em] uppercase font-bold text-[#38BDF8]">
              PLANTEL TITULAR
            </p>
            <div className="h-3 w-[1px] bg-white/20"></div>
            <h3 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider font-display font-mono-code">
              {formationCode}
            </h3>
          </div>
          <span className="text-[11px] font-mono-code uppercase tracking-wider text-white/40">
            {totalSlots} TITULARES
          </span>
        </div>

        {/* Squad List */}
        <div className="space-y-1.5">
          {formation.slots.map((slot, idx) => {
            const player = selectedPlayers[idx];
            if (!player) return null;

            const isHigh = player.ovr >= 90;
            const isMid = player.ovr >= 85 && player.ovr < 90;
            const flag = player.country || '';

            return (
              <div
                key={slot.id}
                className="flex items-center justify-between p-0.5 sm:p-1 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
              >
                {/* Left: Position & Name */}
                <div className="flex items-center gap-3">
                  <span className="w-12 text-xs font-bold font-mono-code text-[#38BDF8] px-2 py-1 rounded bg-white/[0.05] border border-white/10 text-center">
                    {slot.position}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-white font-display uppercase tracking-tight">
                        {player.name}
                      </span>
                      {flag && <span className="text-xs">{flag}</span>}
                      {player.source === 'EVENT' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 font-mono-code font-bold flex items-center gap-1">
                          <Flame className="w-2.5 h-2.5" />
                          QUILOMBO
                        </span>
                      )}
                    </div>
                    <span className="text-[12px] text-white/40 uppercase font-mono-code">
                      {/* {player.club ? `${player.club}` : ''} */}
                      {player.nationality && !player.club ? player.nationality : ''}
                    </span>
                  </div>
                </div>

                {/* Right: OVR */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-black font-display text-base sm:text-lg border ${
                    isHigh
                      ? 'bg-amber-400 text-black border-amber-300 font-black shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                      : isMid
                      ? 'bg-[#38BDF8] text-black border-[#7dd3fc]'
                      : 'bg-white/[0.08] text-white border-white/15'
                  }`}
                >
                  {player.ovr}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons: COMPARTIR, JUGAR DE NUEVO & VOLVER AL INICIO */}
      <div className="w-full flex flex-col  gap-2 mb-6">
        {onGoHome && (
          <button
            id="final-summary-home-btn"
            onClick={() => {
              sound.playClick();
              onGoHome();
            }}
            className="py-4 px-6 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-900 border border-white/25 hover:border-white/45 text-white font-black font-display text-sm sm:text-base uppercase tracking-wider flex items-center justify-center gap-2.5 active:scale-95 transition-all shadow-lg cursor-pointer"
            title="Volver al inicio"
          >
            <Home className="w-4 h-4 text-[#38BDF8]" />
            <span>INICIO</span>
          </button>
        )}

        {/* COMPARTIR Button */}
        <button
          onClick={handleShareClick}
          className="flex-1 py-4 px-6 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/20 text-white font-black font-display text-base sm:text-lg uppercase tracking-wider flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg"
        >
          <Share2 className="w-5 h-5 text-[#38BDF8]" />
          <span>COMPARTIR</span>
        </button>

        {/* JUGAR DE NUEVO Button */}
        <button
          onClick={handleRestart}
          className="flex-1 py-4 px-6 rounded-xl bg-[#38BDF8] hover:bg-[#7dd3fc] text-black font-black font-display text-base sm:text-lg uppercase tracking-wider flex items-center justify-center gap-3 shadow-xl shadow-[#38BDF8]/20 active:scale-95 transition-all"
        >
          <RotateCcw className="w-5 h-5 stroke-[3]" />
          <span>JUGAR DE NUEVO</span>
        </button>
      </div>


      {/* CARD RESUMEN MODAL (For Visual Result Sharing & Copying) */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[#0d0d0d] border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            {/* <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button> */}

            {/* Share Header */}
            {/* <div className="text-center mb-5">
              <div className="text-3xl mb-1">{rankingTier.badge}</div>
              <p className="text-[11px] uppercase font-bold tracking-[0.25em] text-[#38BDF8]">
                RESUMEN
              </p>
              <h3 className="text-2xl font-black text-white font-display uppercase tracking-tight">
                SoyDT // {formationCode}
              </h3>
            </div> */}

            {/* Compact Graphic Card Preview */}
            <div className="bg-[#050505] border border-white/15 rounded-xl p-5 mb-5 relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <div>
                  {/* <span className="text-[11px] uppercase font-bold text-white/50 tracking-wider">SCORE FINAL</span> */}
                  <div className="text-3xl font-black text-white font-display leading-tight">{score} PTS</div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] uppercase font-bold text-[#38BDF8] tracking-wider">FORMACIÓN</span>
                  <div className="text-2xl font-black text-white font-mono-code">{formationCode}</div>
                </div>
              </div>

              <div className="text-md font-black uppercase text-amber-400 font-display mb-3">
                {rankingTier.title}
              </div>

              {/* Compact Player Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {formation.slots.map((slot, idx) => {
                  const p = selectedPlayers[idx];
                  if (!p) return null;
                  return (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/5"
                    >
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <span className="font-mono-code font-bold text-[11px] text-[#38BDF8]">{slot.position}</span>
                        <span className="text-white font-medium truncate text-[12px]">{p.name}</span>
                      </div>
                      <span className="font-mono-code font-bold text-white/90 text-xs ml-1">{p.ovr}</span>
                    </div>
                  );
                })}
              </div>

              {/* App Link Footer */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[12px] text-white/50">
                <span className="font-mono-code text-[#38BDF8]">SoyDT</span>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[12px] text-white/50">
                <span className="truncate max-w-[180px]">{appUrl}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={handleCopyShareContent}
                className="flex-1 py-3 px-4 rounded-xl bg-[#38BDF8] hover:bg-[#7dd3fc] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>¡TEXTO Y LINK COPIADOS!</span>
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    <span>COPIAR</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowShareModal(false)}
                className="py-3 px-5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs font-bold uppercase tracking-wider transition-colors"
              >
                CERRAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
