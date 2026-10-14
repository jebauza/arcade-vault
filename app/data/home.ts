import type { Game } from '@/app/data/games';

export type NeonColor = 'cyan' | 'magenta' | 'yellow' | 'green';

export type FeatureKind = 'GAMEPAD' | 'FREE' | 'TROPHY' | 'ROCKET';

export type Feature = {
  icon: FeatureKind;
  title: string;
  description: string;
  color: NeonColor;
};

export type HomeStat = { value: string; unit: string; caption: string };

export type RecentScore = {
  player: string;
  gameId: Game['id']; // title is resolved from GAMES
  score: number;
  ago: string;
  color: NeonColor;
};

export type TopPlayer = { rank: number; player: string; score: number };

export type FaqItem = { question: string; answer: string };

export const FEATURES: Feature[] = [
  {
    icon: 'GAMEPAD',
    title: 'JUEGOS CLÁSICOS',
    description:
      'Arkanoid, Tetris, Snake y muchos más. Los mejores arcades de todos los tiempos en un solo lugar.',
    color: 'cyan',
  },
  {
    icon: 'FREE',
    title: '100% GRATIS',
    description:
      'Sin suscripciones, sin pagos ocultos. Todos los juegos disponibles de forma gratuita.',
    color: 'yellow',
  },
  {
    icon: 'TROPHY',
    title: 'LADDER BOARDS',
    description:
      'Compite con jugadores de todo el mundo. Escala el ranking y demuestra quién es el mejor.',
    color: 'magenta',
  },
  {
    icon: 'ROCKET',
    title: 'SIEMPRE CRECIENDO',
    description:
      'Agregamos nuevos juegos constantemente. Vuelve seguido, siempre habrá algo nuevo que jugar.',
    color: 'green',
  },
];

export const HOME_STATS: HomeStat[] = [
  { value: '12+', unit: 'JUEGOS', caption: 'Y CONTANDO' },
  { value: 'MILES', unit: 'DE PARTIDAS', caption: 'JUGADAS CADA DÍA' },
  { value: 'GLOBAL', unit: 'RANKING', caption: 'COMPITE CON EL MUNDO' },
];

export const RECENT_SCORES: RecentScore[] = [
  { player: 'NEONFOX', gameId: 'drop', score: 184220, ago: 'hace 2 min', color: 'magenta' },
  { player: 'PX_KAI', gameId: 'glutton', score: 96400, ago: 'hace 5 min', color: 'yellow' },
  { player: 'Z3R0COOL', gameId: 'invaders', score: 54190, ago: 'hace 8 min', color: 'green' },
  { player: 'VAULT_07', gameId: 'asteroids', score: 41200, ago: 'hace 12 min', color: 'cyan' },
  { player: 'GLITCHA', gameId: 'brick-buster', score: 28450, ago: 'hace 18 min', color: 'cyan' },
  { player: 'ARKADYA', gameId: 'snake', score: 7820, ago: 'hace 24 min', color: 'green' },
  { player: 'CYBER_LU', gameId: 'crossing', score: 18900, ago: 'hace 31 min', color: 'yellow' },
];

export const TOP_PLAYERS_TODAY: TopPlayer[] = [
  { rank: 1, player: 'NEONFOX', score: 312840 },
  { rank: 2, player: 'PX_KAI', score: 248110 },
  { rank: 3, player: 'M00NRYU', score: 196720 },
  { rank: 4, player: 'VAULT_07', score: 154300 },
  { rank: 5, player: 'GLITCHA', score: 138900 },
];

export const PRICING_FEATURES: string[] = [
  'Acceso a todos los juegos',
  'Ranking global y salón de la fama',
  'Sin anuncios entre partidas',
  'Guarda tus puntuaciones',
  'Nuevos juegos cada mes',
  'Funciona en cualquier navegador',
];

export const FAQ: FaqItem[] = [
  {
    question: '¿REALMENTE ES GRATIS?',
    answer:
      'Sí. Arcade Vault es un proyecto sin fines de lucro hecho por amor a los clásicos. No hay versión "premium" escondida.',
  },
  {
    question: '¿NECESITO CREAR CUENTA?',
    answer:
      'No. Puedes jugar como invitado. Si quieres guardar tu puntuación y aparecer en el ranking, regístrate en 10 segundos.',
  },
  {
    question: '¿CÓMO SOBREVIVEN SIN COBRAR?',
    answer:
      'Es un proyecto comunitario. Si te gusta, compártelo. Esa es toda la moneda que aceptamos.',
  },
];
