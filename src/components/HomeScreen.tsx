import React from 'react';
import { GameMode, AllRecords, RunHistoryItem } from '../types/game';
import { getGlobalGameRecords, GlobalRecordsMap } from '../utils/globalRecords';
import { DtProfileCard } from './DtProfileCard';
import { LeaderboardTop3Card } from './LeaderboardTop3Card';
import { 
  Users, 
  Shield, 
  Flag, 
  MapPin, 
  Play, 
  Lock, 
  Trophy, 
  KeyRound, 
  Flame, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { sound } from '../utils/audio';

interface HomeScreenProps {
  onSelectMode: (mode: GameMode) => void;
  onOpenCodeModal: () => void;
  onOpenFriendRooms: (initialCode?: string) => void;
  records: AllRecords;
  eventsEnabled: boolean;
  onToggleEvents: () => void;
  globalRecords?: GlobalRecordsMap;
  playerName: string;
  onSavePlayerName: (newName: string) => Promise<boolean> | void;
  recentRuns: RunHistoryItem[];
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectMode,
  onOpenCodeModal,
  onOpenFriendRooms,
  records,
  eventsEnabled,
  onToggleEvents,
  globalRecords: _globalRecords,
  playerName,
  onSavePlayerName,
  recentRuns,
}) => {
  const handleSelect = (mode: GameMode) => {
    sound.playClick();
    onSelectMode(mode);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-2 sm:py-6 flex flex-col gap-6 sm:gap-8 animate-fadeIn">
      {/* DT Profile & Recent Runs Accordion */}
      <DtProfileCard
        playerName={playerName}
        onSavePlayerName={onSavePlayerName}
        recentRuns={recentRuns}
      />
      {/* Hero Welcome Section */}
      {/*<div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[#38BDF8] text-[12px] font-mono-code font-bold uppercase tracking-[0.25em]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ROGUELIKE DE SELECCIÓN TÁCTICA</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black tracking-tighter uppercase font-display text-white">
          SELECCIONÁ MODO DE JUEGO
        </h2>

        <p className="text-xs sm:text-sm text-white/60 max-w-xl mx-auto font-normal">
          Elegí tu formato táctico para iniciar el draft de jugadores. Tomá decisiones, gestioná cambios y llevá tu plantel a la máxima puntuación.
        </p>
      </div>*/}

      {/* 4 Mode Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
      {/* 4. FÚTBOL 11 SALTO (ACTIVO) */}
        <div 
          onClick={() => handleSelect('FUTBOL11_SALTO')}
          className="group relative rounded-2xl p-5 sm:p-6 bg-[#0a0a0a] border border-white/15 hover:border-[#38BDF8]/60 transition-all duration-300 shadow-xl flex flex-col justify-between cursor-pointer hover:shadow-[0_0_30px_rgba(56,189,248,0.15)] hover:bg-[#0d0d0d] active:scale-[0.99]"
        >
          {/* Ambient top subtle highlight */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#38BDF8]/40 to-transparent group-hover:via-[#38BDF8] transition-all" />

          <div>
            {/* Title */}
            <h3 className="text-2xl font-black uppercase font-display tracking-tight text-white group-hover:text-[#38BDF8] transition-colors mb-3 flex items-center gap-2">
              FÚTBOL 11 SALTO
            </h3>

            {/* Technical Specs Tags */}
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="text-[11px] font-mono-code font-bold uppercase px-2.5 py-1 rounded bg-white/[0.04] border border-white/10 text-white/80">
                LIGA SALTO
              </span>
              <span className="text-[11px] font-mono-code font-bold uppercase px-2.5 py-1 rounded bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[#38BDF8]">
                4-3-3
              </span>
            </div>
          </div>

          {/* Bottom: Record & Action */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
            {records.FUTBOL11_SALTO ? (
              <div className="flex items-center gap-1.5 text-xs font-mono-code">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-white/40 text-[11px] uppercase">TÚ RÉCORD:</span>
                <span className="font-black text-white">{records.FUTBOL11_SALTO.score} PTS</span>
              </div>
            ) : (
              <span className="text-[11px] font-mono-code text-white/30 uppercase tracking-wider">
                SIN RÉCORD REGISTRADO
              </span>
            )}

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black group-hover:bg-[#38BDF8] group-hover:text-black font-black font-display text-xs uppercase tracking-wider transition-all shadow-md">
              <span>JUGAR</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
        {/* 1. FÚTBOL 11 (ACTIVO) */}
        <div 
          onClick={() => handleSelect('FUTBOL11')}
          className="group relative rounded-2xl p-5 sm:p-6 bg-[#0a0a0a] border border-white/15 hover:border-[#38BDF8]/60 transition-all duration-300 shadow-xl flex flex-col justify-between cursor-pointer hover:shadow-[0_0_30px_rgba(56,189,248,0.15)] hover:bg-[#0d0d0d] active:scale-[0.99]"
        >
          {/* Ambient top subtle highlight */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#38BDF8]/40 to-transparent group-hover:via-[#38BDF8] transition-all" />

          <div>
            <h3 className="text-2xl font-black uppercase font-display tracking-tight text-white group-hover:text-[#38BDF8] transition-colors mb-3 flex items-center gap-2">
              FÚTBOL 11
            </h3>

            {/* Technical Specs Tags */}
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="text-[11px] font-mono-code font-bold uppercase px-2.5 py-1 rounded bg-white/[0.04] border border-white/10 text-white/80">
                LIGAS DEL MUNDO
              </span>
              <span className="text-[11px] font-mono-code font-bold uppercase px-2.5 py-1 rounded bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[#38BDF8]">
                4-3-3
              </span>
            </div>
          </div>

          {/* Bottom: Record & Action */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
            {records.FUTBOL11 ? (
              <div className="flex items-center gap-1.5 text-xs font-mono-code">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-white/40 text-[11px] uppercase">TÚ RÉCORD:</span>
                <span className="font-black text-white">{records.FUTBOL11.score} PTS</span>
              </div>
            ) : (
              <span className="text-[11px] font-mono-code text-white/30 uppercase tracking-wider">
                SIN RÉCORD REGISTRADO
              </span>
            )}

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black group-hover:bg-[#38BDF8] group-hover:text-black font-black font-display text-xs uppercase tracking-wider transition-all shadow-md">
              <span>JUGAR</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* 2. FÚTBOL 5 (ACTIVO) */}
        {/*<div 
          onClick={() => handleSelect('FUTBOL5')}
          className="group relative rounded-2xl p-5 sm:p-6 bg-[#0a0a0a] border border-white/15 hover:border-[#38BDF8]/60 transition-all duration-300 shadow-xl flex flex-col justify-between cursor-pointer hover:shadow-[0_0_30px_rgba(56,189,248,0.15)] hover:bg-[#0d0d0d] active:scale-[0.99]"
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#38BDF8]/40 to-transparent group-hover:via-[#38BDF8] transition-all" />
          <div>
            <h3 className="text-2xl font-black uppercase font-display tracking-tight text-white group-hover:text-[#38BDF8] transition-colors mb-3 flex items-center gap-2">
              FÚTBOL 5
            </h3>
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="text-[11px] font-mono-code font-bold uppercase px-2.5 py-1 rounded bg-white/[0.04] border border-white/10 text-white/80">
                LIGAS DEL MUNDO
              </span>
              <span className="text-[11px] font-mono-code font-bold uppercase px-2.5 py-1 rounded bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[#38BDF8]">
                1-2-1
              </span>
            </div>
          </div>
          <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-3">
              {records.FUTBOL5 ? (
                <div className="flex items-center gap-1.5 text-xs font-mono-code">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-white/40 text-[11px] uppercase">TÚ RÉCORD:</span>
                  <span className="font-black text-white">{records.FUTBOL5.score} PTS</span>
                </div>
              ) : (
                <span className="text-[11px] font-mono-code text-white/30 uppercase tracking-wider">
                  SIN RÉCORD REGISTRADO
                </span>
              )}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black group-hover:bg-[#38BDF8] group-hover:text-black font-black font-display text-xs uppercase tracking-wider transition-all shadow-md">
                <span>JUGAR</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>*/}

        {/* 3. FÚTBOL 11 ARG (DESHABILITADO / PRÓXIMAMENTE) */}
        {/*<div className="relative rounded-2xl p-5 sm:p-6 bg-[#080808]/70 border border-white/5 opacity-60 cursor-not-allowed select-none flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-black uppercase font-display tracking-tight text-white/50 mb-3">
              FÚTBOL 11 ARG
            </h3>
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="text-[11px] font-mono-code font-bold uppercase px-2.5 py-1 rounded bg-white/[0.02] border border-white/5 text-white/40">
                LIGA ARGENTINA
              </span>
              <span className="text-[11px] font-mono-code font-bold uppercase px-2.5 py-1 rounded bg-white/[0.02] border border-white/5 text-white/40">
                4-3-3
              </span>
            </div>
          </div>
          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <div className="px-3.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-white/30 text-xs font-bold font-mono-code uppercase">
              PRÓXIMAMENTE
            </div>
          </div>
        </div>*/}

        
      </div>

      {/* Torneo de Amigos: Salas privadas con link y tabla de posiciones */}
      <div 
        onClick={() => {
          sound.playClick();
          onOpenFriendRooms();
        }}
        className="group relative w-full rounded-2xl bg-gradient-to-r from-emerald-950/30 via-[#0a0a0a] to-[#38BDF8]/10 border border-white/15 hover:border-[#38BDF8]/60 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300 shadow-xl cursor-pointer hover:shadow-[0_0_25px_rgba(56,189,248,0.12)] active:scale-[0.99]"
      >
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h4 className="text-sm font-black uppercase text-white group-hover:text-[#38BDF8] transition-colors font-display tracking-tight flex items-center gap-2">
                <span>TORNEO DE AMIGOS</span>
              </h4>
              <span className="text-[10px] font-mono-code font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                SALA PRIVADA
              </span>
            </div>
            <p className="text-[12px] text-white/50">
              Creá tu sala, compartí el link por WhatsApp y compitan en vivo en la tabla de posiciones (hasta 10 jugadores).
            </p>
          </div>
        </div>

        <div className="w-full sm:w-auto flex items-center justify-end">
          <div className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black group-hover:bg-[#38BDF8] group-hover:text-black font-black font-display text-xs uppercase tracking-wider transition-all shadow-md">
            <span>JUGAR CON AMIGOS</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Leaderboard Top 3 Histórico */}
      <LeaderboardTop3Card />

      {/* Quilombo Events Toggle Button in Footer */}
      <div className="flex items-center justify-center pt-2">
        <button
          onClick={() => {
            sound.playClick();
            onToggleEvents();
          }}
          className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-mono-code font-bold uppercase tracking-wider transition-all active:scale-95 ${
            eventsEnabled
              ? 'bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/40 text-orange-400'
              : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/15 text-white/50 hover:text-white'
          }`}
          title="Activar o desactivar eventos Quilombo durante las partidas"
        >
          <div className="relative flex items-center justify-center flex-shrink-0">
            <Flame className={`w-4 h-4 ${eventsEnabled ? 'text-orange-400 fill-orange-400/20' : 'text-white/30'}`} />
            {!eventsEnabled && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-4 h-[1.5px] bg-rose-500 rotate-45 rounded-full" />
              </div>
            )}
          </div>
          <span>
            QUILOMBOS: {eventsEnabled ? 'activados' : 'desactivados'}
          </span>
        </button>
      </div>
    </div>
  );
};
