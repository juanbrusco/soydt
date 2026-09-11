import specialImg1 from '../../assets/images/salto_special1.jpeg';
import specialImg2 from '../../assets/images/salto_special2.jpeg';
import specialImg3 from '../../assets/images/salto_special3.jpeg';
import specialImg4 from '../../assets/images/salto_special4.jpeg';
import specialImg5 from '../../assets/images/salto_special5.jpeg';
import specialImg6 from '../../assets/images/salto_special6.jpeg';

export interface WorldFootballTrivia {
  id: string;
  question: string;
  correctAnswer: string;
  wrongAnswer: string;
}

export interface SpecialVariant {
  id: string;
  title: string;
  badge: string;
  image: string;
  funnyDescription: string;
  pointsSuccess: number;
  pointsFailure: number;
  successText: string;
  failureText: string;
}

export const SPECIAL_FOOTBALL_TRIVIA: WorldFootballTrivia[] = [
   {
    id: "trivia_1",
    question: "¿En qué año se fundó Compañía?",
    correctAnswer: "1922",
    wrongAnswer: "1924"
  },
  {
    id: "trivia_2",
    question: "¿En qué año se fundó Defensores?",
    correctAnswer: "1922",
    wrongAnswer: "1923"
  },
  {
    id: "trivia_3",
    question: "¿En qué año se fundó Sports?",
    correctAnswer: "1921",
    wrongAnswer: "1922"
  },
  {
    id: "trivia_4",
    question: "¿En qué año se creó la Liga De Salto?",
    correctAnswer: "1928",
    wrongAnswer: "1926"
  },
  {
    id: "trivia_5",
    question: "¿Cómo se llama el estadio de CUSA?",
    correctAnswer: "Robert Norman Wright",
    wrongAnswer: "Oscar Barkigjije"
  },
  {
    id: "trivia_6",
    question: "¿Cómo se llama el estadio de Compañía?",
    correctAnswer: "Guillermo Cepeda",
    wrongAnswer: "Marcelo José Colombini"
  },
   {
    id: "trivia_7",
    question: "¿Cómo se llama el estadio de Defensores?",
    correctAnswer: "Carlos Testa",
    wrongAnswer: "Raúl Castagno"
  },
   {
    id: "trivia_8",
    question: "¿Cómo se llama el estadio de Sports?",
    correctAnswer: "Esteban Chiari",
    wrongAnswer: "Jorge Omar Galli"
  },
   {
    id: "trivia_9",
    question: "¿Cómo se llama el estadio de Alumni?",
    correctAnswer: "Rafael Giampietri",
    wrongAnswer: "Omar Pérez"
  },
  {
    id: "trivia_10",
    question: "¿Quién es el máximo goleador de la historia de Defensores?",
    correctAnswer: "Feliciano Testa",
    wrongAnswer: "Raúl Castagno"
  },
  {
    id: "trivia_11",
    question: "¿Quién es el máximo goleador de la historia de Compañía?",
    correctAnswer: "Nicolás Colombini",
    wrongAnswer: "Miguel Lescano"
  },
  {
    id: "trivia_12",
    question: "¿Quién es el máximo goleador de la historia de Sports?",
    correctAnswer: "Luciano Ciraco",
    wrongAnswer: "Daniel Ramos"
  },
  {
    id: "trivia_13",
    question: "¿Quién es el máximo goleador de la historia de Cusa?",
    correctAnswer: "Matias Jofré",
    wrongAnswer: "Carlos González"
  },
  {
    id: "trivia_14",
    question: "¿Quién es el jugador con más partidos jugados de la historia de Compañía?",
    correctAnswer: "Nicolás Colombini",
    wrongAnswer: "Marcelo Colombini"
  },
  {
    id: "trivia_15",
    question: "¿Quién es el jugador con más partidos jugados de la historia de Defensores?",
    correctAnswer: "Feliciano Testa",
    wrongAnswer: "Franco Favergiotti"
  },
  {
    id: "trivia_16",
    question: "¿Quién es el jugador con más partidos jugados de la historia de Sports?",
    correctAnswer: "Luciano Ciraco",
    wrongAnswer: "Germán Bartolino"
  },
  {
    id: "trivia_17",
    question: "¿Quién es el jugador con más partidos jugados de la historia de Cusa?",
    correctAnswer: "Matias Jofré",
    wrongAnswer: "Juan Bartolino"
  },
  {
    id: "trivia_18",
    question: "¿Quién es el jugador con más títulos en el Fútbol de Salto?",
    correctAnswer: "Franco Favergiotti",
    wrongAnswer: "Marcelo Gizzi"
  },
  {
    id: "trivia_19",
    question: "¿Cúal fue la mayor goleada en el Fútbol de Salto?",
    correctAnswer: "12 - 0",
    wrongAnswer: "8 - 0"
  },
  {
    id: "trivia_20",
    question: "¿Quién es el jugador (más antiguo) que hizo más goles en un partido en el fútbol de Salto?",
    correctAnswer: "Horacio Monacci",
    wrongAnswer: "Cristian Buglione"
  }
];

