import { GameEvent } from '../../types/game';

export const GAME_EVENTS_SALTO: GameEvent[] = [
  {
    id: "salto_penal_clasico",
    title: "ATAJÁ EL PENAL",
    category: "QUILOMBO",
    description: "Penal polémico para el rival.",
    minigame: {
      type: "PENALTY_TIMING",
      title: "ATAJÁ EL PENAL",
      instructions: "Presioná el botón de atajar justo cuando la pelota vaya pasando por la zona verde.",
      success: {
        points: 2,
        text: "Atajaste el penal y el estadio explota!"
      },
      failure: {
        points: -1,
        text: "Se te escapó entre las manos."
      }
    }
  },
  {
    id: "salto_velocidad_calculo",
    title: "TÁCTICA BAJO PRESIÓN",
    category: "QUILOMBO",
    description: "El partido se desordenó, tenés que recalcular marcas a máxima velocidad para salvar el resultado.",
    minigame: {
      type: "MATH_SPEED",
      title: "VELOCIDAD DE CÁLCULO",
      instructions: "Resolvé las 3 cuentas en menos de 3.5 segundos.",
      success: {
        points: 2,
        text: "¡Lectura táctica perfecta!"
      },
      failure: {
        points: -1,
        text: "Las indicaciones llegaron tarde y el equipo perdió la pelota en salida."
      }
    }
  },
  {
    id: "salto_jugada_preparada",
    title: "JUGADA PREPARADA",
    category: "QUILOMBO",
    description: "El DT hace señas activar la jugada ensayada.",
    minigame: {
      type: "TACTICAL_CODE",
      title: "CÓDIGO TÁCTICO",
      instructions: "Memorizá los números que indica el DT y escribilos en orden antes de que se agote el tiempo.",
      success: {
        points: 2,
        text: "Golazo de jugada preparada, al puro estilo Arsenal de Mikel Arteta."
      },
      failure: {
        points: -1,
        text: "Nadie entendió la seña y chocaron entre compañeros."
      }
    }
  }
];
