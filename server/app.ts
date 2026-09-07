import express from 'express';
import dotenv from 'dotenv';
import { 
  fetchGlobalMaxRecords, 
  insertGameRecord, 
  updateRunPlayerName, 
  getRecentRunsForPlayer, 
  fetchLeaderboardTop3, 
  checkConnection,
  fetchPlayersFromDb,
  createFriendRoom,
  getFriendRoom,
  addFriendRoomEntry,
  deleteFriendRoom,
  saveGameStat,
  getGameStats
} from './db';

dotenv.config();

/**
 * Crea y configura la aplicación Express con todas las rutas /api.
 * Esta función desacopla la lógica de Express del listener de sockets (app.listen),
 * permitiendo ejecutar la app tanto en servidores tradicionales (Docker / Cloud Run)
 * como en entornos Serverless (Vercel Functions).
 */
export function createExpressApp() {
  const app = express();

  app.use(express.json());

  // Middleware CORS para permitir peticiones si el frontend se encuentra en otro subdominio de Vercel
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });

  const apiRouter = express.Router();

  // 1. Health check
  apiRouter.get('/health', (_req, res) => {
    res.json({ status: 'ok', server: 'SoyDT Express Server' });
  });

  // 2. Neon Database status check
  apiRouter.get('/records/status', async (_req, res) => {
    try {
      const status = await checkConnection();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ connected: false, message: err?.message || 'Unknown error' });
    }
  });

  // 3. Global highscore records
  apiRouter.get('/records/global', async (_req, res) => {
    try {
      const data = await fetchGlobalMaxRecords();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to fetch global records' });
    }
  });

  // 4. Save game record
  apiRouter.post('/records', async (req, res) => {
    try {
      const { 
        mode, 
        score, 
        playerName, 
        formationName, 
        rankingTier, 
        runCode, 
        selectedPlayers, 
        eventsEnabled 
      } = req.body || {};

      if (!mode || typeof score !== 'number') {
        res.status(400).json({ error: 'Parámetros inválidos: mode y score son requeridos.' });
        return;
      }

      const result = await insertGameRecord({ 
        mode, 
        score, 
        playerName, 
        formationName, 
        rankingTier, 
        runCode, 
        selectedPlayers, 
        eventsEnabled 
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Error guardando registro' });
    }
  });

  // 5. Update player name for a run
  apiRouter.post('/records/update-name', async (req, res) => {
    try {
      const { runId, playerName } = req.body || {};
      if (!runId || !playerName) {
        res.status(400).json({ error: 'runId y playerName son requeridos.' });
        return;
      }
      const result = await updateRunPlayerName(Number(runId), String(playerName));
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Error actualizando nombre' });
    }
  });

  // 6. Get recent runs for player
  apiRouter.get('/records/recent-player', async (req, res) => {
    try {
      const playerName = String(req.query.name || 'DT');
      const runs = await getRecentRunsForPlayer(playerName, 5);
      res.json({ success: true, runs });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Error obteniendo historial' });
    }
  });

  // 7. Get Top 3 leaderboard for each mode
  apiRouter.get('/records/leaderboard', async (_req, res) => {
    try {
      const data = await fetchLeaderboardTop3();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Error obteniendo leaderboard' });
    }
  });

  // 8. Get Players from Neon DB (with cache & fallback)
  apiRouter.get('/players', async (req, res) => {
    try {
      const modeParam = String(req.query.mode || '').trim().toLowerCase();
      const datasetParam = String(req.query.dataset || '').trim().toUpperCase();
      const refreshParam = req.query.refresh === 'true' || req.query.refresh === '1';

      let datasetFilter: 'GLOBAL' | 'SALTO' | 'ALL' = 'ALL';

      if (modeParam === 'salto' || modeParam === 'futbol11_salto' || datasetParam === 'SALTO') {
        datasetFilter = 'SALTO';
      } else if (
        modeParam === 'global' || 
        modeParam === 'futbol11' || 
        modeParam === 'futbol5' || 
        datasetParam === 'GLOBAL'
      ) {
        datasetFilter = 'GLOBAL';
      } else if (datasetParam === 'ALL') {
        datasetFilter = 'ALL';
      }

      const result = await fetchPlayersFromDb(datasetFilter, refreshParam);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Error obteniendo jugadores' });
    }
  });

  // 9. Friend Rooms: Create Room
  apiRouter.post('/rooms', async (req, res) => {
    try {
      const { name, mode, createdBy } = req.body || {};
      const result = await createFriendRoom({ name, mode, createdBy });
      if (!result.success) {
        return res.status(400).json(result);
      }
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Error creando sala' });
    }
  });

  // 10. Friend Rooms: Get Room Info & Leaderboard
  apiRouter.get('/rooms/:code', async (req, res) => {
    try {
      const code = String(req.params.code || '').trim().toUpperCase();
      const result = await getFriendRoom(code);
      if (!result.success) {
        return res.status(404).json(result);
      }
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Error obteniendo sala' });
    }
  });

  // 11. Friend Rooms: Submit Entry (Score) to Room
  apiRouter.post('/rooms/:code/entry', async (req, res) => {
    try {
      const roomCode = String(req.params.code || '').trim().toUpperCase();
      const { playerName, score, formationName, rankingTier } = req.body || {};
      const result = await addFriendRoomEntry({
        roomCode,
        playerName,
        score,
        formationName,
        rankingTier,
      });
      if (!result.success) {
        return res.status(400).json(result);
      }
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Error registrando partida en sala' });
    }
  });

  // 12. Delete / Close Friend Room
  apiRouter.delete('/rooms/:code', async (req, res) => {
    try {
      const roomCode = String(req.params.code || '').trim().toUpperCase();
      const result = await deleteFriendRoom(roomCode);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Error eliminando sala' });
    }
  });

  // 13. Game & Device Stats (guardar estadísticas de forma silenciosa)
  apiRouter.post('/stats', async (req, res) => {
    try {
      const { mode, username, score, formationName, runCode, deviceInfo } = req.body || {};
      const userAgent = (req.headers['user-agent'] as string) || (deviceInfo && deviceInfo.userAgent) || '';
      const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '';

      const result = await saveGameStat({
        mode,
        username,
        score,
        formationName,
        runCode,
        deviceInfo: {
          ...(deviceInfo || {}),
          serverUserAgent: userAgent,
        },
        userAgent,
        ip,
      });

      res.json(result);
    } catch (err: any) {
      res.json({ success: false, error: err?.message || 'Error guardando estadística' });
    }
  });

  apiRouter.get('/stats', async (_req, res) => {
    try {
      const stats = await getGameStats(50);
      res.json({ success: true, stats });
    } catch (err: any) {
      res.json({ success: false, stats: [] });
    }
  });

  // Montamos las rutas tanto en '/api' como en '/' para máxima compatibilidad
  // con reescrituras de URL en Vercel y llamadas locales
  app.use('/api', apiRouter);
  app.use('/', apiRouter);

  return app;
}

export const app = createExpressApp();
export default app;