export const SPECIAL_VARIANTS: SpecialVariant[] = [
  {
    id: "salto_special_1",
    title: "EL SILLÓN DE BELUDEPORTIVO",
    badge: "EVENTO ESPECIAL",
    image: specialImg1,
    funnyDescription: "BeluDeportivo te critica desde el sillón, respondé la pregunta y demostrale que sabes más!",
    pointsSuccess: 3,
    pointsFailure: -1,
    successText: "¡CONOCIMIENTO TOTAL! BeluDeportivo te invita a su próxima entrevista para pedirte disculpas.",
    failureText: "¡LE ERRASTE! BeluDeportivo publica un video del entrenamiento desastrozo que tuvieron en la semana."
  },
  {
    id: "salto_special_2",
    title: "LA NOCHE DE SALTO",
    badge: "EVENTO ESPECIAL",
    image: specialImg2,
    funnyDescription: "Tu delantero tuvo una pelea en Magno contra la hinchada rival, respondé la pregunta y sacalo de la comisaría!",
    pointsSuccess: 3,
    pointsFailure: -1,
    successText: "¡CONOCIMIENTO TOTAL! Liberaron al delantero y puede jugar el domingo.",
    failureText: "¡LE ERRASTE! El delantero queda preso, no hay goles en tu equipo."
  },
  {
    id: "salto_special_3",
    title: "ZORROS AL ATAQUE",
    badge: "EVENTO ESPECIAL",
    image: specialImg3,
    funnyDescription: "Tu arquero se pasó de copas en la comida del club, respondé la pregunta y evitá que le retengan el auto!",
    pointsSuccess: 3,
    pointsFailure: -1,
    successText: "¡CONOCIMIENTO TOTAL! Hablaste con el inspector y sólo hubo que pagar una pequeña multa.",
    failureText: "¡LE ERRASTE! El arquero se quedó a pata y no pudo ir a entrenar en la semana."
  },
  {
    id: "salto_special_4",
    title: "EL INTENDENTE",
    badge: "EVENTO ESPECIAL",
    image: specialImg4,
    funnyDescription: "El Intendente quiere suspender la fecha por una carrera de bicis, respondé la pregunta y evitá que lo haga!",
    pointsSuccess: 3,
    pointsFailure: -1,
    successText: "¡CONOCIMIENTO TOTAL! Lo convenciste y la carrera se hace otro día.",
    failureText: "¡LE ERRASTE! Chau fútbol este fin de semana."
  },
  {
    id: "salto_special_5",
    title: "LA LIGA SE EQUIVOCA",
    badge: "EVENTO ESPECIAL",
    image: specialImg5,
    funnyDescription: "Jorge anotó tarde el pase de tu nuevo defensor, respondé la pregunta y obtené una prórroga!",
    pointsSuccess: 3,
    pointsFailure: -1,
    successText: "¡CONOCIMIENTO TOTAL! Te dieron una semana más en el mercado de pases.",
    failureText: "¡LE ERRASTE! Afrontás el torneo sin tu refuerzo."
  },
  {
    id: "salto_special_5",
    title: "STREAMING",
    badge: "EVENTO ESPECIAL",
    image: specialImg6,
    funnyDescription: "Te invitan al streaming deportivo de Salto y te preguntan sobre el fútbol local, respondé y demostrá lo que sabés!",
    pointsSuccess: 3,
    pointsFailure: -1,
    successText: "¡CONOCIMIENTO TOTAL! El vivo de YouTube rompe récords con tu presencia.",
    failureText: "¡LE ERRASTE! El chat de YouTube se llena de críticas hacia vos."
  }
];
