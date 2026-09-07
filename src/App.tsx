import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  GameMode, 
  Player, 
  PositionState, 
  RunState, 
  GameEvent, 
  AllRecords, 
  ModeRecord,
  MinigameType,
  RunHistoryItem,
  FriendRoom
} from './types/game';
import { PLAYERS_DB } from './data/players';
import { PLAYERS_SALTO_DB } from './data/salto/players';
import { getFormationsByMode } from './data/formations';
import { GAME_EVENTS, shouldTriggerEvent } from './data/events';
import { GAME_EVENTS_SALTO } from './data/salto/events';
import { FUTBOL11_FINAL_MINIGAMES } from './data/futbol11Minigames';
import { DeterministicRNG } from './utils/rng';
import { 
  generateSeedForRun, 
  encodeRunCode, 
  decodeRunCode,
  DecodedRunCode 
} from './utils/seedCode';
import { sound } from './utils/audio';
import { 
  loadRecords, 
  saveRecordIfBetter, 
  loadLastRuns, 
  saveLastRun, 
  loadMutedPreference, 
  saveMutedPreference,
  loadEventsEnabledPreference,
  saveEventsEnabledPreference,
  getRankingTier,
  getSavedPlayerName,
  savePlayerName,
  loadRecentRunsHistory,
  saveRunToHistory
} from './utils/storage';
import { 
  getGlobalGameRecords, 
  fetchGlobalGameRecordsAsync, 
  postGameRecord,
  updateRunPlayerNameAsync
} from './utils/globalRecords';

import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { MiniPitch } from './components/MiniPitch';
import { PlayerCard } from './components/PlayerCard';
import { EventModal } from './components/EventModal';
import { SaltoMinigameModal } from './components/SaltoMinigameModal';
import { SaltoSpecialMinigameModal } from './components/SaltoSpecialMinigameModal';
import { CalculatingScoreTransition } from './components/CalculatingScoreTransition';
import { CodeModal } from './components/CodeModal';
import { FinalSummary } from './components/FinalSummary';
import { LoadingPlayersScreen } from './components/LoadingPlayersScreen';
import { FriendRoomModal } from './components/FriendRoomModal';
import { submitRoomEntryAsync } from './utils/friendRooms';
import { sendGameStatSilently } from './utils/stats';
import { Flame, Sparkles } from 'lucide-react';

