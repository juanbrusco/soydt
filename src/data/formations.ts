import { Formation, GameMode } from '../types/game';

export const FORMATIONS: Record<GameMode, Formation[]> = {
  FUTBOL11: [
    {
      id: 'f11-433',
      name: '4-3-3 Clásico',
      mode: 'FUTBOL11',
      totalSlots: 11,
      slots: [
        { id: 'slot-0', position: 'ARQ', label: 'ARQ', gridX: 50, gridY: 88 },
        { id: 'slot-1', position: 'LD', label: 'LD', gridX: 85, gridY: 68 },
        { id: 'slot-2', position: 'DFC', label: 'DFC', gridX: 62, gridY: 70 },
        { id: 'slot-3', position: 'DFC', label: 'DFC', gridX: 38, gridY: 70 },
        { id: 'slot-4', position: 'LI', label: 'LI', gridX: 15, gridY: 68 },
        { id: 'slot-5', position: 'MC', label: 'MC', gridX: 75, gridY: 46 },
        { id: 'slot-6', position: 'MC', label: 'MC', gridX: 50, gridY: 44 },
        { id: 'slot-7', position: 'MC', label: 'MC', gridX: 25, gridY: 46 },
        { id: 'slot-8', position: 'ED', label: 'ED', gridX: 80, gridY: 20 },
        { id: 'slot-9', position: 'DC', label: 'DC', gridX: 50, gridY: 15 },
        { id: 'slot-10', position: 'EI', label: 'EI', gridX: 20, gridY: 20 },
      ]
    }
  ],
  FUTBOL5: [
    {
      id: 'f5-121',
      name: '1-2-1 Fútbol 5',
      mode: 'FUTBOL5',
      totalSlots: 5,
      slots: [
        { id: 'slot-0', position: 'ARQ', label: 'ARQ', gridX: 50, gridY: 88 },
        { id: 'slot-1', position: 'DFC', label: 'DFC', gridX: 50, gridY: 65 },
        { id: 'slot-2', position: 'MC', label: 'MC', gridX: 25, gridY: 42 },
        { id: 'slot-3', position: 'MC', label: 'MC', gridX: 75, gridY: 42 },
        { id: 'slot-4', position: 'DC', label: 'DC', gridX: 50, gridY: 18 },
      ]
    }
  ],
  FUTBOL11_SALTO: [
    {
      id: 'f11-433',
      name: '4-3-3 Clásico (Salto)',
      mode: 'FUTBOL11_SALTO',
      totalSlots: 11,
      slots: [
        { id: 'slot-0', position: 'ARQ', label: 'ARQ', gridX: 50, gridY: 88 },
        { id: 'slot-1', position: 'LD', label: 'LD', gridX: 85, gridY: 68 },
        { id: 'slot-2', position: 'DFC', label: 'DFC', gridX: 62, gridY: 70 },
        { id: 'slot-3', position: 'DFC', label: 'DFC', gridX: 38, gridY: 70 },
        { id: 'slot-4', position: 'LI', label: 'LI', gridX: 15, gridY: 68 },
        { id: 'slot-5', position: 'MC', label: 'MC', gridX: 75, gridY: 46 },
        { id: 'slot-6', position: 'MC', label: 'MC', gridX: 50, gridY: 44 },
        { id: 'slot-7', position: 'MC', label: 'MC', gridX: 25, gridY: 46 },
        { id: 'slot-8', position: 'ED', label: 'ED', gridX: 80, gridY: 20 },
        { id: 'slot-9', position: 'DC', label: 'DC', gridX: 50, gridY: 15 },
        { id: 'slot-10', position: 'EI', label: 'EI', gridX: 20, gridY: 20 },
      ]
    }
  ],
  TRIVIA: [],
};

export function getFormationsByMode(mode: GameMode): Formation[] {
  return FORMATIONS[mode] || FORMATIONS.FUTBOL11;
}

