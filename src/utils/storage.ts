import { AllRecords, GameMode, ModeRecord, RankingTier, RunHistoryItem } from '../types/game';

const STORAGE_KEY_RECORDS = 'soydt_records_v3';
const STORAGE_KEY_LAST_RUNS = 'soydt_last_runs_v3';
const STORAGE_KEY_SOUND = 'soydt_sound_muted';
const STORAGE_KEY_EVENTS = 'soydt_events_enabled';

export const RANKING_TIERS: RankingTier[] = [
  {
    title: 'DT LEYENDA MUNDIAL',
    minAverage: 88.5,
    badge: '👑',
    color: 'text-amber-300',
    bgGradient: 'from-amber-500/20 via-yellow-500/10 to-amber-900/30 border-amber-400/50',
    comment: '¡Plantel galáctico irrepetible! Candidato a ganar el Mundial de Clubes invicto.'
  },
  {
    title: 'DT DE PRIMERA DIVISIÓN',
    minAverage: 85.5,
    badge: '🏆',
    color: 'text-emerald-400',
    bgGradient: 'from-emerald-500/20 via-teal-500/10 to-emerald-900/30 border-emerald-400/50',
    comment: 'Equipo de alta jerarquía continental. Estás para pelear la Copa Libertadores.'
  },
  {
    title: 'DT DE COPA INTERNACIONAL',
    minAverage: 83.0,
    badge: '⭐',
    color: 'text-blue-400',
    bgGradient: 'from-blue-500/20 via-indigo-500/10 to-blue-900/30 border-blue-400/50',
    comment: 'Plantel muy sólido y competitivo. Difícil de vencer en cualquier cancha.'
  },
  {
    title: 'DT DE MITAD DE TABLA',
    minAverage: 80.0,
    badge: '🛡️',
    color: 'text-zinc-300',
    bgGradient: 'from-zinc-600/20 via-zinc-700/10 to-zinc-900/30 border-zinc-500/40',
    comment: 'Buena base de jugadores con algunos puntos flacos. Se rescata el esfuerzo.'
  },
  {
    title: 'DT DEL ASCENSO / PELEA DESCENSO',
    minAverage: 76.0,
    badge: '⚠️',
    color: 'text-orange-400',
    bgGradient: 'from-orange-500/20 via-amber-700/10 to-orange-950/30 border-orange-500/40',
    comment: 'Mucho corazón y garra pero falta jerarquía en puestos clave. Hay que raspar.'
  },
  {
    title: 'DT INTERINO / CICLO CUMPLIDO',
    minAverage: 0,
    badge: '📉',
    color: 'text-rose-400',
    bgGradient: 'from-rose-500/20 via-red-900/10 to-rose-950/30 border-rose-500/40',
    comment: 'La barra te está esperando en el estacionamiento. Presentá la renuncia indeclinable.'
  }
];

export const RANKING_TIERS_SALTO: RankingTier[] = [
  {
    title: 'DT LEYENDA DE LA LIGA DE SALTO',
    minAverage: 85.5,
    badge: '👑',
    color: 'text-amber-300',
    bgGradient: 'from-amber-500/25 via-yellow-500/15 to-amber-900/40 border-amber-400/60',
    comment: 'Armaste el Dream Team histórico de Salto. Campeón invicto y leyenda absoluta.'
  },
  {
    title: 'DT CAMPEÓN DE LA LIGA DE SALTO',
    minAverage: 83.5,
    badge: '🏆',
    color: 'text-amber-400',
    bgGradient: 'from-amber-500/20 via-yellow-500/10 to-amber-900/30 border-amber-400/50',
    comment: 'La copa del torneo "Ariel Brusco" se queda en tu club y clasificás al Federal.'
  },
  {
    title: 'DT FINALISTA',
    minAverage: 81.5,
    badge: '⭐',
    color: 'text-emerald-400',
    bgGradient: 'from-emerald-500/20 via-teal-500/10 to-emerald-900/30 border-emerald-400/50',
    comment: 'Gran campaña en el torneo "Ariel Brusco" llegando a la gran final.'
  },
  {
    title: 'DT DE PLAYOFFS',
    minAverage: 79.0,
    badge: '🛡️',
    color: 'text-blue-400',
    bgGradient: 'from-blue-500/20 via-indigo-500/10 to-blue-900/30 border-blue-400/50',
    comment: 'Clasificaste a los cruces con garra y personalidad. Cancha durísima para cualquier rival.'
  },
  {
    title: 'DT DE MITAD DE TABLA',
    minAverage: 76.5,
    badge: '⚖️',
    color: 'text-zinc-300',
    bgGradient: 'from-zinc-600/20 via-zinc-700/10 to-zinc-900/30 border-zinc-500/40',
    comment: 'Campaña con altibajos. Ganaste algún clásico local pero faltó regularidad para pelear arriba.'
  },
  {
    title: 'DT AL BORDE DEL DESPIDO',
    minAverage: 74.0,
    badge: '⚠️',
    color: 'text-orange-400',
    bgGradient: 'from-orange-500/20 via-amber-700/10 to-orange-950/30 border-orange-500/40',
    comment: 'Plantel raspado que tuvo que remar en canchas muy duras para mantener la categoría.'
  },
  {
    title: 'DT CON CICLO CUMPLIDO',
    minAverage: 0,
    badge: '📉',
    color: 'text-rose-400',
    bgGradient: 'from-rose-500/20 via-red-900/10 to-rose-950/30 border-rose-500/40',
    comment: 'La barra te está esperando en el vestuario. Presentá la renuncia indeclinable ante la comisión directiva.'
  }
];

