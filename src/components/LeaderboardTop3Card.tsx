import React, { useState, useEffect } from 'react';
import { GameMode, LeaderboardTop3Data, LeaderboardTop3Entry } from '../types/game';
import { Trophy, Flame, ChevronDown, ChevronUp, RotateCw, Brain, Clock, TrendingUp } from 'lucide-react';
import { fetchLeaderboardTop3Async, DEFAULT_LEADERBOARD_TOP3, fetchTriviaLeaderboardAsync, fetchMayorOMenorLeaderboardAsync } from '../utils/globalRecords';
import { sound } from '../utils/audio';

type ActiveTab = GameMode | 'TRIVIA' | 'MAYOR_MENOR';
type MayorOMenorDataset = 'GLOBAL' | 'SALTO';

interface LeaderboardTop3CardProps {
  initialData?: LeaderboardTop3Data;
}

interface TriviaEntry { rank: number; playerName: string; score: number; timeSeconds: number }
interface MayorOMenorEntry { rank: number; playerName: string; streak: number }

export const LeaderboardTop3Card: React.FC<LeaderboardTop3CardProps> = ({ initialData }) => {
  const [data, setData] = useState<LeaderboardTop3Data>(initialData || DEFAULT_LEADERBOARD_TOP3);
  const [triviaData, setTriviaData] = useState<TriviaEntry[]>([]);
  const [mayorData, setMayorData] = useState<Record<MayorOMenorDataset, MayorOMenorEntry[]>>({ GLOBAL: [], SALTO: [] });
  const [mayorDataset, setMayorDataset] = useState<MayorOMenorDataset>('GLOBAL');
  const [activeMode, setActiveMode] = useState<ActiveTab>('FUTBOL11_SALTO');
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [lb, trivia, mayorGlobal, mayorSalto] = await Promise.all([
        fetchLeaderboardTop3Async(),
        fetchTriviaLeaderboardAsync(),
        fetchMayorOMenorLeaderboardAsync('GLOBAL'),
        fetchMayorOMenorLeaderboardAsync('SALTO'),
      ]);
      setData(lb);
      setTriviaData(trivia.slice(0, 3));
      setMayorData({ GLOBAL: mayorGlobal.slice(0, 3), SALTO: mayorSalto.slice(0, 3) });
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const currentList: LeaderboardTop3Entry[] = (activeMode !== 'TRIVIA' && activeMode !== 'MAYOR_MENOR') ? (data[activeMode as GameMode] || []) : [];

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <span className="w-7 h-7 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 flex items-center justify-center  font-black text-xs shadow-sm">
            1º
          </span>
        );
      case 2:
        return (
          <span className="w-7 h-7 rounded-full bg-slate-300/15 border border-slate-300/40 text-slate-200 flex items-center justify-center  font-black text-xs shadow-sm">
            2º
          </span>
        );
      case 3:
        return (
          <span className="w-7 h-7 rounded-full bg-amber-700/20 border border-amber-700/40 text-amber-500 flex items-center justify-center  font-black text-xs shadow-sm">
            3º
          </span>
        );
      default:
        return (
          <span className="w-7 h-7 rounded-full bg-white/5 border border-white/10 text-white/50 flex items-center justify-center  font-bold text-xs">
            {rank}º
          </span>
        );
    }
  };

  return (
    <div
      id="leaderboard-top3-card"
      className="w-full rounded-2xl bg-[#0a0a0a] border border-white/10 p-4 sm:p-5 shadow-xl relative overflow-hidden transition-all"
    >
      {/* Subtle top ambient glow */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

      {/* Header Bar with Toggle */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 flex-shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black uppercase font-display tracking-tight text-white">
                TOP3
              </h3>
            </div>
            <p className="text-[12px] text-white/40">
              Los mejores puntajes de la historia en cada modo de juego
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="leaderboard-refresh-btn"
            onClick={(e) => {
              e.stopPropagation();
              sound.playClick();
              loadData();
            }}
            title="Actualizar ranking"
            disabled={isLoading}
            className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-white/50 hover:text-white border border-white/10 transition-all cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#38BDF8]' : ''}`} />
          </button>

          <button
            id="leaderboard-toggle-btn"
            onClick={() => {
              sound.playClick();
              setIsOpen(!isOpen);
            }}
            title={isOpen ? 'Ocultar TOP3' : 'Ver TOP3'}
            aria-label={isOpen ? 'Ocultar TOP3' : 'Ver TOP3'}
            className="p-2 rounded-xl border bg-white/[0.03] hover:bg-white/[0.08] text-white/60 hover:text-white border-white/10 transition-all cursor-pointer"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-3.5 animate-fadeIn">
          {/* Mode Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-black/60 rounded-xl border border-white/10 overflow-x-auto scrollbar-none">
            <button
              id="tab-top3-salto"
              onClick={() => {
                sound.playClick();
                setActiveMode('FUTBOL11_SALTO');
              }}
              className={`flex-1 min-w-[100px] py-2 px-3 rounded-lg text-[12px] sm:text-xs  font-bold uppercase tracking-wider transition-all text-center cursor-pointer ${
                activeMode === 'FUTBOL11_SALTO'
                  ? 'bg-[#38BDF8] text-black shadow-md'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              SALTO (11)
            </button>

            <button
              id="tab-top3-f11"
              onClick={() => {
                sound.playClick();
                setActiveMode('FUTBOL11');
              }}
              className={`flex-1 min-w-[100px] py-2 px-3 rounded-lg text-[12px] sm:text-xs font-bold uppercase tracking-wider transition-all text-center cursor-pointer ${
                activeMode === 'FUTBOL11'
                  ? 'bg-[#38BDF8] text-black shadow-md'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              FÚTBOL 11
            </button>

            <button
              id="tab-top3-trivia"
              onClick={() => {
                sound.playClick();
                setActiveMode('TRIVIA');
              }}
              className={`flex-1 min-w-[80px] py-2 px-3 rounded-lg text-[12px] sm:text-xs font-bold uppercase tracking-wider transition-all text-center cursor-pointer flex items-center justify-center gap-1 ${
                activeMode === 'TRIVIA'
                  ? 'bg-violet-400 text-black shadow-md'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Brain className="w-3 h-3" />
              TRIVIA
            </button>

            <button
              id="tab-top3-mayor"
              onClick={() => {
                sound.playClick();
                setActiveMode('MAYOR_MENOR');
              }}
              className={`flex-1 min-w-[80px] py-2 px-3 rounded-lg text-[12px] sm:text-xs font-bold uppercase tracking-wider transition-all text-center cursor-pointer flex items-center justify-center gap-1 ${
                activeMode === 'MAYOR_MENOR'
                  ? 'bg-emerald-400 text-black shadow-md'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              MAY/MEN
            </button>

            {/*<button
              id="tab-top3-f5"
              onClick={() => {
                sound.playClick();
                setActiveMode('FUTBOL5');
              }}
              className={`flex-1 min-w-[100px] py-2 px-3 rounded-lg text-[12px] sm:text-xs  font-bold uppercase tracking-wider transition-all text-center cursor-pointer ${
                activeMode === 'FUTBOL5'
                  ? 'bg-[#38BDF8] text-black shadow-md'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              FÚTBOL 5
            </button>*/}
          </div>

          {/* Entries */}
          <div className="space-y-2">
            {activeMode === 'MAYOR_MENOR' ? (
              <div className="flex flex-col gap-2">
                <div className="flex gap-1.5 p-1 bg-black/40 rounded-lg border border-white/5">
                  {(['GLOBAL', 'SALTO'] as MayorOMenorDataset[]).map(d => (
                    <button
                      key={d}
                      onClick={() => { sound.playClick(); setMayorDataset(d); }}
                      className={`flex-1 py-1.5 rounded text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        mayorDataset === d ? 'bg-emerald-400 text-black' : 'text-white/50 hover:text-white'
                      }`}
                    >
                      {d === 'GLOBAL' ? '🌍 Global' : '⚽ Salto'}
                    </button>
                  ))}
                </div>
                {mayorData[mayorDataset].length === 0 ? (
                  <p className="text-[11px] font-mono-code text-white/30 text-center py-3">Sin partidas registradas aún</p>
                ) : (
                  mayorData[mayorDataset].map((entry) => (
                    <div
                      key={`mayor-${mayorDataset}-${entry.rank}-${entry.playerName}`}
                      className="px-3.5 py-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {getRankBadge(entry.rank)}
                        <span className="font-bold text-xs sm:text-sm text-white uppercase tracking-wide truncate">
                          {entry.playerName}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm sm:text-base font-black text-white">{entry.streak}</span>
                        <span className="text-[11px] text-white/40"> racha</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : activeMode === 'TRIVIA' ? (
              triviaData.length === 0 ? (
                <p className="text-[11px] font-mono-code text-white/30 text-center py-3">Sin partidas registradas aún</p>
              ) : (
                triviaData.map((entry) => (
                  <div
                    key={`trivia-${entry.rank}-${entry.playerName}`}
                    className="px-3.5 py-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {getRankBadge(entry.rank)}
                      <span className="font-bold text-xs sm:text-sm text-white uppercase tracking-wide truncate">
                        {entry.playerName}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex items-center gap-1 text-[#38BDF8]">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-mono-code text-white/50 tabular-nums">{entry.timeSeconds}s</span>
                      </div>
                      <div className="text-right min-w-[50px]">
                        <span className="text-sm sm:text-base font-black text-white">{entry.score}</span>
                        <span className="text-[11px] text-white/40"> /10</span>
                      </div>
                    </div>
                  </div>
                ))
              )
            ) : (
              currentList.map((entry) => (
                <div
                  key={`${activeMode}-${entry.rank}-${entry.playerName}`}
                  className="px-3.5 py-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {getRankBadge(entry.rank)}
                    <div className="min-w-0">
                      <span className="font-bold text-xs sm:text-sm text-white uppercase tracking-wide truncate block">
                        {entry.playerName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
                    <div className="flex items-center justify-center">
                      {entry.eventsEnabled ? (
                        <div title="Quilombos activados" className="w-7 h-7 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-sm">
                          <Flame className="w-4 h-4 fill-orange-400/40 text-orange-400" />
                        </div>
                      ) : (
                        <div title="Quilombos desactivados" className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-center relative opacity-50">
                          <Flame className="w-4 h-4 text-white/40" />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-5 h-[1.5px] bg-red-500/90 rotate-45 rounded-full shadow-sm" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-right min-w-[70px]">
                      <span className="text-sm sm:text-base font-black text-white">{entry.score}</span>{' '}
                      <span className="text-[11px] text-white/40">PTS</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
