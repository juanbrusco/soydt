import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import { PLAYERS_DB } from '../src/data/players';
import { PLAYERS_SALTO_DB } from '../src/data/salto/players';
import { generateSeedForRun, encodeRunCode } from '../src/utils/seedCode';
import { GameMode } from '../src/types/game';

export interface GlobalRecordItem {
  score: number;
  holder: string;
}

export interface GlobalRecordsResponse {
  connected: boolean;
  records: {
    FUTBOL11_SALTO: GlobalRecordItem;
    FUTBOL11: GlobalRecordItem;
    FUTBOL5: GlobalRecordItem;
  };
}

// Valores base iniciales mientras la base de datos se puebla de partidas reales
const INITIAL_FALLBACK_RECORDS = {
  FUTBOL11_SALTO: { score: 938, holder: 'JOTA' },
  FUTBOL11: { score: 988, holder: 'AGUSTÍN B.' },
  FUTBOL5: { score: 472, holder: 'SANTINO M.' },
};

let sqlClient: NeonQueryFunction<false, false> | null = null;
let isInitialized = false;

export function getSqlClient(): NeonQueryFunction<false, false> | null {
  const dbUrl = process.env.DATABASE_URL?.trim();
  if (!dbUrl) {
    return null;
  }

  if (!sqlClient) {
    sqlClient = neon(dbUrl);
  }

  return sqlClient;
}

