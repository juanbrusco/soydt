# AGENTS.md — Contexto Técnico & Arquitectura del Proyecto

Este documento proporciona una especificación técnica exhaustiva y precisa de **SoyDT**, diseñada para que cualquier agente de Inteligencia Artificial o desarrollador senior comprenda la arquitectura completa, el stack tecnológico, el modelo de datos, los flujos de API y las restricciones operativas sin ambigüedades.

---

## 1. Project Overview & Tech Stack

### 1.1. Propósito del Proyecto
**SoyDT** es un videojuego web táctico de fútbol estilo roguelike/draft. Los jugadores seleccionan una formación táctica (ej. 4-3-3 en Fútbol 11 o 1-2-1 en Fútbol 5), draftean futbolistas posición por posición según opciones aleatorias o semillas reproducibles, enfrentan eventos tácticos y dilemas de vestuario ("Quilombos"), resuelven minijuegos basados en timing o lógica, y calculan un puntaje de evaluación táctica final.

El juego incluye:
- Modos de juego: `FUTBOL11` (plantillas internacionales), `FUTBOL11_SALTO` (plantel de la Liga Salteña de Fútbol), y `FUTBOL5`.
- Torneos de amigos (`friend_rooms`): creación de salas compartibles por enlace/código con tabla de posiciones cerrada de hasta 10 participantes con la misma semilla táctica.
- Leaderboard global histórico y personal sincronizado en la nube.
- Telemetría y estadísticas no invasivas de partidas y dispositivos (`stats`).

### 1.2. Tech Stack & Dependencias Clave
- **Frontend Core**: **React 19** (`19.0.1`), **React DOM** (`19.0.1`).
- **Build Tool & Dev Server**: **Vite 6** (`6.2.3`) con plugin oficial `@vitejs/plugin-react` (`5.0.4`).
- **Styling**: **Tailwind CSS v4** (`4.1.14`) vía plugin oficial `@tailwindcss/vite`.
- **Backend / API**: **Express 4** (`4.21.2`) ejecutado con `tsx` en desarrollo y empaquetado como serverless monolith o bundle Node CJS en producción.
- **Database Driver**: `@neondatabase/serverless` (`1.1.0`) para conexión a **PostgreSQL Serverless en Neon** sobre HTTP/WebSockets con pooling sin conexiones TCP duraderas.
- **Animaciones & UI**: `motion` (`12.23.24`) para transiciones declarativas de alta fidelidad, `lucide-react` (`0.546.0`) para iconografía uniforme.
- **Bundler de Servidor**: `esbuild` (`0.25.0`) para compilar `server.ts` a `dist/server.cjs` en builds de contenedor.
- **Configuración & Env**: `dotenv` (`17.2.3`).

---

## 2. Architecture & Backend Structure

El backend está diseñado bajo el patrón **Serverless Monolith (Monolito Serverless)**. En lugar de fragmentar la lógica en decenas de funciones independientes que duplican conexiones e importaciones, toda la API se orquesta en una aplicación Express modular que se desacopla del servidor de sockets.

```
┌─────────────────────────────────────────────────────────────┐
│                      SoyDT Web Client                       │
│           (React 19 + Tailwind v4 + Vite SPA)               │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
    [Local / Container Runtime]       [Vercel Serverless Edge]
               │                               │
       ┌───────▼────────┐             ┌────────▼────────┐
       │   server.ts    │             │   api/index.ts  │
       │(app.listen:3000│             │(Serverless Hndlr│
       │+ Vite Dev / SPA│             │   vercel.json)  │
       └───────┬────────┘             └────────┬────────┘
               │                               │
               └───────────────┬───────────────┘
                               │
                      ┌────────▼────────┐
                      │  server/app.ts  │
                      │ (Express App +  │
                      │  API Router)    │
                      └────────┬────────┘
                               │
                      ┌────────▼────────┐
                      │  server/db.ts   │
                      │(Neon PostgreSQL │
                      │+ Memory Fallback│
                      └─────────────────┘
```

### 2.1. Desacoplamiento de la App Express (`server/app.ts`)
- La función `createExpressApp()` instancia y configura Express:
  - Middlewares base: `express.json()`, CORS permisivo con soporte explícito para preflight requests (`OPTIONS`).
  - Creación de un `express.Router()` con todos los endpoints bajo `/api` y montado simultáneamente en la raíz (`/`) para evitar inconsistencias con reescrituras de Vercel.
  - Exporta una instancia singleton `app`.

### 2.2. Entrada para Vercel Serverless (`api/index.ts` & `vercel.json`)
- **`api/index.ts`**:
  ```typescript
  import { app } from '../server/app';
  export default function handler(req: any, res: any) {
    return app(req, res);
  }
  export { app };
  ```
- **`vercel.json`**:
  Configura las reglas de reescritura para que cualquier petición hacia `/api/*` sea canalizada a la función serverless `api/index.ts`, mientras que el resto de las rutas caen al `index.html` de la SPA:
  ```json
  {
    "version": 2,
    "rewrites": [
      { "source": "/api/(.*)", "destination": "/api/index" },
      { "source": "/(.*)", "destination": "/index.html" }
    ]
  }
  ```

