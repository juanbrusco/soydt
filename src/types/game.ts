export type Position = 
  | 'ARQ' 
  | 'LI' 
  | 'DFC' 
  | 'LD' 
  | 'MC' 
  | 'EI' 
  | 'ED' 
  | 'DC';

export type PlayerSource = 'NORMAL' | 'EVENT';

export interface Player {
  id: string;
  name: string;
  ovr: number;
  baseOvr?: number;
  primaryPosition: Position;
  position?: Position;
  nationality?: string;
  country?: string;
  club?: string;
  emoji?: string;
  source?: PlayerSource;
  modifier?: number;
}

export type GameMode = 'FUTBOL11' | 'FUTBOL5' | 'FUTBOL11_SALTO';

export interface FormationSlot {
  id: string; // e.g. 'slot-0'
  position: Position;
  label: string; // e.g. 'DFC #1' or 'Cierre'
  gridX: number; // 0 to 100 percentage on mini pitch
  gridY: number; // 0 to 100 percentage on mini pitch
}

export interface Formation {
  id: string;
  name: string;
  mode: GameMode;
  totalSlots: number;
  slots: FormationSlot[];
}

export type EventCategory = 'QUILOMBO';

export type MinigameType = 'PENALTY_TIMING' | 'MATH_SPEED' | 'TACTICAL_CODE';

export interface MinigameResultTier {
  points: number;
  text: string;
}

export interface MinigameDefinition {
  type: MinigameType;
  title: string;
  instructions: string;
  success: MinigameResultTier;
  failure: MinigameResultTier;
}

export interface GameEventOption {
  text: string;
  effect: 'suma' | 'resta';
}

export interface GameEvent {
  id: string;
  title: string;
  category: EventCategory;
  description: string;
  optionA?: string;
  optionB?: string;
  effectA?: 'suma' | 'resta';
  effectB?: 'suma' | 'resta';
  options?: GameEventOption[];
  minigame?: MinigameDefinition;
}

export interface PositionState {
  slotIndex: number;
  position: Position;
  currentCandidate: Player | null;
  shownCandidates: Player[];
  selectedCandidate: Player | null;
  eventTriggered: boolean;
  activeEvent: GameEvent | null;
  completed: boolean;
}

export interface RunState {
  seed: number;
  seedString: string;
  runCode: string;
  mode: GameMode;
  formation: Formation;
  positionIndex: number;
  totalChanges: number;
  changesRemaining: number;
  selectedPlayers: (Player | null)[];
  positionState: PositionState | null;
  lastSlotHadEvent?: boolean;
  isComplete: boolean;
  score: number;
  rankingTier?: RankingTier;
  createdAt: string;
  eventsDisabled?: boolean;
  eventScoreModifier?: number;
  neonRunId?: number;
}

export interface RankingTier {
  title: string;
  minAverage: number;
  badge: string;
  color: string;
  bgGradient: string;
  comment: string;
}

export interface ModeRecord {
  score: number;
  runCode: string;
  date: string;
  formationName: string;
}

export interface RunHistoryItem {
  id: string;
  mode: GameMode;
  score: number;
  formationName: string;
  rankingTierTitle: string;
  date: string;
  runCode?: string;
  eventsEnabled?: boolean;
}

export interface AllRecords {
  FUTBOL11: ModeRecord | null;
  FUTBOL5: ModeRecord | null;
  FUTBOL11_SALTO?: ModeRecord | null;
}

export interface LeaderboardTop3Entry {
  rank: number;
  playerName: string;
  score: number;
  eventsEnabled: boolean;
}

export interface LeaderboardTop3Data {
  FUTBOL11_SALTO: LeaderboardTop3Entry[];
  FUTBOL11: LeaderboardTop3Entry[];
  FUTBOL5: LeaderboardTop3Entry[];
}

export interface FriendRoomEntry {
  id?: number;
  playerName: string;
  score: number;
  formationName?: string;
  rankingTier?: string;
  rank?: number;
  createdAt?: string;
}

export interface FriendRoom {
  code: string;
  name: string;
  mode: GameMode;
  runCode: string;
  createdBy: string;
  maxPlayers: number;
  createdAt: string;
  entries: FriendRoomEntry[];
  totalPlayers: number;
  isFull: boolean;
}