export async function ensureTablesExist(): Promise<boolean> {
  const sql = getSqlClient();
  if (!sql) return false;

  if (isInitialized) return true;

  try {
    // 1. Tabla: users
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        email VARCHAR(150) UNIQUE,
        device_id VARCHAR(100),
        auth_provider VARCHAR(50) DEFAULT 'anonymous',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_active_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 2. Tabla: runs (historial de cada partida completada)
    await sql`
      CREATE TABLE IF NOT EXISTS runs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        player_name VARCHAR(100) NOT NULL,
        mode VARCHAR(50) NOT NULL,
        score INTEGER NOT NULL,
        formation_name VARCHAR(50),
        ranking_tier VARCHAR(100),
        run_code VARCHAR(100),
        selected_players JSONB,
        events_enabled BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 3. Tabla: records (récord máximo por usuario y modo)
    await sql`
      CREATE TABLE IF NOT EXISTS records (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        player_name VARCHAR(100) NOT NULL,
        mode VARCHAR(50) NOT NULL,
        best_score INTEGER NOT NULL,
        best_run_id INTEGER REFERENCES runs(id) ON DELETE SET NULL,
        run_code VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_user_mode UNIQUE (user_id, mode)
      )
    `;

    // 4. Índices
    await sql`CREATE INDEX IF NOT EXISTS idx_runs_mode_score ON runs (mode, score DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_records_mode_score ON records (mode, best_score DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_runs_created_at ON runs (created_at DESC)`;

    // 5. Tabla: friend_rooms (Salas para Torneos de Amigos)
    await sql`
      CREATE TABLE IF NOT EXISTS friend_rooms (
        id SERIAL PRIMARY KEY,
        code VARCHAR(12) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        mode VARCHAR(50) NOT NULL,
        run_code VARCHAR(100) NOT NULL,
        created_by VARCHAR(50) NOT NULL,
        max_players INTEGER DEFAULT 10,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 6. Tabla: friend_room_entries (Puntajes de participantes en la sala)
    await sql`
      CREATE TABLE IF NOT EXISTS friend_room_entries (
        id SERIAL PRIMARY KEY,
        room_code VARCHAR(12) NOT NULL,
        player_name VARCHAR(50) NOT NULL,
        score INTEGER NOT NULL,
        formation_name VARCHAR(50),
        ranking_tier VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_room_player UNIQUE (room_code, player_name)
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_room_entries_score ON friend_room_entries (room_code, score DESC, created_at ASC)`;

    // 7. Tabla: stats (estadísticas de partidas y dispositivos)
    await sql`
      CREATE TABLE IF NOT EXISTS stats (
        id SERIAL PRIMARY KEY,
        mode VARCHAR(50) NOT NULL,
        username VARCHAR(100) NOT NULL,
        score INTEGER,
        formation_name VARCHAR(50),
        run_code VARCHAR(100),
        device_info JSONB,
        user_agent TEXT,
        device_type VARCHAR(30),
        is_mobile BOOLEAN,
        screen_resolution VARCHAR(50),
        ip VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_stats_created_at ON stats (created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_stats_mode ON stats (mode)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_stats_username ON stats (username)`;

    isInitialized = true;
    console.log('[Neon DB] Tables (users, runs, records, friend_rooms, friend_room_entries, stats) verified successfully.');
    return true;
  } catch (error) {
    console.error('[Neon DB] Error creating tables:', error);
    return false;
  }
}

export async function fetchGlobalMaxRecords(): Promise<GlobalRecordsResponse> {
  const sql = getSqlClient();
  if (!sql) {
    return {
      connected: false,
      records: { ...INITIAL_FALLBACK_RECORDS },
    };
  }

  try {
    await ensureTablesExist();

    // Obtenemos el puntaje más alto de la historia y quién lo logró para cada modo
    const rows = await sql`
      WITH RankedRuns AS (
        SELECT 
          mode, 
          score, 
          player_name,
          ROW_NUMBER() OVER (PARTITION BY mode ORDER BY score DESC, created_at ASC) as rn
        FROM runs
      )
      SELECT mode, score, player_name 
      FROM RankedRuns 
      WHERE rn = 1
    `;

    const records = { ...INITIAL_FALLBACK_RECORDS };

    for (const row of rows) {
      const mode = row.mode as keyof typeof records;
      if (mode && records[mode]) {
        if (Number(row.score) >= records[mode].score) {
          records[mode] = {
            score: Number(row.score),
            holder: String(row.player_name || 'ANÓNIMO').trim().toUpperCase(),
          };
        }
      }
    }

    return {
      connected: true,
      records,
    };
  } catch (error) {
    console.error('[Neon DB] Error querying global records:', error);
    return {
      connected: false,
      records: { ...INITIAL_FALLBACK_RECORDS },
    };
  }
}

export async function insertGameRecord(params: {
  mode: string;
  score: number;
  playerName?: string;
  formationName?: string;
  rankingTier?: string;
  runCode?: string;
  selectedPlayers?: any[];
  eventsEnabled?: boolean;
}): Promise<{ success: boolean; runId?: number; isNewGlobalRecord?: boolean; error?: string }> {
  const sql = getSqlClient();
  if (!sql) {
    return { success: false, error: 'DATABASE_URL not configured' };
  }

  try {
    await ensureTablesExist();

    const cleanName = (params.playerName || 'DT ANÓNIMO').trim().slice(0, 50).toUpperCase();
    const cleanScore = Math.round(params.score);
    const cleanMode = params.mode.trim();
    const cleanRunCode = (params.runCode || '').trim();
    const cleanFormation = (params.formationName || '').trim();
    const cleanTier = (params.rankingTier || '').trim();
    const eventsEnabled = params.eventsEnabled ?? true;
    const selectedPlayersJson = params.selectedPlayers ? JSON.stringify(params.selectedPlayers) : null;

    // 1. Ver récord máximo previo global en ese modo
    const prevMax = await sql`
      SELECT COALESCE(MAX(score), 0) as max_score 
      FROM runs 
      WHERE mode = ${cleanMode}
    `;
    const previousHighScore = Number(prevMax[0]?.max_score || 0);

    // 2. Insertar en runs
    const inserted = await sql`
      INSERT INTO runs (
        player_name, 
        mode, 
        score, 
        formation_name, 
        ranking_tier, 
        run_code, 
        selected_players, 
        events_enabled
      )
      VALUES (
        ${cleanName}, 
        ${cleanMode}, 
        ${cleanScore}, 
        ${cleanFormation}, 
        ${cleanTier}, 
        ${cleanRunCode}, 
        ${selectedPlayersJson}::jsonb, 
        ${eventsEnabled}
      )
      RETURNING id
    `;

    const newRunId = Number(inserted[0]?.id);
    const isNewGlobalRecord = cleanScore > previousHighScore;

    return {
      success: true,
      runId: newRunId,
      isNewGlobalRecord,
    };
  } catch (error) {
    console.error('[Neon DB] Error inserting run record:', error);
    return { success: false, error: String(error) };
  }
}

export async function updateRunPlayerName(
  runId: number,
  playerName: string
): Promise<{ success: boolean; error?: string }> {
  const sql = getSqlClient();
  if (!sql) {
    return { success: false, error: 'DATABASE_URL not configured' };
  }

  try {
    const cleanName = (playerName || 'DT ANÓNIMO').trim().slice(0, 50).toUpperCase();
    await sql`
      UPDATE runs 
      SET player_name = ${cleanName}
      WHERE id = ${runId}
    `;

    return { success: true };
  } catch (error) {
    console.error('[Neon DB] Error updating run player_name:', error);
    return { success: false, error: String(error) };
  }
}

export async function getRecentRunsForPlayer(playerName: string, limit: number = 5): Promise<any[]> {
  const sql = getSqlClient();
  if (!sql) return [];

  try {
    await ensureTablesExist();
    const cleanName = (playerName || 'DT').trim().toUpperCase();
    const rows = await sql`
      SELECT id, mode, score, formation_name, ranking_tier, run_code, events_enabled, created_at
      FROM runs
      WHERE UPPER(player_name) = ${cleanName}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return rows;
  } catch (error) {
    console.error('[Neon DB] Error getting recent runs for player:', error);
    return [];
  }
}

export interface LeaderboardEntry {
  rank: number;
  playerName: string;
  score: number;
  eventsEnabled: boolean;
}

export interface LeaderboardResponse {
  connected: boolean;
  leaderboard: {
    FUTBOL11_SALTO: LeaderboardEntry[];
    FUTBOL11: LeaderboardEntry[];
    FUTBOL5: LeaderboardEntry[];
  };
}

const FALLBACK_LEADERBOARD: Record<string, Omit<LeaderboardEntry, 'rank'>[]> = {
  FUTBOL11_SALTO: [
    { playerName: 'JOTA', score: 938, eventsEnabled: true },
    { playerName: 'NICO R.', score: 902, eventsEnabled: true },
    { playerName: 'LEO M.', score: 876, eventsEnabled: false },
  ],
  FUTBOL11: [
    { playerName: 'AGUSTÍN B.', score: 988, eventsEnabled: true },
    { playerName: 'MATEO G.', score: 945, eventsEnabled: true },
    { playerName: 'FRANCO D.', score: 912, eventsEnabled: true },
  ],
  FUTBOL5: [
    { playerName: 'SANTINO M.', score: 472, eventsEnabled: true },
    { playerName: 'LUCAS P.', score: 458, eventsEnabled: true },
    { playerName: 'BRUNO T.', score: 430, eventsEnabled: false },
  ],
};

export async function fetchLeaderboardTop3(): Promise<LeaderboardResponse> {
  const sql = getSqlClient();
  if (!sql) {
    return {
      connected: false,
      leaderboard: {
        FUTBOL11_SALTO: FALLBACK_LEADERBOARD.FUTBOL11_SALTO.map((item, idx) => ({ rank: idx + 1, ...item })),
        FUTBOL11: FALLBACK_LEADERBOARD.FUTBOL11.map((item, idx) => ({ rank: idx + 1, ...item })),
        FUTBOL5: FALLBACK_LEADERBOARD.FUTBOL5.map((item, idx) => ({ rank: idx + 1, ...item })),
      },
    };
  }

  try {
    await ensureTablesExist();

    const modes = ['FUTBOL11_SALTO', 'FUTBOL11', 'FUTBOL5'] as const;
    const result: any = {};

    for (const mode of modes) {
      const rows = await sql`
        SELECT player_name, score, events_enabled
        FROM runs
        WHERE mode = ${mode}
        ORDER BY score DESC, created_at ASC
        LIMIT 3
      `;

      const dbEntries: Omit<LeaderboardEntry, 'rank'>[] = rows.map((r: any) => ({
        playerName: String(r.player_name || 'DT').trim().toUpperCase(),
        score: Number(r.score) || 0,
        eventsEnabled: r.events_enabled !== false,
      }));

      const combined = [...dbEntries];
      const fallbackList = FALLBACK_LEADERBOARD[mode] || [];
      for (const fb of fallbackList) {
        if (combined.length >= 3) break;
        if (!combined.some((c) => c.playerName === fb.playerName && c.score === fb.score)) {
          combined.push(fb);
        }
      }

      combined.sort((a, b) => b.score - a.score);

      result[mode] = combined.slice(0, 3).map((item, idx) => ({
        rank: idx + 1,
        playerName: item.playerName,
        score: item.score,
        eventsEnabled: item.eventsEnabled,
      }));
    }

    return {
      connected: true,
      leaderboard: result,
    };
  } catch (error) {
    console.error('[Neon DB] Error querying leaderboard top 3:', error);
    return {
      connected: false,
      leaderboard: {
        FUTBOL11_SALTO: FALLBACK_LEADERBOARD.FUTBOL11_SALTO.map((item, idx) => ({ rank: idx + 1, ...item })),
        FUTBOL11: FALLBACK_LEADERBOARD.FUTBOL11.map((item, idx) => ({ rank: idx + 1, ...item })),
        FUTBOL5: FALLBACK_LEADERBOARD.FUTBOL5.map((item, idx) => ({ rank: idx + 1, ...item })),
      },
    };
  }
}


export async function checkConnection(): Promise<{ connected: boolean; message: string }> {
  const sql = getSqlClient();
  if (!sql) {
    return {
      connected: false,
      message: 'DATABASE_URL no está configurada en las variables de entorno.',
    };
  }

  try {
    const result = await sql`SELECT NOW() as current_time`;
    return {
      connected: true,
      message: `Conexión a Neon PostgreSQL exitosa. Timestamp del servidor: ${result[0]?.current_time}`,
    };
  } catch (error: any) {
    return {
      connected: false,
      message: `Error al conectar con Neon: ${error?.message || error}`,
    };
  }
}

export interface DbPlayer {
  id: string;
  name: string;
  ovr: number;
  primaryPosition: string;
  position: string;
  club: string;
  emoji: string;
  country: string;
  nationality: string;
  dataset?: string;
}

const PLAYERS_CACHE: {
  [key: string]: { data: DbPlayer[]; timestamp: number };
} = {};

const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutos

export async function fetchPlayersFromDb(
  datasetFilter?: 'GLOBAL' | 'SALTO' | 'ALL',
  bypassCache = false
): Promise<{
  success: boolean;
  count: number;
  dataset: string;
  source: 'db' | 'cache' | 'fallback';
  players: DbPlayer[];
}> {
  const targetDataset = datasetFilter || 'ALL';
  const now = Date.now();

  // 1. Revisar caché en memoria
  if (!bypassCache && PLAYERS_CACHE[targetDataset]) {
    const cached = PLAYERS_CACHE[targetDataset];
    if (now - cached.timestamp < CACHE_TTL_MS) {
      return {
        success: true,
        count: cached.data.length,
        dataset: targetDataset,
        source: 'cache',
        players: cached.data,
      };
    }
  }

  const sql = getSqlClient();
  if (!sql) {
    console.warn('[Neon DB] No DATABASE_URL found, using local fallback players');
    const fallbackList =
      targetDataset === 'SALTO'
        ? (PLAYERS_SALTO_DB as DbPlayer[])
        : targetDataset === 'GLOBAL'
        ? (PLAYERS_DB as DbPlayer[])
        : ([...PLAYERS_DB, ...PLAYERS_SALTO_DB] as DbPlayer[]);

    return {
      success: true,
      count: fallbackList.length,
      dataset: targetDataset,
      source: 'fallback',
      players: fallbackList,
    };
  }

  try {
    let rows: any[] = [];

    if (targetDataset === 'SALTO') {
      rows = await sql`
        SELECT 
          id, 
          name, 
          ovr, 
          primary_position AS "primaryPosition", 
          position, 
          club, 
          COALESCE(emoji, '') AS emoji, 
          COALESCE(country, '') AS country, 
          COALESCE(nationality, '') AS nationality,
          COALESCE(dataset, 'SALTO') AS dataset
        FROM players
        WHERE dataset = 'SALTO' OR id LIKE 'salto_%'
        ORDER BY ovr DESC, name ASC;
      `;
    } else if (targetDataset === 'GLOBAL') {
      rows = await sql`
        SELECT 
          id, 
          name, 
          ovr, 
          primary_position AS "primaryPosition", 
          position, 
          club, 
          COALESCE(emoji, '') AS emoji, 
          COALESCE(country, '') AS country, 
          COALESCE(nationality, '') AS nationality,
          COALESCE(dataset, 'GLOBAL') AS dataset
        FROM players
        WHERE (dataset = 'GLOBAL' OR dataset IS NULL) AND id NOT LIKE 'salto_%'
        ORDER BY ovr DESC, name ASC;
      `;
    } else {
      rows = await sql`
        SELECT 
          id, 
          name, 
          ovr, 
          primary_position AS "primaryPosition", 
          position, 
          club, 
          COALESCE(emoji, '') AS emoji, 
          COALESCE(country, '') AS country, 
          COALESCE(nationality, '') AS nationality,
          COALESCE(dataset, 'GLOBAL') AS dataset
        FROM players
        ORDER BY ovr DESC, name ASC;
      `;
    }

    const mappedPlayers: DbPlayer[] = rows.map((r) => ({
      id: String(r.id),
      name: String(r.name),
      ovr: Number(r.ovr),
      primaryPosition: String(r.primaryPosition || r.position),
      position: String(r.position || r.primaryPosition),
      club: String(r.club || ''),
      emoji: String(r.emoji || ''),
      country: String(r.country || ''),
      nationality: String(r.nationality || ''),
      dataset: String(r.dataset || ''),
    }));

    // Actualizar caché
    PLAYERS_CACHE[targetDataset] = {
      data: mappedPlayers,
      timestamp: now,
    };

    return {
      success: true,
      count: mappedPlayers.length,
      dataset: targetDataset,
      source: 'db',
      players: mappedPlayers,
    };
  } catch (err: any) {
    console.error('[Neon DB] Error querying players from database, using fallback:', err);
    const fallbackList =
      targetDataset === 'SALTO'
        ? (PLAYERS_SALTO_DB as DbPlayer[])
        : targetDataset === 'GLOBAL'
        ? (PLAYERS_DB as DbPlayer[])
        : ([...PLAYERS_DB, ...PLAYERS_SALTO_DB] as DbPlayer[]);

    return {
      success: true,
      count: fallbackList.length,
      dataset: targetDataset,
      source: 'fallback',
      players: fallbackList,
    };
  }
}

// Memory fallback if DB is not configured or offline
interface MemoryFriendRoom {
  code: string;
  name: string;
  mode: GameMode;
  runCode: string;
  createdBy: string;
  maxPlayers: number;
  createdAt: string;
}

interface MemoryFriendRoomEntry {
  roomCode: string;
  playerName: string;
  score: number;
  formationName?: string;
  rankingTier?: string;
  createdAt: string;
}

const MEMORY_ROOMS = new Map<string, MemoryFriendRoom>();
const MEMORY_ROOM_ENTRIES = new Map<string, MemoryFriendRoomEntry[]>();

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function createFriendRoom(params: {
  name?: string;
  mode: 'FUTBOL11' | 'FUTBOL11_SALTO';
  createdBy: string;
}): Promise<{ success: boolean; room?: any; error?: string }> {
  const cleanMode: GameMode = params.mode === 'FUTBOL11_SALTO' ? 'FUTBOL11_SALTO' : 'FUTBOL11';
  const cleanName = (params.name || 'El Trofeo de la Fecha').trim().slice(0, 50) || 'El Trofeo de la Fecha';
  const cleanCreatedBy = (params.createdBy || 'DT').trim().slice(0, 30).toUpperCase() || 'DT';

  const { seed } = generateSeedForRun(cleanMode);
  const runCode = encodeRunCode(seed, cleanMode, 0);

  const sql = getSqlClient();
  let code = generateRoomCode();

  if (sql) {
    try {
      await ensureTablesExist();

      // Ensure code is unique
      let attempts = 0;
      while (attempts < 5) {
        const existing = await sql`SELECT id FROM friend_rooms WHERE code = ${code} LIMIT 1`;
        if (existing.length === 0) break;
        code = generateRoomCode();
        attempts++;
      }

      await sql`
        INSERT INTO friend_rooms (code, name, mode, run_code, created_by, max_players)
        VALUES (${code}, ${cleanName}, ${cleanMode}, ${runCode}, ${cleanCreatedBy}, 10)
      `;

      return {
        success: true,
        room: {
          code,
          name: cleanName,
          mode: cleanMode,
          runCode,
          createdBy: cleanCreatedBy,
          maxPlayers: 10,
          createdAt: new Date().toISOString(),
          entries: [],
          totalPlayers: 0,
          isFull: false,
        },
      };
    } catch (err: any) {
      console.error('[Neon DB] Error creating friend room in DB, fallback to memory:', err);
    }
  }

  // Fallback memory
  MEMORY_ROOMS.set(code, {
    code,
    name: cleanName,
    mode: cleanMode,
    runCode,
    createdBy: cleanCreatedBy,
    maxPlayers: 10,
    createdAt: new Date().toISOString(),
  });
  MEMORY_ROOM_ENTRIES.set(code, []);

  return {
    success: true,
    room: {
      code,
      name: cleanName,
      mode: cleanMode,
      runCode,
      createdBy: cleanCreatedBy,
      maxPlayers: 10,
      createdAt: new Date().toISOString(),
      entries: [],
      totalPlayers: 0,
      isFull: false,
    },
  };
}

export async function getFriendRoom(code: string): Promise<{ success: boolean; room?: any; error?: string }> {
  const cleanCode = (code || '').trim().toUpperCase();
  if (!cleanCode) {
    return { success: false, error: 'CÓDIGO_INVÁLIDO' };
  }

  const sql = getSqlClient();
  if (sql) {
    try {
      await ensureTablesExist();

      const roomRows = await sql`
        SELECT code, name, mode, run_code, created_by, max_players, created_at
        FROM friend_rooms
        WHERE code = ${cleanCode}
        LIMIT 1
      `;

      if (roomRows.length === 0) {
        const memRoom = MEMORY_ROOMS.get(cleanCode);
        if (!memRoom) {
          return { success: false, error: 'SALA_NO_ENCONTRADA' };
        }
        const memEntries = MEMORY_ROOM_ENTRIES.get(cleanCode) || [];
        const sortedMem = [...memEntries].sort((a, b) => b.score - a.score);
        return {
          success: true,
          room: {
            ...memRoom,
            entries: sortedMem.map((e, idx) => ({ ...e, rank: idx + 1 })),
            totalPlayers: sortedMem.length,
            isFull: sortedMem.length >= memRoom.maxPlayers,
          },
        };
      }

      const r = roomRows[0];
      const entryRows = await sql`
        SELECT id, player_name, score, formation_name, ranking_tier, created_at
        FROM friend_room_entries
        WHERE room_code = ${cleanCode}
        ORDER BY score DESC, created_at ASC
      `;

      const entries = entryRows.map((e, idx) => ({
        id: Number(e.id),
        playerName: String(e.player_name),
        score: Number(e.score),
        formationName: e.formation_name ? String(e.formation_name) : undefined,
        rankingTier: e.ranking_tier ? String(e.ranking_tier) : undefined,
        createdAt: e.created_at ? new Date(e.created_at).toISOString() : new Date().toISOString(),
        rank: idx + 1,
      }));

      const maxPlayers = Number(r.max_players) || 10;
      return {
        success: true,
        room: {
          code: String(r.code),
          name: String(r.name),
          mode: String(r.mode) as GameMode,
          runCode: String(r.run_code),
          createdBy: String(r.created_by),
          maxPlayers,
          createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
          entries,
          totalPlayers: entries.length,
          isFull: entries.length >= maxPlayers,
        },
      };
    } catch (err: any) {
      console.error('[Neon DB] Error getting friend room from DB:', err);
    }
  }

  // Memory fallback
  const memRoom = MEMORY_ROOMS.get(cleanCode);
  if (!memRoom) {
    return { success: false, error: 'SALA_NO_ENCONTRADA' };
  }
  const memEntries = MEMORY_ROOM_ENTRIES.get(cleanCode) || [];
  const sortedMem = [...memEntries].sort((a, b) => b.score - a.score);
  return {
    success: true,
    room: {
      ...memRoom,
      entries: sortedMem.map((e, idx) => ({ ...e, rank: idx + 1 })),
      totalPlayers: sortedMem.length,
      isFull: sortedMem.length >= memRoom.maxPlayers,
    },
  };
}

export async function addFriendRoomEntry(params: {
  roomCode: string;
  playerName: string;
  score: number;
  formationName?: string;
  rankingTier?: string;
}): Promise<{ success: boolean; rank?: number; totalPlayers?: number; error?: string; message?: string }> {
  const cleanCode = (params.roomCode || '').trim().toUpperCase();
  const cleanName = (params.playerName || 'DT').trim().slice(0, 30).toUpperCase();
  const cleanScore = Math.round(params.score);

  if (!cleanCode || !cleanName) {
    return { success: false, error: 'DATOS_INVÁLIDOS', message: 'Código de sala y nombre son requeridos' };
  }

  const sql = getSqlClient();
  if (sql) {
    try {
      await ensureTablesExist();

      // Check room exists and limit
      const roomRows = await sql`
        SELECT code, max_players FROM friend_rooms WHERE code = ${cleanCode} LIMIT 1
      `;
      if (roomRows.length === 0) {
        return { success: false, error: 'SALA_NO_ENCONTRADA', message: 'La sala especificada no existe' };
      }

      const maxPlayers = Number(roomRows[0].max_players) || 10;

      // Check existing entries
      const entries = await sql`
        SELECT player_name FROM friend_room_entries WHERE room_code = ${cleanCode}
      `;

      if (entries.length >= maxPlayers) {
        return { success: false, error: 'SALA_LLENA', message: 'La sala ya alcanzó el máximo de 10 participantes' };
      }

      const alreadyExists = entries.some(
        (e) => String(e.player_name).toUpperCase() === cleanName
      );
      if (alreadyExists) {
        return {
          success: false,
          error: 'APODO_YA_UTILIZADO',
          message: 'Este apodo ya jugó su partido en esta sala. Solo se permite 1 intento por persona.',
        };
      }

      await sql`
        INSERT INTO friend_room_entries (room_code, player_name, score, formation_name, ranking_tier)
        VALUES (${cleanCode}, ${cleanName}, ${cleanScore}, ${params.formationName || null}, ${params.rankingTier || null})
      `;

      // Get rank
      const updated = await sql`
        SELECT player_name, score FROM friend_room_entries 
        WHERE room_code = ${cleanCode}
        ORDER BY score DESC, created_at ASC
      `;

      const rank = updated.findIndex((e) => String(e.player_name).toUpperCase() === cleanName) + 1;

      return {
        success: true,
        rank: rank > 0 ? rank : updated.length,
        totalPlayers: updated.length,
      };
    } catch (err: any) {
      console.error('[Neon DB] Error adding friend room entry to DB:', err);
    }
  }

  // Memory fallback
  const memRoom = MEMORY_ROOMS.get(cleanCode);
  if (!memRoom) {
    return { success: false, error: 'SALA_NO_ENCONTRADA', message: 'La sala no existe' };
  }
  const currentEntries = MEMORY_ROOM_ENTRIES.get(cleanCode) || [];
  if (currentEntries.length >= memRoom.maxPlayers) {
    return { success: false, error: 'SALA_LLENA', message: 'La sala ya está llena' };
  }
  if (currentEntries.some((e) => e.playerName.toUpperCase() === cleanName)) {
    return {
      success: false,
      error: 'APODO_YA_UTILIZADO',
      message: 'Este apodo ya jugó en esta sala (1 intento por persona)',
    };
  }

  currentEntries.push({
    roomCode: cleanCode,
    playerName: cleanName,
    score: cleanScore,
    formationName: params.formationName,
    rankingTier: params.rankingTier,
    createdAt: new Date().toISOString(),
  });
  MEMORY_ROOM_ENTRIES.set(cleanCode, currentEntries);

  currentEntries.sort((a, b) => b.score - a.score);
  const rank = currentEntries.findIndex((e) => e.playerName === cleanName) + 1;

  return {
    success: true,
    rank: rank > 0 ? rank : currentEntries.length,
    totalPlayers: currentEntries.length,
  };
}

export async function deleteFriendRoom(code: string): Promise<{ success: boolean; error?: string }> {
  const cleanCode = (code || '').trim().toUpperCase();
  if (!cleanCode) {
    return { success: false, error: 'CÓDIGO_INVÁLIDO' };
  }

  const sql = getSqlClient();
  if (sql) {
    try {
      await ensureTablesExist();
      await sql`DELETE FROM friend_room_entries WHERE room_code = ${cleanCode}`;
      await sql`DELETE FROM friend_rooms WHERE code = ${cleanCode}`;
    } catch (err: any) {
      console.error('[Neon DB] Error deleting friend room:', err);
    }
  }

  MEMORY_ROOMS.delete(cleanCode);
  MEMORY_ROOM_ENTRIES.delete(cleanCode);

  return { success: true };
}

// ----------------------------------------------------
// 7. Estadísticas de Partidas y Dispositivos (Stats)
// ----------------------------------------------------
export interface StatRecord {
  id?: number;
  mode: string;
  username: string;
  score?: number;
  formation_name?: string;
  run_code?: string;
  device_info?: any;
  user_agent?: string;
  device_type?: string;
  is_mobile?: boolean;
  screen_resolution?: string;
  ip?: string;
  created_at: string;
}

const MEMORY_STATS: StatRecord[] = [];

export async function saveGameStat(params: {
  mode: string;
  username: string;
  score?: number;
  formationName?: string;
  runCode?: string;
  deviceInfo?: any;
  userAgent?: string;
  ip?: string;
}): Promise<{ success: boolean; id?: number }> {
  const cleanMode = (params.mode || 'FUTBOL11').trim().toUpperCase();
  const cleanUsername = (params.username || 'DT').trim().toUpperCase();
  const cleanScore = typeof params.score === 'number' ? params.score : null;
  const formationName = params.formationName ? String(params.formationName).slice(0, 50) : null;
  const runCode = params.runCode ? String(params.runCode).slice(0, 100) : null;
  const deviceInfo = params.deviceInfo || {};
  const userAgent = params.userAgent || (typeof deviceInfo.userAgent === 'string' ? deviceInfo.userAgent : '');
  const deviceType = deviceInfo.deviceType ? String(deviceInfo.deviceType).slice(0, 30) : null;
  const isMobile = typeof deviceInfo.isMobile === 'boolean' ? deviceInfo.isMobile : null;
  const screenRes = deviceInfo.screenResolution ? String(deviceInfo.screenResolution).slice(0, 50) : null;
  const ip = params.ip ? String(params.ip).slice(0, 100) : '';
  const now = new Date().toISOString();

  const sql = getSqlClient();
  if (sql) {
    try {
      await ensureTablesExist();
      const rows = await sql`
        INSERT INTO stats (
          mode, 
          username, 
          score, 
          formation_name, 
          run_code, 
          device_info, 
          user_agent, 
          device_type, 
          is_mobile, 
          screen_resolution, 
          ip, 
          created_at
        )
        VALUES (
          ${cleanMode}, 
          ${cleanUsername}, 
          ${cleanScore}, 
          ${formationName}, 
          ${runCode}, 
          ${JSON.stringify(deviceInfo)}, 
          ${userAgent}, 
          ${deviceType}, 
          ${isMobile}, 
          ${screenRes}, 
          ${ip}, 
          CURRENT_TIMESTAMP
        )
        RETURNING id
      `;
      if (rows && rows.length > 0) {
        return { success: true, id: rows[0].id };
      }
    } catch (err) {
      console.error('[Neon DB] Error saving game stat:', err);
    }
  }

  // Respaldo en memoria
  const memRecord: StatRecord = {
    id: MEMORY_STATS.length + 1,
    mode: cleanMode,
    username: cleanUsername,
    score: cleanScore ?? undefined,
    formation_name: formationName ?? undefined,
    run_code: runCode ?? undefined,
    device_info: deviceInfo,
    user_agent: userAgent,
    device_type: deviceType ?? undefined,
    is_mobile: isMobile ?? undefined,
    screen_resolution: screenRes ?? undefined,
    ip,
    created_at: now,
  };
  MEMORY_STATS.push(memRecord);
  if (MEMORY_STATS.length > 500) {
    MEMORY_STATS.shift(); // Evitar consumo excesivo de memoria
  }

  return { success: true, id: memRecord.id };
}

export async function getGameStats(limit: number = 50): Promise<StatRecord[]> {
  const sql = getSqlClient();
  if (sql) {
    try {
      await ensureTablesExist();
      const rows = await sql`
        SELECT 
          id, 
          mode, 
          username, 
          score, 
          formation_name, 
          run_code, 
          device_info, 
          user_agent, 
          device_type, 
          is_mobile, 
          screen_resolution, 
          ip, 
          created_at
        FROM stats
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
      return rows as StatRecord[];
    } catch (err) {
      console.error('[Neon DB] Error fetching stats:', err);
    }
  }

  return [...MEMORY_STATS].reverse().slice(0, limit);
}