### 2.3. Servidor Autónomo & Dev Server (`server.ts`)
- Para entornos basados en contenedores (Google Cloud Run / Docker) y desarrollo local en puerto `3000`:
  - En desarrollo (`NODE_ENV !== 'production'`), levanta el middleware de Vite (`createServer({ server: { middlewareMode: true }, appType: 'spa' })`) permitiendo HMR y compilación instantánea.
  - En producción, sirve los archivos estáticos desde `dist/` y devuelve `index.html` para cualquier ruta desconocida.
  - Invoca `app.listen(3000, '0.0.0.0')`.

---

## 3. Database & API Endpoints

### 3.1. Conexión a Neon PostgreSQL (`server/db.ts`)
- **Driver**: `@neondatabase/serverless` ejecutando `neon(process.env.DATABASE_URL)`.
- **Estrategia Fallback / Resiliencia Zero-Crash**:
  Si la variable de entorno `DATABASE_URL` no está definida o si la base de datos es inalcanzable, el módulo recurre a estructuras de datos en memoria (`MEMORY_RUNS`, `MEMORY_RECORDS`, `MEMORY_ROOMS`, `MEMORY_STATS`, etc.). Esto permite que la aplicación funcione al 100% de manera offline, en entornos de test o durante interrupciones temporales de red.
- **Auto-migración / Idempotencia**: La función `ensureTablesExist()` valida y ejecuta sentencias `CREATE TABLE IF NOT EXISTS` e índices al recibir la primera solicitud.

### 3.2. Esquema de Tablas Principales

| Tabla | Columnas Clave | Índices / Restricciones | Propósito |
| :--- | :--- | :--- | :--- |
| **`users`** | `id (SERIAL PK)`, `username`, `email (UNIQUE)`, `device_id`, `auth_provider`, `created_at`, `last_active_at` | `UNIQUE(email)` | Registro e identificación opcional de directores técnicos. |
| **`runs`** | `id (SERIAL PK)`, `user_id (FK users)`, `player_name`, `mode`, `score`, `formation_name`, `ranking_tier`, `run_code`, `selected_players (JSONB)`, `events_enabled`, `created_at` | `(mode, score DESC)`, `(created_at DESC)` | Historial de todas las partidas finalizadas. |
| **`records`** | `id (SERIAL PK)`, `user_id (FK users)`, `player_name`, `mode`, `best_score`, `best_run_id (FK runs)`, `run_code`, `created_at`, `updated_at` | `UNIQUE (user_id, mode)`, `(mode, best_score DESC)` | Récord máximo registrado por cada jugador por modo. |
| **`friend_rooms`**| `id (SERIAL PK)`, `code (VARCHAR 12 UNIQUE)`, `name`, `mode`, `run_code`, `created_by`, `max_players (DEFAULT 10)`, `created_at` | `UNIQUE(code)` | Salas privadas para torneos cerrados con amigos. |
| **`friend_room_entries`** | `id (SERIAL PK)`, `room_code`, `player_name`, `score`, `formation_name`, `ranking_tier`, `created_at` | `UNIQUE(room_code, player_name)`, `(room_code, score DESC)` | Puntajes de cada participante dentro de una sala de amigos. |
| **`stats`** | `id (SERIAL PK)`, `mode`, `username`, `score`, `formation_name`, `run_code`, `device_info (JSONB)`, `user_agent`, `device_type`, `is_mobile`, `screen_resolution`, `ip`, `created_at` | `(created_at DESC)`, `(mode)`, `(username)` | Telemetría técnica no invasiva capturada al guardar nombre. |
| **`players`** | `id (VARCHAR PK)`, `name`, `ovr`, `position`, `nationality`, `club`, `dataset ('GLOBAL'/'SALTO')`, `created_at` | `(dataset, position)` | Repositorio relacional de futbolistas cargados desde SQL/seeding. |

### 3.3. Contrato de Endpoints API

#### A. Estado & Récords Globales
- **`GET /api/health`**
  - Respuesta: `{ status: "ok", server: "SoyDT Express Server" }`
- **`GET /api/records/status`**
  - Respuesta: `{ connected: boolean, message?: string }`
- **`GET /api/records/global`**
  - Flujo: Obtiene el puntaje máximo histórico y su titular para cada modo (`FUTBOL11`, `FUTBOL11_SALTO`, `FUTBOL5`) calculándolo mediante `ROW_NUMBER() OVER (PARTITION BY mode ORDER BY score DESC, created_at ASC)`.
  - Respuesta: `{ connected: boolean, records: { [mode]: { score: number, holder: string } } }`
- **`POST /api/records`**
  - Payload: `{ mode, score, playerName, formationName, rankingTier, runCode, selectedPlayers, eventsEnabled }`
  - Flujo: Inserta la partida en `runs` y actualiza/crea el récord en `records`.
  - Respuesta: `{ success: boolean, runId: number, isNewPersonalBest: boolean }`