export function getRankingTier(score: number, totalSlots: number = 11, mode?: GameMode): RankingTier {
  const tiers = mode === 'FUTBOL11_SALTO' ? RANKING_TIERS_SALTO : RANKING_TIERS;
  const isFutbol5 = mode === 'FUTBOL5' || totalSlots <= 5;
  const slots = isFutbol5 ? 5 : (totalSlots > 0 ? totalSlots : 11);
  const avg = score / slots;

  for (const tier of tiers) {
    if (avg >= tier.minAverage) {
      return tier;
    }
  }
  return tiers[tiers.length - 1];
}

export function loadRecords(): AllRecords {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECORDS);
    if (!raw) return { FUTBOL11: null, FUTBOL5: null, FUTBOL11_SALTO: null };
    return JSON.parse(raw);
  } catch {
    return { FUTBOL11: null, FUTBOL5: null, FUTBOL11_SALTO: null };
  }
}

export function saveRecordIfBetter(mode: GameMode, score: number, runCode: string, formationName: string): boolean {
  try {
    const current = loadRecords();
    const existing = current[mode];
    
    if (!existing || score >= existing.score) {
      current[mode] = {
        score,
        runCode,
        date: new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        formationName
      };
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(current));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function loadLastRuns(): Record<GameMode, ModeRecord | null> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LAST_RUNS);
    if (!raw) return { FUTBOL11: null, FUTBOL5: null, FUTBOL11_SALTO: null };
    return JSON.parse(raw);
  } catch {
    return { FUTBOL11: null, FUTBOL5: null, FUTBOL11_SALTO: null };
  }
}

export function saveLastRun(mode: GameMode, score: number, runCode: string, formationName: string) {
  try {
    const current = loadLastRuns();
    current[mode] = {
      score,
      runCode,
      date: new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
      formationName
    };
    localStorage.setItem(STORAGE_KEY_LAST_RUNS, JSON.stringify(current));
  } catch {
    // Ignore storage issues
  }
}

export function loadMutedPreference(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY_SOUND) === 'true';
  } catch {
    return false;
  }
}

export function saveMutedPreference(muted: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY_SOUND, String(muted));
  } catch {
    // Ignore
  }
}

export function loadEventsEnabledPreference(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EVENTS);
    if (raw === null) return true; // Default is ON (events enabled)
    return raw === 'true';
  } catch {
    return true;
  }
}

export function saveEventsEnabledPreference(enabled: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY_EVENTS, String(enabled));
  } catch {
    // Ignore
  }
}

const STORAGE_KEY_DT_NAME = 'soydt_dt_name';
const STORAGE_KEY_RECENT_RUNS = 'soydt_recent_runs_history_v1';

export function getSavedPlayerName(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_DT_NAME) || 'DT';
  } catch {
    return 'DT';
  }
}

export function savePlayerName(name: string) {
  try {
    const clean = name.trim().slice(0, 30).toUpperCase() || 'DT';
    localStorage.setItem(STORAGE_KEY_DT_NAME, clean);
  } catch {
    // Ignore
  }
}

export function loadRecentRunsHistory(): RunHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECENT_RUNS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveRunToHistory(run: Omit<RunHistoryItem, 'id' | 'date'> & { date?: string }): RunHistoryItem[] {
  try {
    const current = loadRecentRunsHistory();
    const newItem: RunHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      mode: run.mode,
      score: run.score,
      formationName: run.formationName,
      rankingTierTitle: run.rankingTierTitle,
      date: run.date || new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
      runCode: run.runCode,
      eventsEnabled: run.eventsEnabled,
    };
    // Keep max 5 most recent runs
    const updated = [newItem, ...current.filter((r) => r.id !== newItem.id)].slice(0, 5);
    localStorage.setItem(STORAGE_KEY_RECENT_RUNS, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

