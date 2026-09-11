import { GameMode, LeaderboardTop3Data } from '../types/game';

export interface GlobalGameRecord {
  score: number;
  holder: string;
}

export type GlobalRecordsMap = Record<GameMode, GlobalGameRecord>;

/**
 * Valores iniciales simulados (bien altos) para cada modo de juego.
 * Preparado para reemplazar o sincronizar con una base de datos global a futuro (ej: Firestore o API backend).
 */
export const DEFAULT_GLOBAL_RECORDS: GlobalRecordsMap = {
  FUTBOL11_SALTO: {
    score: 938,
    holder: 'JOTA',
  },
  FUTBOL11: {
    score: 988,
    holder: 'AGUSTÍN B.',
  },
  FUTBOL5: {
    score: 472,
    holder: 'SANTINO M.',
  },
  TRIVIA: {
    score: 0,
    holder: '-',
  },
};

// Caché en memoria para lectura sincrónica inmediata en la UI
let cachedGlobalRecords: GlobalRecordsMap = { ...DEFAULT_GLOBAL_RECORDS };
let isNeonConnected = false;

/**
 * Función sincrónica para renderizado inmediato en UI sin flickering.
 */
export function getGlobalGameRecords(): GlobalRecordsMap {
  return cachedGlobalRecords;
}

export function isDbConnected(): boolean {
  return isNeonConnected;
}

/**
 * Consulta los récords actualizados al backend (/api/records/global)
 * y actualiza la caché local.
 */
export async function fetchGlobalGameRecordsAsync(): Promise<{
  connected: boolean;
  records: GlobalRecordsMap;
}> {
  try {
    const res = await fetch('/api/records/global');
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    const data = await res.json();
    if (data && data.records) {
      cachedGlobalRecords = {
        ...cachedGlobalRecords,
        ...data.records,
      };
      isNeonConnected = !!data.connected;
      return {
        connected: isNeonConnected,
        records: cachedGlobalRecords,
      };
    }
  } catch (err) {
    // Si falla o no hay conexión aún, mantenemos el fallback
  }

  return {
    connected: isNeonConnected,
    records: cachedGlobalRecords,
  };
}

/**
 * Verifica el estado de la conexión a la base de datos Neon.
 */
export async function testNeonConnection(): Promise<{
  connected: boolean;
  message: string;
}> {
  try {
    const res = await fetch('/api/records/status');
    const data = await res.json();
    isNeonConnected = !!data.connected;
    return data;
  } catch (err: any) {
    return {
      connected: false,
      message: `Error de red al consultar el servidor: ${err.message || err}`,
    };
  }
}

/**
 * Envía un récord de partida al servidor para persistirlo en Neon.
 */
export async function postGameRecord(payload: {
  mode: GameMode;
  score: number;
  playerName?: string;
  runCode?: string;
  formationName?: string;
  rankingTier?: string;
  selectedPlayers?: any[];
  eventsEnabled?: boolean;
}): Promise<{ success: boolean; runId?: number; isNewGlobalRecord?: boolean }> {
  try {
    const res = await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      return { success: false };
    }
    const data = await res.json();
    if (data.success) {
      // Re-consultar los récords para actualizar la caché global
      await fetchGlobalGameRecordsAsync();
    }
    return data;
  } catch (err) {
    console.error('Error posting game record to server:', err);
    return { success: false };
  }
}

/**
 * Actualiza el nombre del DT de una partida en Neon y refresca los récords globales.
 */
export async function updateRunPlayerNameAsync(
  runId: number,
  playerName: string
): Promise<{ success: boolean }> {
  try {
    const res = await fetch('/api/records/update-name', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ runId, playerName }),
    });
    if (!ok(res)) return { success: false };
    const data = await res.json();
    if (data.success) {
      await fetchGlobalGameRecordsAsync();
    }
    return data;
  } catch (err) {
    console.error('Error updating player name:', err);
    return { success: false };
  }
}

function ok(res: Response): boolean {
  return res.ok;
}

export const DEFAULT_LEADERBOARD_TOP3: LeaderboardTop3Data = {
  FUTBOL11_SALTO: [
    { rank: 1, playerName: 'JOTA', score: 938, eventsEnabled: true },
    { rank: 2, playerName: 'NICO R.', score: 902, eventsEnabled: true },
    { rank: 3, playerName: 'LEO M.', score: 876, eventsEnabled: false },
  ],
  FUTBOL11: [
    { rank: 1, playerName: 'AGUSTÍN B.', score: 988, eventsEnabled: true },
    { rank: 2, playerName: 'MATEO G.', score: 945, eventsEnabled: true },
    { rank: 3, playerName: 'FRANCO D.', score: 912, eventsEnabled: true },
  ],
  FUTBOL5: [
    { rank: 1, playerName: 'SANTINO M.', score: 472, eventsEnabled: true },
    { rank: 2, playerName: 'LUCAS P.', score: 458, eventsEnabled: true },
    { rank: 3, playerName: 'BRUNO T.', score: 430, eventsEnabled: false },
  ],
};

/**
 * Consulta el Top 3 de cada modo desde Neon.
 */
export async function fetchLeaderboardTop3Async(): Promise<LeaderboardTop3Data> {
  try {
    const res = await fetch('/api/records/leaderboard');
    if (!res.ok) return DEFAULT_LEADERBOARD_TOP3;
    const data = await res.json();
    if (data && data.leaderboard) {
      return data.leaderboard;
    }
    return DEFAULT_LEADERBOARD_TOP3;
  } catch (err) {
    console.error('Error fetching leaderboard top 3:', err);
    return DEFAULT_LEADERBOARD_TOP3;
  }
}

export async function submitTriviaResult(playerName: string, score: number, timeSeconds: number): Promise<void> {
  try {
    await fetch('/api/trivia/result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerName, score, timeSeconds }),
    });
  } catch (err) {
    console.error('Error submitting trivia result:', err);
  }
}

export async function fetchTriviaLeaderboardAsync(): Promise<Array<{ rank: number; playerName: string; score: number; timeSeconds: number }>> {
  try {
    const res = await fetch('/api/trivia/leaderboard');
    if (!res.ok) return [];
    const data = await res.json();
    return data.entries || [];
  } catch (err) {
    console.error('Error fetching trivia leaderboard:', err);
    return [];
  }
}

export async function submitMayorOMenorResult(playerName: string, streak: number, dataset: 'GLOBAL' | 'SALTO'): Promise<void> {
  try {
    await fetch('/api/mayor-o-menor/result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerName, streak, dataset }),
    });
  } catch (err) {
    console.error('Error submitting mayor o menor result:', err);
  }
}

export async function fetchMayorOMenorLeaderboardAsync(dataset: 'GLOBAL' | 'SALTO'): Promise<Array<{ rank: number; playerName: string; streak: number }>> {
  try {
    const res = await fetch(`/api/mayor-o-menor/leaderboard?dataset=${dataset}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.entries || [];
  } catch (err) {
    console.error('Error fetching mayor o menor leaderboard:', err);
    return [];
  }
}

/**
 * Consulta las últimas partidas del DT desde Neon.
 */
export async function fetchPlayerRecentRunsAsync(playerName: string): Promise<any[]> {
  try {
    const res = await fetch(`/api/records/recent-player?name=${encodeURIComponent(playerName)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.runs || [];
  } catch (err) {
    console.error('Error fetching player recent runs:', err);
    return [];
  }
}


