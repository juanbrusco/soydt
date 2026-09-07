import { GameEvent } from '../types/game';

export const FUTBOL11_FINAL_MINIGAMES: GameEvent[] = [
  {
    id: "futbol11_penal_final",
    title: "ATAJÁ EL PENAL EN EL 95'",
    category: "QUILOMBO",
    description: "Penal polémico en contra en tiempo de descuento. Todo el estadio está de pie esperando tu atajada.",
    minigame: {
      type: "PENALTY_TIMING",
      title: "ATAJÁ EL PENAL EN EL 95'",
      instructions: "Presioná el botón de atajar justo cuando la pelota cruce por la zona verde para salvar el partido.",
      success: {
        points: 2,
        text: "¡Atajadón épico al ángulo! Salvaste la victoria sobre la hora (+2 pts)."
      },
      failure: {
        points: -1,
        text: "Gol del rival en la última jugada del partido (-1 pt)."
      }
    }
  },
  {
    id: "futbol11_tactica_final",
    title: "TÁCTICA BAJO PRESIÓN",
    category: "QUILOMBO",
    description: "El rival metió 4 delanteros a la desesperada. Resolvé las 3 indicaciones tácticas para cerrar el partido.",
    minigame: {
      type: "MATH_SPEED",
      title: "TÁCTICA BAJO PRESIÓN",
      instructions: "Resolvé las 3 cuentas mentales en menos de 3.5 segundos para ordenar el mediocampo.",
      success: {
        points: 2,
        text: "¡Lectura táctica magistral! El equipo aguantó con solvencia (+2 pts)."
      },
      failure: {
        points: -1,
        text: "Las indicaciones llegaron tarde y el rival nos embocó de contra (-1 pt)."
      }
    }
  },
  {
    id: "futbol11_tiro_libre_final",
    title: "JUGADA PREPARADA // TIRO LIBRE",
    category: "QUILOMBO",
    description: "Último tiro libre en la puerta del área. El DT pide la jugada ensayada en la semana.",
    minigame: {
      type: "TACTICAL_CODE",
      title: "CÓDIGO TÁCTICO // TIRO LIBRE",
      instructions: "Memorizá los números que indica el DT y escribilos en orden antes de que se agote el tiempo.",
      success: {
        points: 2,
        text: "¡Golazo de pizarrón al ángulo! Festejo loco en el banco (+2 pts)."
      },
      failure: {
        points: -1,
        text: "Nadie entendió la seña y la pelota terminó en la tribuna (-1 pt)."
      }
    }
  }
];
