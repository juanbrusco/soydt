import React, { useState, useEffect, useRef } from 'react';
import { Player } from '../types/game';
import { Trophy, ArrowLeft, ChevronUp, ChevronDown, RotateCw } from 'lucide-react';
import { sound } from '../utils/audio';
import { submitMayorOMenorResult, fetchMayorOMenorLeaderboardAsync } from '../utils/globalRecords';

type Dataset = 'GLOBAL' | 'SALTO';
type Phase = 'setup' | 'playing' | 'result';

interface Props {
  playerName: string;
  onBack: () => void;
}

interface LeaderboardEntry { rank: number; playerName: string; streak: number }

function getRankBadge(rank: number) {
  const base = 'w-5 text-center font-black text-xs';
  if (rank === 1) return <span className={`${base} text-amber-400`}>1º</span>;
  if (rank === 2) return <span className={`${base} text-slate-300`}>2º</span>;
  if (rank === 3) return <span className={`${base} text-amber-600`}>3º</span>;
  return <span className={`${base} text-white/30`}>{rank}º</span>;
}

export const MayorOMenorGame: React.FC<Props> = ({ playerName, onBack }) => {
  const [phase, setPhase] = useState<Phase>('setup');
  const [dataset, setDataset] = useState<Dataset>('GLOBAL');
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerA, setPlayerA] = useState<Player | null>(null);
  const [playerB, setPlayerB] = useState<Player | null>(null);
  const [streak, setStreak] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const submittedRef = useRef(false);
  const poolRef = useRef<Player[]>([]);
  const usedIdsRef = useRef<Set<string>>(new Set());

  function pickRandom(excludeId?: string, excludeOvr?: number): Player | null {
    const filter = (p: Player) =>
      p.id !== excludeId &&
      !usedIdsRef.current.has(p.id) &&
      (excludeOvr === undefined || p.ovr !== excludeOvr);
    let available = poolRef.current.filter(filter);
    if (available.length === 0) {
      usedIdsRef.current.clear();
      available = poolRef.current.filter(p => p.id !== excludeId && (excludeOvr === undefined || p.ovr !== excludeOvr));
      if (available.length === 0) return null;
    }
    return available[Math.floor(Math.random() * available.length)];
  }

  async function startGame() {
    setLoadingPlayers(true);
    try {
      const mode = dataset === 'SALTO' ? 'FUTBOL11_SALTO' : 'FUTBOL11';
      const res = await fetch(`/api/players?mode=${mode}`);
      const data = await res.json();
      const pool: Player[] = data.players || [];
      poolRef.current = pool;
      usedIdsRef.current.clear();
      submittedRef.current = false;

      const a = pool[Math.floor(Math.random() * pool.length)];
      usedIdsRef.current.add(a.id);
      const bPool = pool.filter(p => p.id !== a.id && p.ovr !== a.ovr);
      const b = bPool[Math.floor(Math.random() * bPool.length)];
      usedIdsRef.current.add(b.id);

      setPlayers(pool);
      setPlayerA(a);
      setPlayerB(b);
      setStreak(0);
      setRevealed(false);
      setLastCorrect(null);
      setPhase('playing');
    } catch {
      // keep on setup
    } finally {
      setLoadingPlayers(false);
    }
  }

  function handleGuess(guess: 'MAYOR' | 'MENOR') {
    if (!playerA || !playerB || revealed) return;
    sound.playClick();

    const correct = guess === 'MAYOR' ? playerB.ovr > playerA.ovr : playerB.ovr < playerA.ovr;
    setRevealed(true);
    setLastCorrect(correct);

    if (correct) {
      sound.playSuccess();
    } else {
      sound.playFail();
    }

    setTimeout(() => {
      if (correct) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        const next = pickRandom(playerB.id, playerB.ovr);
        if (!next) {
          endGame(newStreak);
          return;
        }
        usedIdsRef.current.add(next.id);
        setPlayerA(playerB);
        setPlayerB(next);
        setRevealed(false);
        setLastCorrect(null);
      } else {
        endGame(streak);
      }
    }, 1200);
  }

  async function endGame(finalStreak: number) {
    if (!submittedRef.current) {
      submittedRef.current = true;
      await submitMayorOMenorResult(playerName, finalStreak, dataset);
    }
    setPhase('result');
  }

  // Setup screen
  if (phase === 'setup') {
    return (
      <div className="w-full max-w-lg mx-auto flex flex-col gap-5 animate-fadeIn py-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-white/40 hover:text-white text-xs font-mono-code uppercase transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
        </div>

        <div className="rounded-2xl bg-[#0a0a0a] border border-white/15 p-6 flex flex-col gap-6 shadow-xl">
          <div className="flex flex-col items-center gap-1">
            <p className="text-[11px] font-mono-code font-bold uppercase tracking-[0.3em] text-emerald-400">MAYOR O MENOR</p>
            <h2 className="text-2xl font-black font-display text-white uppercase">¿Cuál tiene mayor puntaje?</h2>
            <p className="text-[12px] text-white/40 text-center">Adiviná y construí tu racha</p>
          </div>

          {/* <div className="flex flex-col gap-2">
            <p className="text-[11px] font-mono-code uppercase tracking-wider text-white/50">Jugador</p>
            <div className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white font-bold font-mono-code text-sm uppercase">
              {playerName || 'DT ANÓNIMO'}
            </div>
          </div> */}

          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-mono-code uppercase tracking-wider text-white/50">Dataset</p>
            <div className="flex gap-2 p-1 bg-black/60 rounded-xl border border-white/10">
              {(['GLOBAL', 'SALTO'] as Dataset[]).map(d => (
                <button
                  key={d}
                  onClick={() => { sound.playClick(); setDataset(d); }}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    dataset === d
                      ? 'bg-emerald-400 text-black shadow-md'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {d === 'GLOBAL' ? '🌍 GLOBAL' : '⚽ SALTO'}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startGame}
            disabled={loadingPlayers}
            className="w-full py-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-black font-display text-sm uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loadingPlayers ? <RotateCw className="w-4 h-4 animate-spin" /> : null}
            EMPEZAR
          </button>
        </div>
      </div>
    );
  }

  // Result screen
  if (phase === 'result') {
    return (
      <div className="w-full max-w-lg mx-auto flex flex-col gap-5 animate-fadeIn py-4">
        <div className="rounded-2xl bg-[#0a0a0a] border border-white/15 p-6 flex flex-col items-center gap-5 shadow-xl">
          <p className="text-[11px] font-mono-code font-bold uppercase tracking-[0.25em] text-emerald-400">RESULTADO</p>
          <div className="flex flex-col items-center gap-1">
            <span className="text-7xl font-black font-display text-white">{streak}</span>
            <span className="text-white/40 font-mono-code text-sm uppercase tracking-wider">
              {streak === 1 ? 'acierto seguido' : 'aciertos seguidos'}
            </span>
          </div>
          <div className="text-xs font-mono-code text-white/30 uppercase">{dataset === 'SALTO' ? '⚽ Liga de Salto' : '🌍 Global'}</div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 py-3 rounded-xl bg-white text-black font-black font-display text-sm uppercase tracking-wider hover:bg-emerald-400 transition-colors"
          >
            INICIO
          </button>
        </div>
      </div>
    );
  }

  // Game screen
  if (!playerA || !playerB) return null;

  const feedbackColor = lastCorrect === null ? '' : lastCorrect ? 'text-emerald-400' : 'text-red-400';

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-5 animate-fadeIn py-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-white/40 hover:text-white text-xs font-mono-code uppercase transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono-code text-white/40 uppercase">RACHA</span>
          <span className={`text-2xl font-black font-display text-white tabular-nums ${lastCorrect === true ? 'text-emerald-400' : ''}`}>{streak}</span>
        </div>
      </div>

      {/* Player A — revealed */}
      <div className="rounded-2xl bg-[#0a0a0a] border border-white/15 p-5 shadow-xl flex items-center gap-5">
        <span className="text-5xl font-black font-display text-white min-w-[72px] text-center">{playerA.ovr}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-mono-code text-white/40 uppercase tracking-wider mb-0.5">REFERENCIA</p>
          <p className="text-lg font-black font-display text-white uppercase truncate">{playerA.name}</p>
          <p className="text-xs text-white/50 truncate">{playerA.club}</p>
        </div>
      </div>

      {/* VS */}
      <div className="flex items-center justify-center gap-3">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs font-mono-code font-bold text-white/30 uppercase tracking-widest">VS</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Player B — hidden until revealed */}
      <div className={`rounded-2xl bg-[#0a0a0a] border p-5 shadow-xl flex items-center gap-5 transition-all ${
        revealed
          ? lastCorrect ? 'border-emerald-500/50' : 'border-red-500/50'
          : 'border-white/15'
      }`}>
        <span className={`text-5xl font-black font-display min-w-[72px] text-center transition-all ${revealed ? feedbackColor : 'text-white/20'}`}>
          {revealed ? playerB.ovr : '?'}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-mono-code text-white/40 uppercase tracking-wider mb-0.5">¿ESTE?</p>
          <p className="text-lg font-black font-display text-white uppercase truncate">{playerB.name}</p>
          <p className="text-xs text-white/50 truncate">{playerB.club}</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleGuess('MAYOR')}
          disabled={revealed}
          className="py-4 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 hover:border-emerald-500/70 text-emerald-400 font-black font-display text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronUp className="w-5 h-5 stroke-[3]" />
          MAYOR
        </button>
        <button
          onClick={() => handleGuess('MENOR')}
          disabled={revealed}
          className="py-4 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 hover:border-red-500/70 text-red-400 font-black font-display text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronDown className="w-5 h-5 stroke-[3]" />
          MENOR
        </button>
      </div>

      {revealed && lastCorrect !== null && (
        <p className={`text-center text-sm font-black font-mono-code uppercase tracking-wider animate-fadeIn ${lastCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
          {lastCorrect ? '✓ CORRECTO' : '✗ INCORRECTO — GAME OVER'}
        </p>
      )}
    </div>
  );
};