export default function App() {
  // Global App States
  const [isHome, setIsHome] = useState<boolean>(true);
  const [currentMode, setCurrentMode] = useState<GameMode>('FUTBOL11');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [eventsEnabled, setEventsEnabled] = useState<boolean>(true);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);
  const [records, setRecords] = useState<AllRecords>({ FUTBOL11: null, FUTBOL5: null, FUTBOL11_SALTO: null });
  const [lastRuns, setLastRuns] = useState<Record<GameMode, ModeRecord | null>>({ FUTBOL11: null, FUTBOL5: null, FUTBOL11_SALTO: null });
  const [recentRuns, setRecentRuns] = useState<RunHistoryItem[]>([]);
  const [globalRecords, setGlobalRecords] = useState(getGlobalGameRecords());
  const [currentNeonRunId, setCurrentNeonRunId] = useState<number | null>(null);
  const [currentPlayerName, setCurrentPlayerName] = useState<string>(getSavedPlayerName());

  // Friend Rooms State (Torneo de Amigos)
  const [isFriendRoomModalOpen, setIsFriendRoomModalOpen] = useState<boolean>(false);
  const [friendRoomInitialCode, setFriendRoomInitialCode] = useState<string | null>(null);
  const [currentActiveFriendRoom, setCurrentActiveFriendRoom] = useState<{
    room: FriendRoom;
    playerName: string;
  } | null>(null);
  const [friendRoomResult, setFriendRoomResult] = useState<{
    roomCode: string;
    roomName: string;
    rank: number;
    totalPlayers: number;
  } | null>(null);

  // Dynamic link URL detection (?sala=CODE or ?room=CODE)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('sala') || params.get('room');
        if (code) {
          const clean = code.trim().toUpperCase();
          setFriendRoomInitialCode(clean);
          setIsFriendRoomModalOpen(true);
        }
      } catch (err) {
        console.warn('[SoyDT] Error parsing room parameter from URL:', err);
      }
    }
  }, []);

  // Dynamic Players Database state (Neon DB with local fallback)
  const [isLoadingPlayers, setIsLoadingPlayers] = useState<boolean>(true);
  const [isSlowConnection, setIsSlowConnection] = useState<boolean>(false);
  const [canSkipLoading, setCanSkipLoading] = useState<boolean>(false);
  const [loadingStatusText, setLoadingStatusText] = useState<string | undefined>(undefined);
  const [dynamicGlobalPlayers, setDynamicGlobalPlayers] = useState<Player[]>(PLAYERS_DB);
  const [dynamicSaltoPlayers, setDynamicSaltoPlayers] = useState<Player[]>(PLAYERS_SALTO_DB);

  const handleSavePlayerName = async (newName: string): Promise<boolean> => {
    savePlayerName(newName);
    const cleanName = newName.trim().toUpperCase() || 'DT';
    setCurrentPlayerName(cleanName);

    // Enviar estadísticas de la partida de forma silenciosa y transparente
    sendGameStatSilently({
      mode: runState?.mode || currentMode,
      username: cleanName,
      score: runState?.score,
      formationName: runState?.formation?.name,
      runCode: runState?.runCode,
    });

    if (currentNeonRunId) {
      const res = await updateRunPlayerNameAsync(currentNeonRunId, newName);
      const updated = await fetchGlobalGameRecordsAsync();
      if (updated?.records) {
        setGlobalRecords({ ...updated.records });
      }
      return !!res.success;
    }
    return true;
  };

  // Database Selectors based on GameMode
  const getPlayerDatabase = useCallback((mode: GameMode): Player[] => {
    if (mode === 'FUTBOL11_SALTO') {
      return dynamicSaltoPlayers.length > 0 ? dynamicSaltoPlayers : PLAYERS_SALTO_DB;
    }
    return dynamicGlobalPlayers.length > 0 ? dynamicGlobalPlayers : PLAYERS_DB;
  }, [dynamicSaltoPlayers, dynamicGlobalPlayers]);

  const getEventDatabase = useCallback((mode: GameMode): GameEvent[] => {
    if (mode === 'FUTBOL11_SALTO') return GAME_EVENTS_SALTO;
    return GAME_EVENTS;
  }, []);

  // Active Run State
  const [runState, setRunState] = useState<RunState | null>(null);
  const [availablePool, setAvailablePool] = useState<Player[]>([]);
  const [temporaryExcluded, setTemporaryExcluded] = useState<Player[]>([]);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [eventFeedback, setEventFeedback] = useState<string | null>(null);
  const [isNewRecordEarned, setIsNewRecordEarned] = useState<boolean>(false);
  const [saltoActiveEvent, setSaltoActiveEvent] = useState<{
    event: GameEvent;
    nextSlotIndex: number;
    pendingSelected: (Player | null)[];
    pendingNextPool: Player[];
  } | null>(null);
  const saltoFirstMinigameTypeRef = useRef<MinigameType | null>(null);
  const [saltoSpecialActive, setSaltoSpecialActive] = useState<boolean>(false);
  const [saltoSpecialPendingSelected, setSaltoSpecialPendingSelected] = useState<(Player | null)[] | null>(null);
  const [futbol11FinalEvent, setFutbol11FinalEvent] = useState<{
    event: GameEvent;
    pendingSelected: (Player | null)[];
  } | null>(null);
  const [isCalculatingScore, setIsCalculatingScore] = useState<boolean>(false);
  const [pendingFinalData, setPendingFinalData] = useState<{
    totalSlots: number;
    saltoSpecialPendingSelected: (Player | null)[];
    finalScore: number;
    tier: ReturnType<typeof getRankingTier>;
    finalModifier: number;
    isRecord: boolean;
  } | null>(null);

  // Deterministic RNG Ref
  const rngRef = useRef<DeterministicRNG | null>(null);

  // Load Initial Settings & Records
  useEffect(() => {
    const muted = loadMutedPreference();
    setIsMuted(muted);
    sound.setMuted(muted);

    const initialEvents = loadEventsEnabledPreference();
    setEventsEnabled(initialEvents);
    eventsEnabledRef.current = initialEvents;
    setRecords(loadRecords());
    setLastRuns(loadLastRuns());
    setRecentRuns(loadRecentRunsHistory());

    // Sincronizar récords globales desde Neon/Backend
    fetchGlobalGameRecordsAsync().then((res) => {
      if (res && res.records) {
        setGlobalRecords({ ...res.records });
      }
    });

    // Precarga de jugadores desde Neon DB con fallback y detección de lentitud
    let isCancelled = false;

    const slowTimer = setTimeout(() => {
      if (!isCancelled) {
        setIsSlowConnection(true);
        setCanSkipLoading(true);
        setLoadingStatusText('Conexión lenta detectada... esperando respuesta de la base de datos');
      }
    }, 2200);

    const hardTimeout = setTimeout(() => {
      if (!isCancelled) {
        console.warn('[SoyDT] Límite de tiempo de precarga alcanzado, continuando con datos locales');
        setIsLoadingPlayers(false);
      }
    }, 5000);

    const loadPlayers = async () => {
      try {
        const controller = new AbortController();
        const fetchTimeout = setTimeout(() => controller.abort(), 4500);

        const res = await fetch('/api/players', { signal: controller.signal });
        clearTimeout(fetchTimeout);

        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && data && Array.isArray(data.players) && data.players.length > 0) {
            const allPlayers: Player[] = data.players;
            const salto = allPlayers.filter(
              (p) => p.id?.startsWith('salto_') || (p as any).dataset === 'SALTO'
            );
            const global = allPlayers.filter(
              (p) => !p.id?.startsWith('salto_') && (p as any).dataset !== 'SALTO'
            );

            if (salto.length > 0) setDynamicSaltoPlayers(salto);
            if (global.length > 0) setDynamicGlobalPlayers(global);

            console.log(
              `[SoyDT] Base de jugadores cargada desde ${data.source}: ${global.length} globales, ${salto.length} de Salto.`
            );
          }
        }
      } catch (err) {
        console.warn('[SoyDT] Error al precargar jugadores desde /api/players, usando respaldo local:', err);
      } finally {
        if (!isCancelled) {
          clearTimeout(slowTimer);
          clearTimeout(hardTimeout);
          // Transición suave para evitar parpadeo brusco
          setTimeout(() => {
            if (!isCancelled) {
              setIsLoadingPlayers(false);
            }
          }, 350);
        }
      }
    };

    loadPlayers();

    return () => {
      isCancelled = true;
      clearTimeout(slowTimer);
      clearTimeout(hardTimeout);
    };
  }, []);

  const eventsEnabledRef = useRef<boolean>(eventsEnabled);
  eventsEnabledRef.current = eventsEnabled;

  const handleGoHome = useCallback(() => {
    sound.playClick();
    setRunState(null);
    setCurrentNeonRunId(null);
    setCurrentActiveFriendRoom(null);
    setFriendRoomResult(null);
    setSaltoActiveEvent(null);
    setSaltoSpecialActive(false);
    setSaltoSpecialPendingSelected(null);
    setFutbol11FinalEvent(null);
    setIsCalculatingScore(false);
    setPendingFinalData(null);
    setEventFeedback(null);
    setIsHome(true);
  }, []);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
    saveMutedPreference(next);
  };

  const toggleEvents = () => {
    const next = !eventsEnabled;
    setEventsEnabled(next);
    eventsEnabledRef.current = next;
    saveEventsEnabledPreference(next);
    sound.playClick();
    if (runState) {
      setRunState(prev => prev ? { ...prev, eventsDisabled: !next } : null);
    }
    // If currently in a run, toggling quilombos closes the run and returns to the initial home screen
    if (!isHome) {
      handleGoHome();
    }
  };

  /**
   * Generates a player from the available pool matching the required position
   */
  const drawCandidate = useCallback(
    (
      position: string, 
      source: 'NORMAL' | 'EVENT' = 'NORMAL'
    ): Player => {
      if (!rngRef.current) {
        rngRef.current = new DeterministicRNG(Date.now());
      }

      const activeMode = runState?.mode || currentMode;
      const playerDb = getPlayerDatabase(activeMode);

      // Filter available candidates matching position
      let candidates = availablePool.filter(p => p.primaryPosition === position);

      // Fallback safeguard: if pool runs low, merge non-selected base players
      if (candidates.length === 0) {
        candidates = playerDb.filter(p => p.primaryPosition === position);
      }

      const selected = rngRef.current.pick(candidates);
      return { ...selected, source };
    },
    [availablePool, runState?.mode, currentMode, getPlayerDatabase]
  );

  /**
   * Initializes a brand new run
   */
  const startNewRun = useCallback((mode: GameMode, customDecoded?: DecodedRunCode) => {
    let seed: number;
    let seedString: string;
    let formationIndex = 0;

    if (customDecoded) {
      seed = customDecoded.seed;
      seedString = customDecoded.seedString;
      formationIndex = customDecoded.formationIndex;
    } else {
      const generated = generateSeedForRun(mode);
      seed = generated.seed;
      seedString = generated.seedString;
    }

    const rng = new DeterministicRNG(seed);
    rngRef.current = rng;

    // Pick formation (4-3-3 for FUTBOL11, 1-2-1 for FUTBOL5)
    const formations = getFormationsByMode(mode);
    const formation = formations[formationIndex % formations.length];

    // Changes allowed: 3 for FUTBOL11 & FUTBOL11_SALTO, 1 for FUTBOL5
    const totalChangesAllowed = mode === 'FUTBOL5' ? 1 : 3;

    // Initialize full global player pool based on mode
    const playerDb = getPlayerDatabase(mode);
    const initialPool = [...playerDb];
    const runCode = encodeRunCode(seed, mode, formationIndex);

    // Prepare Slot 0 candidate
    const firstSlot = formation.slots[0];
    const matchingFirst = initialPool.filter(p => p.primaryPosition === firstSlot.position);
    const firstCandidate = rng.pick(matchingFirst.length > 0 ? matchingFirst : initialPool);

    // Candidate is temporarily excluded from current slot
    const updatedPool = initialPool.filter(p => p.id !== firstCandidate.id);
    const tempExcluded = [firstCandidate];

    // Slot 0 (ARQ) is completely free from QUILOMBO events at the start of a run
    const activeEvt: GameEvent | null = null;
    const eventTriggered = false;

    const initialPosState: PositionState = {
      slotIndex: 0,
      position: firstSlot.position,
      currentCandidate: firstCandidate,
      shownCandidates: [firstCandidate],
      selectedCandidate: null,
      eventTriggered,
      activeEvent: activeEvt,
      completed: false
    };

    const newRun: RunState = {
      seed,
      seedString,
      runCode,
      mode,
      formation,
      positionIndex: 0,
      totalChanges: totalChangesAllowed,
      changesRemaining: totalChangesAllowed,
      selectedPlayers: new Array(formation.slots.length).fill(null),
      positionState: initialPosState,
      isComplete: false,
      score: 0,
      createdAt: new Date().toISOString(),
      eventsDisabled: !eventsEnabledRef.current,
      eventScoreModifier: 0
    };

    setAvailablePool(updatedPool);
    setTemporaryExcluded(tempExcluded);
    setRunState(newRun);
    setCurrentNeonRunId(null);
    setIsRolling(true);
    setEventFeedback(null);
    setSaltoActiveEvent(null);
    saltoFirstMinigameTypeRef.current = null;
    setSaltoSpecialActive(false);
    setSaltoSpecialPendingSelected(null);
    setFutbol11FinalEvent(null);
    setIsNewRecordEarned(false);

    setTimeout(() => {
      setIsRolling(false);
    }, 400);
  }, [getPlayerDatabase]);

  const handleStartRoomMatch = useCallback(
    (room: FriendRoom, participantName: string) => {
      setCurrentActiveFriendRoom({
        room,
        playerName: participantName,
      });
      setFriendRoomResult(null);

      if (participantName && participantName !== currentPlayerName) {
        setCurrentPlayerName(participantName);
        savePlayerName(participantName);
      }

      setCurrentMode(room.mode);
      setIsHome(false);

      const decoded = decodeRunCode(room.runCode);
      if (decoded) {
        startNewRun(room.mode, decoded);
      } else {
        startNewRun(room.mode);
      }
    },
    [currentPlayerName, startNewRun]
  );

  const recordFriendRoomScoreIfActive = useCallback(
    async (score: number, formationName: string, tierTitle: string) => {
      if (!currentActiveFriendRoom) return;

      try {
        const res = await submitRoomEntryAsync({
          roomCode: currentActiveFriendRoom.room.code,
          playerName: currentActiveFriendRoom.playerName,
          score,
          formationName,
          rankingTier: tierTitle,
        });

        if (res?.success && res.rank) {
          setFriendRoomResult({
            roomCode: currentActiveFriendRoom.room.code,
            roomName: currentActiveFriendRoom.room.name,
            rank: res.rank,
            totalPlayers: res.totalPlayers || 1,
          });
        }
      } catch (err) {
        console.error('[SoyDT] Error submitting score to friend room:', err);
      }
    },
    [currentActiveFriendRoom]
  );

  // Initialize first run on load and refresh pool when database players load
  useEffect(() => {
    if (isHome) {
      startNewRun(currentMode);
    }
  }, [startNewRun, isHome, currentMode]);

  /**
   * Handler for CAMBIAR button
   */
  const handleCambiar = () => {
    if (!runState || !runState.positionState || runState.isComplete || isRolling) return;
    const posState = runState.positionState;

    if (runState.changesRemaining <= 0) return;

    sound.playClick();
    setIsRolling(true);

    const newChangesRemaining = runState.changesRemaining - 1;

    // Generate new candidate from available pool
    const currentSlot = runState.formation.slots[runState.positionIndex];
    const newCandidate = drawCandidate(currentSlot.position, 'NORMAL');

    // Update pools: new candidate is temporarily excluded
    const updatedPool = availablePool.filter(p => p.id !== newCandidate.id);
    const updatedTempExcluded = [...temporaryExcluded, newCandidate];
    setAvailablePool(updatedPool);
    setTemporaryExcluded(updatedTempExcluded);

    const shownList = [...posState.shownCandidates, newCandidate];

    // Check if event triggers (only if eventsEnabled, not already triggered in this slot, never on ARQ position 0, and not if previous slot had an event)
    let activeEvt = posState.activeEvent;
    let eventTriggered = posState.eventTriggered;

    if (runState.mode !== 'FUTBOL11_SALTO' && eventsEnabled && !eventTriggered && rngRef.current) {
      const roll = rngRef.current.next();
      const previousHadEvent = runState.lastSlotHadEvent ?? false;
      if (shouldTriggerEvent(runState.positionIndex, roll, previousHadEvent)) {
        const eventDb = getEventDatabase(runState.mode);
        activeEvt = rngRef.current.pick(eventDb);
        eventTriggered = true;
        sound.playEventAlert();
      }
    }

    const updatedPosState: PositionState = {
      ...posState,
      currentCandidate: newCandidate,
      shownCandidates: shownList,
      eventTriggered,
      activeEvent: activeEvt,
    };

    setRunState({
      ...runState,
      changesRemaining: newChangesRemaining,
      positionState: updatedPosState
    });

    setTimeout(() => {
      setIsRolling(false);
    }, 450);
  };

  /**
   * Handler for SELECCIONAR button
   */
  const handleSeleccionar = () => {
    if (!runState || !runState.positionState || runState.isComplete || isRolling) return;
    const currentCandidate = runState.positionState.currentCandidate;
    if (!currentCandidate) return;

    sound.playSelectPlayer(currentCandidate.ovr >= 90);

    const currentIndex = runState.positionIndex;
    const updatedSelected = [...runState.selectedPlayers];
    updatedSelected[currentIndex] = currentCandidate;

    // Candidate selected is permanently removed from the run pool.
    // Discarded candidates from this slot return to the available pool!
    const reincorporated = temporaryExcluded.filter(p => p.id !== currentCandidate.id);
    const nextPool = [...availablePool, ...reincorporated];
    setAvailablePool(nextPool);
    setTemporaryExcluded([]);

    const nextIndex = currentIndex + 1;
    const totalSlots = runState.formation.slots.length;

    // SPECIAL HANDLING FOR FUTBOL11_SALTO:
    // Triggers:
    // 1) After picking the 3rd player (currentIndex === 2) -> Minijuego aleatorio
    // 2) After picking the 7th player (currentIndex === 6) -> Minijuego aleatorio diferente
    // 3) After picking the 11th / last player (currentIndex === totalSlots - 1) -> Minijuego ESPECIAL (8-bit Trivia)
    if (runState.mode === 'FUTBOL11_SALTO' && eventsEnabled) {
      if (currentIndex === 2) {
        // Evento 1: luego de elegir el 3er jugador (index 2) - Selección aleatoria entre los 3 minijuegos
        const chosen = rngRef.current?.pick(GAME_EVENTS_SALTO) || GAME_EVENTS_SALTO[Math.floor(Math.random() * GAME_EVENTS_SALTO.length)];
        if (chosen.minigame) {
          saltoFirstMinigameTypeRef.current = chosen.minigame.type;
        }
        sound.playEventAlert();
        setSaltoActiveEvent({
          event: chosen,
          nextSlotIndex: 3,
          pendingSelected: updatedSelected,
          pendingNextPool: nextPool
        });
        return;
      } else if (currentIndex === 6) {
        // Evento 2: luego de elegir el 7mo jugador (index 6) - Minijuego aleatorio sin repetir tipo
        const firstType = saltoFirstMinigameTypeRef.current;
        const differentTypeEvents = GAME_EVENTS_SALTO.filter(e => e.minigame && e.minigame.type !== firstType);
        const poolToPick = differentTypeEvents.length > 0 ? differentTypeEvents : GAME_EVENTS_SALTO;
        const chosen = rngRef.current?.pick(poolToPick) || poolToPick[Math.floor(Math.random() * poolToPick.length)];
        sound.playEventAlert();
        setSaltoActiveEvent({
          event: chosen,
          nextSlotIndex: 7,
          pendingSelected: updatedSelected,
          pendingNextPool: nextPool
        });
        return;
      } else if (currentIndex === totalSlots - 1) {
        // Evento Final: luego de elegir al último jugador (11vo jugador) - Minijuego ESPECIAL 8-bit
        setSaltoSpecialPendingSelected(updatedSelected);
        setSaltoSpecialActive(true);
        return;
      }
    }

    // SPECIAL HANDLING FOR FUTBOL11 (Standard):
    // Trigger Minigame after picking the 11th / last player (currentIndex === totalSlots - 1)
    if (runState.mode === 'FUTBOL11' && eventsEnabled && currentIndex === totalSlots - 1) {
      const chosen = rngRef.current?.pick(FUTBOL11_FINAL_MINIGAMES) || 
        FUTBOL11_FINAL_MINIGAMES[Math.floor(Math.random() * FUTBOL11_FINAL_MINIGAMES.length)];
      sound.playEventAlert();
      setFutbol11FinalEvent({
        event: chosen,
        pendingSelected: updatedSelected,
      });
      return;
    }

    // Check if Run is Completed (Standard modes or Salto with events disabled)
    if (nextIndex >= totalSlots) {
      const playersScore = updatedSelected.reduce((sum, p) => sum + (p ? p.ovr : 0), 0);
      const modifier = runState.eventScoreModifier || 0;
      const finalScore = Math.max(0, playersScore + modifier);
      const tier = getRankingTier(finalScore, totalSlots, runState.mode);

      const isRecord = saveRecordIfBetter(
        runState.mode, 
        finalScore, 
        runState.runCode, 
        runState.formation.name
      );
      saveLastRun(runState.mode, finalScore, runState.runCode, runState.formation.name);

      const updatedHistory = saveRunToHistory({
        mode: runState.mode,
        score: finalScore,
        formationName: runState.formation.name,
        rankingTierTitle: tier.title,
        runCode: runState.runCode,
        eventsEnabled: !runState.eventsDisabled,
      });
      setRecentRuns(updatedHistory);

      setRecords(loadRecords());
      setLastRuns(loadLastRuns());
      setIsNewRecordEarned(isRecord);

      // Persistir partida en base de datos Neon
      postGameRecord({
        mode: runState.mode,
        score: finalScore,
        runCode: runState.runCode,
        formationName: runState.formation.name,
        rankingTier: tier.title,
        playerName: getSavedPlayerName(),
        selectedPlayers: updatedSelected,
        eventsEnabled: !runState.eventsDisabled,
      }).then((res) => {
        if (res?.runId) {
          setCurrentNeonRunId(res.runId);
        }
        fetchGlobalGameRecordsAsync().then((resGlobal) => {
          if (resGlobal?.records) setGlobalRecords({ ...resGlobal.records });
        });
      });

      // Submit to active friend room if in tournament mode
      recordFriendRoomScoreIfActive(finalScore, runState.formation.name, tier.title);

      // Suspense transition ("cargando puntajes")
      setPendingFinalData({
        totalSlots,
        saltoSpecialPendingSelected: updatedSelected,
        finalScore,
        tier,
        finalModifier: modifier,
        isRecord,
      });
      setIsCalculatingScore(true);
      return;
    }

    // Advance to next position slot
    const nextSlot = runState.formation.slots[nextIndex];
    if (!rngRef.current) {
      rngRef.current = new DeterministicRNG(runState.seed + nextIndex);
    }

    // Pick candidate for next slot
    const playerDb = getPlayerDatabase(runState.mode);
    const matching = nextPool.filter(p => p.primaryPosition === nextSlot.position);
    const nextCandidate = rngRef.current.pick(matching.length > 0 ? matching : playerDb.filter(p => p.primaryPosition === nextSlot.position));

    const nextAvailablePool = nextPool.filter(p => p.id !== nextCandidate.id);
    const nextTempExcluded = [nextCandidate];
    setAvailablePool(nextAvailablePool);
    setTemporaryExcluded(nextTempExcluded);

    const currentSlotHadEvent = runState.positionState?.eventTriggered ?? false;

    // Roll event for next slot attempt 1 (only for non-Salto modes!)
    const eventRoll = rngRef.current.next();
    let nextEvt: GameEvent | null = null;
    let nextEvtTriggered = false;

    if (runState.mode !== 'FUTBOL11_SALTO' && eventsEnabled && shouldTriggerEvent(nextIndex, eventRoll, currentSlotHadEvent)) {
      const eventDb = getEventDatabase(runState.mode);
      nextEvt = rngRef.current.pick(eventDb);
      nextEvtTriggered = true;
      sound.playEventAlert();
    }

    const nextPosState: PositionState = {
      slotIndex: nextIndex,
      position: nextSlot.position,
      currentCandidate: nextCandidate,
      shownCandidates: [nextCandidate],
      selectedCandidate: null,
      eventTriggered: nextEvtTriggered,
      activeEvent: nextEvt,
      completed: false
    };

    setIsRolling(true);
    setEventFeedback(null);

    setRunState({
      ...runState,
      positionIndex: nextIndex,
      selectedPlayers: updatedSelected,
      positionState: nextPosState,
      lastSlotHadEvent: currentSlotHadEvent,
    });

    setTimeout(() => {
      setIsRolling(false);
    }, 400);
  };

  /**
   * Handler for FUTBOL11_SALTO Minigame Completion
   */
  const handleSaltoMinigameFinish = (points: number, narrativeText: string) => {
    if (!runState || !saltoActiveEvent) return;

    const currentModifier = runState.eventScoreModifier || 0;
    const newModifier = currentModifier + points;
    const { nextSlotIndex, pendingSelected, pendingNextPool } = saltoActiveEvent;

    // The result is already fully presented inside the minigame modal; no toast under pitch
    setEventFeedback(null);
    setSaltoActiveEvent(null);

    // Advance to next slot (slot 5 after 5th player, or slot 10 after 10th player)
    const nextIndex = nextSlotIndex;
    const nextSlot = runState.formation.slots[nextIndex];
    if (!rngRef.current) {
      rngRef.current = new DeterministicRNG(runState.seed + nextIndex);
    }

    const playerDb = getPlayerDatabase(runState.mode);
    const matching = pendingNextPool.filter(p => p.primaryPosition === nextSlot.position);
    const nextCandidate = rngRef.current.pick(matching.length > 0 ? matching : playerDb.filter(p => p.primaryPosition === nextSlot.position));

    const nextAvailablePool = pendingNextPool.filter(p => p.id !== nextCandidate.id);
    const nextTempExcluded = [nextCandidate];
    setAvailablePool(nextAvailablePool);
    setTemporaryExcluded(nextTempExcluded);

    const nextPosState: PositionState = {
      slotIndex: nextIndex,
      position: nextSlot.position,
      currentCandidate: nextCandidate,
      shownCandidates: [nextCandidate],
      selectedCandidate: null,
      eventTriggered: false,
      activeEvent: null,
      completed: false
    };

    setIsRolling(true);

    setRunState({
      ...runState,
      positionIndex: nextIndex,
      selectedPlayers: pendingSelected,
      positionState: nextPosState,
      eventScoreModifier: newModifier,
      lastSlotHadEvent: true,
    });

    setTimeout(() => {
      setIsRolling(false);
    }, 400);
  };

  /**
   * Handler for FUTBOL11_SALTO Final Special Minigame Completion
   * Triggers the suspenseful "Calculando los puntos del equipo" transition
   */
  const handleSaltoSpecialMinigameFinish = (points: number, _narrativeText: string) => {
    if (!runState || !saltoSpecialPendingSelected) return;

    const totalSlots = runState.formation.slots.length;
    const playersScore = saltoSpecialPendingSelected.reduce((sum, p) => sum + (p ? p.ovr : 0), 0);
    const finalModifier = (runState.eventScoreModifier || 0) + points;
    const finalScore = Math.max(0, playersScore + finalModifier);
    const tier = getRankingTier(finalScore, totalSlots, runState.mode);

    const isRecord = saveRecordIfBetter(
      runState.mode, 
      finalScore, 
      runState.runCode, 
      runState.formation.name
    );
    saveLastRun(runState.mode, finalScore, runState.runCode, runState.formation.name);

    const updatedHistory = saveRunToHistory({
      mode: runState.mode,
      score: finalScore,
      formationName: runState.formation.name,
      rankingTierTitle: tier.title,
      runCode: runState.runCode,
      eventsEnabled: !runState.eventsDisabled,
    });
    setRecentRuns(updatedHistory);

    // Persistir partida en base de datos Neon
    postGameRecord({
      mode: runState.mode,
      score: finalScore,
      runCode: runState.runCode,
      formationName: runState.formation.name,
      rankingTier: tier.title,
      playerName: getSavedPlayerName(),
      selectedPlayers: saltoSpecialPendingSelected,
      eventsEnabled: !runState.eventsDisabled,
    }).then((res) => {
      if (res?.runId) {
        setCurrentNeonRunId(res.runId);
      }
      fetchGlobalGameRecordsAsync().then((resGlobal) => {
        if (resGlobal?.records) setGlobalRecords({ ...resGlobal.records });
      });
    });

    // Submit to active friend room if in tournament mode
    recordFriendRoomScoreIfActive(finalScore, runState.formation.name, tier.title);

    // Close special minigame modal
    setSaltoSpecialActive(false);

    // Store pending final data & trigger the suspense transition
    setPendingFinalData({
      totalSlots,
      saltoSpecialPendingSelected,
      finalScore,
      tier,
      finalModifier,
      isRecord,
    });
    setIsCalculatingScore(true);
  };

  /**
   * Handler for FUTBOL11 Final Minigame Completion
   * Can vary between -1 and +2 points, affecting final team score
   * Triggers the suspenseful "Calculando los puntos del equipo" transition
   */
  const handleFutbol11MinigameFinish = (points: number, _narrativeText: string) => {
    if (!runState || !futbol11FinalEvent) return;

    const totalSlots = runState.formation.slots.length;
    const selectedPlayers = futbol11FinalEvent.pendingSelected;
    const playersScore = selectedPlayers.reduce((sum, p) => sum + (p ? p.ovr : 0), 0);
    const finalModifier = (runState.eventScoreModifier || 0) + points;
    const finalScore = Math.max(0, playersScore + finalModifier);
    const tier = getRankingTier(finalScore, totalSlots, runState.mode);

    const isRecord = saveRecordIfBetter(
      runState.mode, 
      finalScore, 
      runState.runCode, 
      runState.formation.name
    );
    saveLastRun(runState.mode, finalScore, runState.runCode, runState.formation.name);

    const updatedHistory = saveRunToHistory({
      mode: runState.mode,
      score: finalScore,
      formationName: runState.formation.name,
      rankingTierTitle: tier.title,
      runCode: runState.runCode,
      eventsEnabled: !runState.eventsDisabled,
    });
    setRecentRuns(updatedHistory);

    // Persistir partida en base de datos Neon
    postGameRecord({
      mode: runState.mode,
      score: finalScore,
      runCode: runState.runCode,
      formationName: runState.formation.name,
      rankingTier: tier.title,
      playerName: getSavedPlayerName(),
      selectedPlayers,
      eventsEnabled: !runState.eventsDisabled,
    }).then((res) => {
      if (res?.runId) {
        setCurrentNeonRunId(res.runId);
      }
      fetchGlobalGameRecordsAsync().then((resGlobal) => {
        if (resGlobal?.records) setGlobalRecords({ ...resGlobal.records });
      });
    });

    // Submit to active friend room if in tournament mode
    recordFriendRoomScoreIfActive(finalScore, runState.formation.name, tier.title);

    // Close minigame modal
    setFutbol11FinalEvent(null);

    // Store pending final data & trigger the suspense transition
    setPendingFinalData({
      totalSlots,
      saltoSpecialPendingSelected: selectedPlayers,
      finalScore,
      tier,
      finalModifier,
      isRecord,
    });
    setIsCalculatingScore(true);
  };

  /**
   * Completes the suspenseful calculation transition and reveals the final results screen
   */
  const handleCalculationComplete = useCallback(() => {
    if (!pendingFinalData || !runState) {
      setIsCalculatingScore(false);
      return;
    }

    setRecords(loadRecords());
    setLastRuns(loadLastRuns());
    setIsNewRecordEarned(pendingFinalData.isRecord);

    setRunState({
      ...runState,
      positionIndex: pendingFinalData.totalSlots,
      selectedPlayers: pendingFinalData.saltoSpecialPendingSelected,
      positionState: null,
      isComplete: true,
      score: pendingFinalData.finalScore,
      rankingTier: pendingFinalData.tier,
      eventScoreModifier: pendingFinalData.finalModifier,
    });

    setSaltoSpecialPendingSelected(null);
    setPendingFinalData(null);
    setIsCalculatingScore(false);
  }, [pendingFinalData, runState]);

  /**
   * Handler for QUILOMBO Event Option selection (A or B)
   * Outcomes modify team's final score total, strictly between -1 and +2 points
   */
  const handleEventChoice = (choice: 'A' | 'B') => {
    if (!runState || !runState.positionState || !runState.positionState.activeEvent) return;
    const event = runState.positionState.activeEvent;

    if (!rngRef.current) {
      rngRef.current = new DeterministicRNG(Date.now());
    }

    const explicitEffect = choice === 'A' ? event.effectA : event.effectB;
    let possibleDeltas: number[];
    if (explicitEffect === 'suma') {
      possibleDeltas = [1, 2];
    } else if (explicitEffect === 'resta') {
      possibleDeltas = [-1];
    } else {
      possibleDeltas = [-1, 1, 2];
    }

    const delta = rngRef.current.pick(possibleDeltas);
    const absDelta = Math.abs(delta);

    const currentModifier = runState.eventScoreModifier || 0;
    const newModifier = currentModifier + delta;

    const resultSummary = delta > 0 
      ? `Se ${absDelta === 1 ? 'sumó +1 punto' : 'sumaron +2 puntos'} al puntaje final`
      : `Se restó -1 punto del puntaje final`;

    setEventFeedback(resultSummary);

    if (delta > 0) {
      sound.playSelectPlayer(true);
    } else {
      sound.playEventAlert();
    }

    setRunState({
      ...runState,
      eventScoreModifier: newModifier,
      positionState: {
        ...runState.positionState,
        activeEvent: null, // Resolved!
      }
    });
  };

  const handleModeChange = (mode: GameMode) => {
    setCurrentMode(mode);
    startNewRun(mode);
    setIsHome(false);
  };

  const handleStartWithCode = (decoded: DecodedRunCode) => {
    setCurrentMode(decoded.mode);
    startNewRun(decoded.mode, decoded);
    setIsHome(false);
  };

  // Current Position slot & calculations
  const activeSlot = runState && !runState.isComplete 
    ? runState.formation.slots[runState.positionIndex] 
    : null;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col relative selection:bg-[#38BDF8] selection:text-black overflow-x-hidden">
      {/* Loading Players Screen Overlay */}
      {isLoadingPlayers && (
        <LoadingPlayersScreen
          onSkip={canSkipLoading ? () => setIsLoadingPlayers(false) : undefined}
          statusText={loadingStatusText}
          isSlowConnection={isSlowConnection}
        />
      )}

      {/* Background Architectural Atmosphere & Giant Watermark Typography */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-4%] right-[-2%] text-[300px] sm:text-[500px] font-black text-white/[0.015] leading-none select-none font-display">
          DT
        </div>
        <div className="absolute bottom-[-5%] left-[-2%] text-[240px] sm:text-[400px] font-black text-white/[0.01] leading-none select-none font-display">
          {currentMode === 'FUTBOL11' ? '11' : '05'}
        </div>

        {/* Ambient subtle glow lights */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#38BDF8]/5 blur-[140px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-[#38BDF8]/3 blur-[130px] rounded-full" />
        <div className="crt-scanlines absolute inset-0 opacity-30" />
      </div>

      {/* App Header */}
      <Header
        currentMode={currentMode}
        onSelectMode={handleModeChange}
        isGameInProgress={!isHome && !!runState && !runState.isComplete && runState.positionIndex > 0}
        bestRecord={records[currentMode]}
        lastRun={lastRuns[currentMode]}
        onOpenCodeModal={() => setIsCodeModalOpen(true)}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        eventsEnabled={eventsEnabled}
        onToggleEvents={toggleEvents}
        isHome={isHome}
        onGoHome={handleGoHome}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-4 py-2 sm:py-6 flex flex-col justify-between relative z-10">
        {isHome ? (
          <HomeScreen
            onSelectMode={(mode) => {
              setCurrentMode(mode);
              startNewRun(mode);
              setIsHome(false);
            }}
            onOpenCodeModal={() => setIsCodeModalOpen(true)}
            onOpenFriendRooms={(code) => {
              if (code) setFriendRoomInitialCode(code);
              setIsFriendRoomModalOpen(true);
            }}
            records={records}
            eventsEnabled={eventsEnabled}
            onToggleEvents={toggleEvents}
            globalRecords={globalRecords}
            playerName={currentPlayerName}
            onSavePlayerName={handleSavePlayerName}
            recentRuns={recentRuns}
          />
        ) : runState && !runState.isComplete ? (
          <div className="flex flex-col gap-2.5 sm:gap-6 w-full">
            {/* Active Friend Tournament Indicator */}
            {currentActiveFriendRoom && (
              <div className="w-full max-w-md mx-auto py-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-950/60 to-black border border-emerald-500/30 text-emerald-400 text-xs font-mono-code font-bold flex items-center justify-between shadow-sm animate-fadeIn">
                <span className="flex items-center gap-2 truncate">
                  <span className="text-amber-400">🏆</span>
                  <span className="uppercase truncate text-white">{currentActiveFriendRoom.room.name}</span>
                </span>
                <span className="text-[11px] text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex-shrink-0">
                  DT: {currentActiveFriendRoom.playerName}
                </span>
              </div>
            )}

            {/* Mini Tactical Pitch */}
            <MiniPitch
              formation={runState.formation}
              currentSlotIndex={runState.positionIndex}
              selectedPlayers={runState.selectedPlayers}
            />

            {/* Event Feedback Toast if just resolved */}
            {eventFeedback && (
              <div className="w-full max-w-md mx-auto p-3.5 rounded-xl bg-orange-950/90 border border-orange-400/40 text-orange-200 text-xs font-mono-code flex items-center gap-2.5 shadow-xl animate-fadeIn">
                <Flame className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <span className="font-bold tracking-wide uppercase">{eventFeedback}</span>
              </div>
            )}

            {/* Candidate Card */}
            <PlayerCard
              player={runState.positionState?.currentCandidate || null}
              position={runState.positionState?.position || 'MC'}
              positionLabel={activeSlot?.label || 'POS'}
              changesRemaining={runState.changesRemaining}
              totalChangesAllowed={runState.totalChanges}
              isRolling={isRolling}
              onCambiar={handleCambiar}
              onSeleccionar={handleSeleccionar}
              disabled={!!runState.positionState?.activeEvent || !!saltoActiveEvent || !!futbol11FinalEvent}
            />

            {/* Active Event Fullscreen Modal Overlay (Standard Modes) */}
            {runState.positionState?.activeEvent && (
              <EventModal
                event={runState.positionState.activeEvent}
                onChooseOption={handleEventChoice}
              />
            )}

            {/* Active Futbol 11 End-of-Selection Minigame Modal Overlay */}
            {futbol11FinalEvent && (
              <SaltoMinigameModal
                event={futbol11FinalEvent.event}
                onFinish={handleFutbol11MinigameFinish}
              />
            )}

            {/* Active Salto Minigame Modal Overlay (Fútbol 11 Salto) */}
            {saltoActiveEvent && (
              <SaltoMinigameModal
                event={saltoActiveEvent.event}
                onFinish={handleSaltoMinigameFinish}
              />
            )}

            {/* Active Salto Final Special Minigame Modal (8-Bit World Football Trivia) */}
            {saltoSpecialActive && (
              <SaltoSpecialMinigameModal
                onFinish={handleSaltoSpecialMinigameFinish}
              />
            )}

            {/* Suspenseful Score Calculation Transition */}
            {isCalculatingScore && (
              <CalculatingScoreTransition
                mode={runState.mode}
                onComplete={handleCalculationComplete}
              />
            )}
          </div>
        ) : runState && runState.isComplete ? (
          /* Final Results Screen */
          <FinalSummary
            formation={runState.formation}
            selectedPlayers={runState.selectedPlayers}
            score={runState.score}
            rankingTier={runState.rankingTier || getRankingTier(runState.score, runState.formation.slots.length, runState.mode)}
            runCode={runState.runCode}
            isNewRecord={isNewRecordEarned}
            bestRecord={records[runState.mode]}
            onNewRun={() => startNewRun(currentMode)}
            onGoHome={handleGoHome}
            eventsDisabled={runState.eventsDisabled}
            eventScoreModifier={runState.eventScoreModifier}
            initialPlayerName={getSavedPlayerName()}
            onSavePlayerName={handleSavePlayerName}
            friendRoomResult={friendRoomResult}
            onOpenFriendRoom={(code) => {
              setFriendRoomInitialCode(code);
              setIsFriendRoomModalOpen(true);
            }}
          />
        ) : null}
      </main>

      {/* Run Code Modal */}
      <CodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        onStartWithCode={handleStartWithCode}
      />

      {/* Friend Rooms Modal (Torneo de Amigos) */}
      <FriendRoomModal
        isOpen={isFriendRoomModalOpen}
        onClose={() => {
          setIsFriendRoomModalOpen(false);
          setFriendRoomInitialCode(null);
        }}
        initialCode={friendRoomInitialCode}
        currentDtName={currentPlayerName}
        onStartRoomMatch={handleStartRoomMatch}
      />

      {/* Footer */}
      <footer className="w-full border-t border-white/10 py-4 px-4 text-center text-[11px] uppercase tracking-[0.25em] text-white/40 font-mono-code relative z-10 flex items-center justify-center gap-3">
        <span className="text-white/25">v{__APP_VERSION__}</span>
        <span className="text-white/15">•</span>
        <span>CREADO POR JOTA</span>
        <span className="text-white/20">•</span>
        <a
          id="footer-contact-btn"
          href="mailto:isftyd126@gmail.com"
          className="text-white/50 hover:text-[#38BDF8] transition-colors underline decoration-white/20 hover:decoration-[#38BDF8]/60 cursor-pointer"
          title="Enviar correo de contacto"
        >
          CONTACTO
        </a>
      </footer>
    </div>
  );
}