- **`POST /api/records/update-name`**
  - Payload: `{ runId: number, playerName: string }`
  - Flujo: Actualiza el nombre del jugador en la partida guardada y en la tabla de récords.
- **`GET /api/records/recent-player?name=DT`**
  - Respuesta: `{ success: boolean, runs: Array<RunHistoryItem> }`
- **`GET /api/records/leaderboard`**
  - Respuesta: Top 3 partidas históricas de cada modo con posición, nombre, puntaje, fecha y táctica.

#### B. Jugadores & Datasets
- **`GET /api/players?mode=salto&dataset=SALTO&refresh=true`**
  - Flujo: Retorna la lista de jugadores disponibles en base de datos. Si no hay conexión o la base está vacía, devuelve el dataset estático local correspondiente (`PLAYERS_DB` o `PLAYERS_SALTO_DB`).

#### C. Salas de Amigos (Torneos Privados)
- **`POST /api/rooms`**
  - Payload: `{ name: string, mode: GameMode, createdBy: string }`
  - Flujo: Genera un código alfanumérico único de 6 caracteres (ej. `SALA42`), calcula una semilla determinista para que todos los amigos jueguen exactamente el mismo draft, y crea la sala con límite de 10 participantes.
- **`GET /api/rooms/:code`**
  - Respuesta: Información de la sala y tabla de posiciones clasificada por puntaje descendente.
- **`POST /api/rooms/:code/entry`**
  - Payload: `{ playerName, score, formationName, rankingTier }`
  - Flujo: Registra o actualiza la puntuación del jugador en la sala garantizando unicidad mediante `uq_room_player`.
- **`DELETE /api/rooms/:code`**
  - Flujo: Elimina la sala y sus entradas asociadas.

#### D. Estadísticas & Telemetría Silenciosa
- **`POST /api/stats`**
  - Payload: `{ mode, username, score, formationName, runCode, deviceInfo }`
  - Flujo: Extrae automáticamente el `User-Agent` y la dirección IP desde los encabezados de red (`x-forwarded-for` o `req.socket.remoteAddress`), clasifica el dispositivo (`mobile`, `tablet`, `desktop`) e inserta la telemetría en la tabla `stats`.
  - **Garantía cliente-servidor**: Responde siempre de forma transparente y segura sin interrumpir el flujo del usuario ante fallos de conectividad.
- **`GET /api/stats`**
  - Flujo: Consulta las últimas 50 estadísticas registradas.

---

## 4. Coding Standards & Constraints

### 4.1. TypeScript & Tipado Estricto
1. **Modelos Centralizados**: Toda interfaz que represente entidades de dominio (`Player`, `Position`, `Formation`, `GameMode`, `RunState`, `FriendRoom`) reside en `src/types/game.ts`.
2. **Imports Top-Level**: Prohibido el uso de `import type` para valores de enumeradores o valores en tiempo de ejecución.
3. **No `any` silencioso**: Los parámetros en endpoints de Express deben validar el tipo entrante o forzar un saneamiento (`String(...)`, `Number(...)`).
4. **Respuestas Homogéneas**: Toda ruta de Express debe responder con un objeto JSON explícito `{ success: boolean, ... }` o `{ error: string }`, estableciendo códigos HTTP acordes (`200`, `400`, `404`, `500`).

### 4.2. Manejo de Errores Asíncronos
- **Protección de Procesos**: Toda consulta a base de datos externa (`neon`) debe estar envuelta en bloques `try / catch`.
- **In-Memory Fallback Mandatario**: Una caída de la base de datos externa **nunca** debe tirar el proceso del servidor ni responder errores 500 no controlados. El servidor siempre debe retornar respuestas degradadas con éxito funcional.
- **Transparencia en Telemetría**: El envío de estadísticas desde el cliente (`sendGameStatSilently`) debe usar `fetch(..., { keepalive: true })` atrapando cualquier excepción sin generar logs de error visibles para el usuario final.

### 4.3. Restricciones Operativas del Entorno Serverless (Vercel)
1. **Statelessness (Sin Estado en Memoria Compartida)**: En entornos Serverless como Vercel, cada invocación de función puede correr en una instancia efímera distinta. Por ende:
   - La base de datos Postgres en **Neon** es la **única fuente de verdad persistente**.
   - Los fallbacks en memoria (`MEMORY_ROOMS`, etc.) son válidos para pruebas o resiliencia momentánea, pero no persistirán entre instancias frías distintas de lambdas de Vercel.
2. **Sin Conexiones TCP Persistentes**: Usar siempre el driver HTTP `@neondatabase/serverless` que no satura el pool de conexiones de Postgres ante escalados masivos de funciones sin estado.
3. **Manejo de IP detrás de Proxies**: Al extraer la IP del cliente en serverless, priorizar `req.headers['x-forwarded-for']` (tomando la primera IP de la lista separada por comas), dado que Vercel enruta el tráfico a través de su CDN / Edge Network.
4. **Puertos en Desarrollo**: El entorno de contenedor local exige que el servidor dev escuche obligatoriamente en `0.0.0.0:3000`. No alterar el puerto 3000 en `server.ts`.
