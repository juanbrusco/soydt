import { FriendRoom, FriendRoomEntry, GameMode } from '../types/game';

const STORAGE_KEY_RECENT_ROOMS = 'soydt_recent_friend_rooms_v1';

/**
 * Builds a dynamically compliant share URL that automatically adapts
 * to current origin, port, subpath, or future domain migration.
 */
export function getShareableRoomUrl(roomCode: string): string {
  if (typeof window === 'undefined') return '';
  const cleanCode = (roomCode || '').trim().toUpperCase();
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  
  // Construct clean URL without duplicate slashes
  const baseUrl = `${origin}${pathname}`.replace(/\/+$/, '');
  const url = new URL(baseUrl ? `${baseUrl}/` : origin);
  url.searchParams.set('sala', cleanCode);
  return url.toString();
}

/**
 * Generates an enticing WhatsApp share text for the tournament
 */
export function getWhatsAppShareText(roomName: string, roomCode: string, url: string): string {
  const name = (roomName || 'El Trofeo de la Fecha').trim();
  const cleanCode = (roomCode || '').trim().toUpperCase();
  return `🏆 ¡Se picó "${name}" en SoyDT!\n\nEntrá con este link, armá tu 11 y fijate si me podés ganar en la tabla del grupo:\n${url}\n\n(Código de sala: ${cleanCode})`;
}

/**
 * Generates WhatsApp direct share link
 */
export function getWhatsAppShareLink(roomName: string, roomCode: string, url: string): string {
  const text = getWhatsAppShareText(roomName, roomCode, url);
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

/**
 * API: Create a new friend room
 */
export async function createRoomAsync(params: {
  name?: string;
  mode: GameMode;
  createdBy: string;
}): Promise<{ success: boolean; room?: FriendRoom; error?: string }> {
  try {
    const res = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (data.success && data.room) {
      saveRecentRoom(data.room.code, data.room.name, data.room.mode);
    }
    return data;
  } catch (err: any) {
    console.error('Error creating friend room:', err);
    return { success: false, error: err?.message || 'Error de conexión' };
  }
}

/**
 * API: Get room info and live leaderboard
 */
export async function getRoomAsync(code: string): Promise<{
  success: boolean;
  room?: FriendRoom;
  error?: string;
}> {
  try {
    const cleanCode = (code || '').trim().toUpperCase();
    const res = await fetch(`/api/rooms/${encodeURIComponent(cleanCode)}`);
    const data = await res.json();
    if (data.success && data.room) {
      saveRecentRoom(data.room.code, data.room.name, data.room.mode);
    }
    return data;
  } catch (err: any) {
    console.error('Error fetching friend room:', err);
    return { success: false, error: err?.message || 'Error de conexión' };
  }
}

/**
 * API: Submit match result to room leaderboard
 */
export async function submitRoomEntryAsync(params: {
  roomCode: string;
  playerName: string;
  score: number;
  formationName?: string;
  rankingTier?: string;
}): Promise<{
  success: boolean;
  rank?: number;
  totalPlayers?: number;
  error?: string;
  message?: string;
}> {
  try {
    const cleanCode = (params.roomCode || '').trim().toUpperCase();
    const res = await fetch(`/api/rooms/${encodeURIComponent(cleanCode)}/entry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return await res.json();
  } catch (err: any) {
    console.error('Error submitting room score:', err);
    return { success: false, error: err?.message || 'Error de conexión' };
  }
}

/**
 * Local storage for keeping track of recent tournament rooms the user joined or created
 */
export interface SavedRoomRef {
  code: string;
  name: string;
  mode: GameMode;
  visitedAt: string;
}

export function getRecentRooms(): SavedRoomRef[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECENT_ROOMS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveRecentRoom(code: string, name: string, mode: GameMode) {
  try {
    const current = getRecentRooms();
    const cleanCode = code.trim().toUpperCase();
    const filtered = current.filter((r) => r.code !== cleanCode);
    const updated: SavedRoomRef[] = [
      {
        code: cleanCode,
        name: name.trim() || 'El Trofeo de la Fecha',
        mode,
        visitedAt: new Date().toISOString(),
      },
      ...filtered,
    ].slice(0, 5);
    localStorage.setItem(STORAGE_KEY_RECENT_ROOMS, JSON.stringify(updated));
  } catch {
    // Ignore
  }
}

export function removeRecentRoom(code: string) {
  try {
    const current = getRecentRooms();
    const cleanCode = code.trim().toUpperCase();
    const filtered = current.filter((r) => r.code !== cleanCode);
    localStorage.setItem(STORAGE_KEY_RECENT_ROOMS, JSON.stringify(filtered));
  } catch {
    // Ignore
  }
}

export async function deleteRoomAsync(code: string): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanCode = (code || '').trim().toUpperCase();
    const res = await fetch(`/api/rooms/${encodeURIComponent(cleanCode)}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (data.success) {
      removeRecentRoom(cleanCode);
    }
    return data;
  } catch (err: any) {
    console.error('Error deleting room:', err);
    return { success: false, error: err?.message || 'Error al eliminar la sala' };
  }
}
