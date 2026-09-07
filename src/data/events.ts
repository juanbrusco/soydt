import { GameEvent } from '../types/game';

export const GAME_EVENTS: GameEvent[] = [
  {
    id: "arbitro_corrupto",
    title: "ÁRBITRO CORRUPTO",
    category: "QUILOMBO",
    description: "Te pide plata por un penal a favor",
    optionA: "ACEPTAR",
    optionB: "RECHAZAR",
    effectA: "suma",
    effectB: "resta",
    options: [
      { text: "ACEPTAR", effect: "suma" },
      { text: "RECHAZAR", effect: "resta" },
    ],
  },
  {
    id: "barra_brava",
    title: "APRIETE BARRA BRAVA",
    category: "QUILOMBO",
    description: "Amenazan a uno de tus jugadores",
    optionA: "DEFENDERLO",
    optionB: "CALLARSE",
    effectA: "suma",
    effectB: "resta",
    options: [
      { text: "DEFENDERLO", effect: "suma" },
      { text: "CALLARSE", effect: "resta" },
    ],
  },
  {
    id: "representante",
    title: "REPRESENTANTE",
    category: "QUILOMBO",
    description: "Pide comisión más alta de lo acordado",
    optionA: "ACEPTAR",
    optionB: "RECHAZAR",
    effectA: "suma",
    effectB: "resta",
    options: [
      { text: "ACEPTAR", effect: "suma" },
      { text: "RECHAZAR", effect: "resta" },
    ],
  },
  {
    id: "joda_noche",
    title: "SALIÓ DE JODA",
    category: "QUILOMBO",
    description: "El jugador fue visto en un boliche la noche previa",
    optionA: "CASTIGARLO",
    optionB: "PERDONARLO",
    effectA: "suma",
    effectB: "resta",
    options: [
      { text: "CASTIGARLO", effect: "suma" },
      { text: "PERDONARLO", effect: "resta" },
    ],
  },
  {
    id: 'q-1',
    title: '¡ESCÁNDALO EN EL BOLICHE!',
    category: 'QUILOMBO',
    description: 'Filtran un video del jugador cantando en el escenario de una fiesta privada a las 5:30 AM antes del clásico.',
    optionA: 'Bancarlo a muerte en conferencia: "El pibe necesita despejarse"',
    optionB: 'Sanción ejemplar: Multa del 50% del sueldo y trote bajo la lluvia',
  },
  {
    id: 'q-2',
    title: '¡PIÑAS EN EL VESTUARIO!',
    category: 'QUILOMBO',
    description: 'En el entretiempo voló un termo de acero inoxidable y dos referentes terminaron a los empujones.',
    optionA: 'Cerrar la puerta con llave y decir "Acá nos matamos o salimos campeones"',
    optionB: 'Llamar a seguridad del club y separar a los rebeldes',
  },
  {
    id: 'q-3',
    title: 'EL REPRESENTANTE CHANTAPUFI',
    category: 'QUILOMBO',
    description: 'El agente del jugador apareció en el entrenamiento con tres guardaespaldas exigiendo una cláusula en criptomonedas.',
    optionA: 'Invitarle un asado y negociar por abajo de la mesa',
    optionB: 'Echarlo del predio con el personal de maestranza',
  },
  {
    id: 'q-4',
    title: 'AUDIOS FILTRADOS EN WHATSAPP',
    category: 'QUILOMBO',
    description: 'Se viraliza un audio de 7 minutos criticando la comida de la concentración y el esquema táctico.',
    optionA: 'Decir que es un audio viejo creado con Inteligencia Artificial',
    optionB: 'Obligarlo a pedir perdón llorando frente a todo el plantel',
  },
  {
    id: 'q-5',
    title: 'EL ASADO INTOXICADO',
    category: 'QUILOMBO',
    description: 'La provoleta del jueves cayó pesada y la mitad del equipo amaneció con gastroenteritis aguda.',
    optionA: 'Darles té de boldo y mandarlos a la cancha igual',
    optionB: 'Suspender la charla técnica e inventar una cábala nueva',
  },
  {
    id: 'q-6',
    title: 'VISITA DE LA BARRA BRAVA',
    category: 'QUILOMBO',
    description: 'Aparecieron 12 autos sin patente en el estacionamiento para "charlar amablemente sobre actitud".',
    optionA: 'Salir solo a tomar mate con el jefe de la barra',
    optionB: 'Llamar a la policía y suspender el entrenamiento a puertas cerradas',
  },
  {
    id: 'q-7',
    title: 'CÁBALA ROTA POR ERROR',
    category: 'QUILOMBO',
    description: 'El utilero lavó sin querer el buzo de la suerte que no se lavaba desde la fecha 3.',
    optionA: 'Tirar sal gruesa en los cuatro córners del vestuario',
    optionB: 'Ignorar la mufa y apelar a la ciencia del pizarrón táctico',
  },
  {
    id: 'q-8',
    title: 'CONFLICTO DE AMORÍO Y FARÁNDULA',
    category: 'QUILOMBO',
    description: 'Un programa de chismes de la tarde revela que el jugador está saliendo con la ex del delantero rival.',
    optionA: 'Aprovechar el morbo para desconcentrar al rival',
    optionB: 'Prohibirle el uso de redes sociales hasta fin de temporada',
  },
  {
    id: 'q-9',
    title: 'EL FANTASMA DE LA AFIP',
    category: 'QUILOMBO',
    description: 'Llega una intimación judicial a la sede del club por los derechos formativos y el contrato en dólares.',
    optionA: 'Declarar "Yo de números no entiendo, solo hablo de la pelota"',
    optionB: 'Contratar de urgencia a un contador mediático',
  },
  {
    id: 'q-10',
    title: 'OFERTA TENTADORA DESDE ARABIA',
    category: 'QUILOMBO',
    description: 'Llega un emisario con un contrato en euros y un camello de oro para llevarse a tu jugador ya mismo.',
    optionA: 'Esconder el pasaporte del jugador en el bolsillo del saco',
    optionB: 'Exigir que pongan toda la guita junta al contado',
  },
  {
    id: 'q-11',
    title: 'EL TUIT DE LAS 3 DE LA MAÑANA',
    category: 'QUILOMBO',
    description: 'El jugador publicó un emoji de payaso arrobando al presidente de la AFA tras un penal polémico.',
    optionA: 'Decir que le hackearon la cuenta desde Rusia',
    optionB: 'Retuitear el mensaje desde tu cuenta oficial de DT',
  },
  {
    id: 'q-12',
    title: 'CORTE DE LUZ EN LA CANCHA',
    category: 'QUILOMBO',
    description: 'En pleno partido se corta la luz del estadio y se escuchan ruidos extraños en los pasillos.',
    optionA: 'Aprovechar la oscuridad para meter un cambio antirreglamentario',
    optionB: 'Encender las linternas de los celulares y arengar a la tribuna',
  },
  {
    id: 'q-13',
    title: 'EL BRUJO DE QUILMES',
    category: 'QUILOMBO',
    description: 'Un vidente barrial asegura que hay un sapo enterrado abajo del arco de la tribuna local.',
    optionA: 'Ir con una pala a las 2 AM a desenterrar el maleficio',
    optionB: 'Llevar agua bendita donada por la abuela del arquero',
  },
  {
    id: 'q-14',
    title: 'LA CONFESIÓN DEL KINESIÓLOGO',
    category: 'QUILOMBO',
    description: 'El kinesiólogo confiesa que el titular jugó los últimos 4 partidos infiltrado con líquido de freno.',
    optionA: 'Ponerle cinta tape negra y mandarlo a cabecear',
    optionB: 'Hacerlo descansar y darle minutos al pibe de la reserva',
  },
  {
    id: 'q-15',
    title: 'EL PARO SORPRESA DE COLECTIVOS',
    category: 'QUILOMBO',
    description: 'El micro del plantel quedó varado en el puente y faltan 30 minutos para el pitazo inicial.',
    optionA: 'Hacer dedo y subir al equipo en la caja de una camioneta flete',
    optionB: 'Hacer el precalentamiento corriendo por la banquina de la autopista',
  }
];

/**
 * Event probability configuration:
 * Events cannot occur back-to-back (if an event just occurred on the previous slot/player,
 * chance is 0% to completely prevent consecutive events).
 * Base probabilities are balanced to trigger roughly once every 4-5 players (~20-22% per slot).
 */
export const BASE_EVENT_PROBABILITIES = [
  0.0,  // Pos 0 (ARQ) - strictly 0%
  0.22, // Pos 1
  0.20, // Pos 2
  0.22, // Pos 3
  0.20, // Pos 4
  0.22, // Pos 5
  0.20, // Pos 6
  0.22, // Pos 7
  0.20, // Pos 8
  0.22, // Pos 9
  0.20  // Pos 10
];

export function shouldTriggerEvent(
  posIdx: number,
  randomFloat: number,
  previousEventOccurred: boolean = false
): boolean {
  // Never on ARQ (posIdx 0)
  if (posIdx === 0) return false;

  // Never 2 events in a row (prevents back-to-back events)
  if (previousEventOccurred) {
    return false;
  }

  const prob = BASE_EVENT_PROBABILITIES[posIdx] ?? 0.20;
  return randomFloat < prob;
}
