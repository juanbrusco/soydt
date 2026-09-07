import { GameMode } from '../types/game';
import { stringToSeed } from './rng';

/**
 * Format current UTC time with 1-second precision: YYYY-MM-DD HH:mm:ss UTC
 */
export function getUtcTimestampSecondPrecision(date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const mm = String(date.getUTCMinutes()).padStart(2, '0');
  const ss = String(date.getUTCSeconds()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}:${ss} UTC`;
}

export interface DecodedRunCode {
  seed: number;
  seedString: string;
  mode: GameMode;
  formationIndex: number;
}

/**
 * Generates an opaque, clean, compact run code (e.g., SDT-11-B401-2A9F)
 */
export function encodeRunCode(seed: number, mode: GameMode, formationIndex: number = 0): string {
  const modeCode = mode === 'FUTBOL11' ? '11' : mode === 'FUTBOL11_SALTO' ? '1S' : '05';
  const rawSeedHex = (seed >>> 0).toString(16).toUpperCase().padStart(8, '0');

  // Compute a simple checksum
  let checksum = 0;
  for (let i = 0; i < rawSeedHex.length; i++) {
    checksum = (checksum + rawSeedHex.charCodeAt(i)) % 36;
  }
  const checksumChar = checksum.toString(36).toUpperCase();

  const part1 = rawSeedHex.slice(0, 4);
  const part2 = rawSeedHex.slice(4, 8);

  return `SDT-${modeCode}-${part1}-${part2}${checksumChar}`;
}

/**
 * Validates and decodes an opaque run code
 */
export function decodeRunCode(codeStr: string): DecodedRunCode | null {
  if (!codeStr || typeof codeStr !== 'string') return null;

  const clean = codeStr.trim().toUpperCase();
  const match = clean.match(/^SDT-(11|05|1S|N|5)-([0-9A-F]{4})-([0-9A-F]{4})([0-9A-Z])$/);
  
  if (!match) {
    return null;
  }

  const modeChar = match[1];
  const hex1 = match[2];
  const hex2 = match[3];
  const checksumChar = match[4];

  const fullHex = hex1 + hex2;
  let computedChecksum = 0;
  for (let i = 0; i < fullHex.length; i++) {
    computedChecksum = (computedChecksum + fullHex.charCodeAt(i)) % 36;
  }

  if (computedChecksum.toString(36).toUpperCase() !== checksumChar) {
    return null;
  }

  const seed = parseInt(fullHex, 16) >>> 0;
  const mode: GameMode = modeChar === '1S' ? 'FUTBOL11_SALTO' : (modeChar === '11' || modeChar === 'N') ? 'FUTBOL11' : 'FUTBOL5';

  return {
    seed,
    seedString: `SEED-${fullHex}`,
    mode,
    formationIndex: 0
  };
}

/**
 * Creates seed from standard inputs
 */
export function generateSeedForRun(mode: GameMode, customDate?: Date): { seed: number; seedString: string } {
  const utcTs = getUtcTimestampSecondPrecision(customDate);
  const prefix = mode === 'FUTBOL11' ? 'SOYDT-F11' : mode === 'FUTBOL11_SALTO' ? 'SOYDT-SALTO' : 'SOYDT-F5';
  return {
    seed: stringToSeed(`${prefix}-${utcTs}`),
    seedString: utcTs
  };
}

