
export type PlayerID = 'Player1' | 'Player2';

export enum GamePhase {
  Lobby = 'Lobby',
  Setup = 'Setup',
  Battle = 'Battle',
  GameOver = 'GameOver'
}

export interface HexCoord {
  q: number;
  r: number;
}

export interface Ship {
  id: string;
  owner: PlayerID;
  coord: HexCoord;
  isAlive: boolean;
}

export interface GameState {
  phase: GamePhase;
  currentPlayer: PlayerID;
  ships: Ship[];
  turnActions: {
    hasMoved: boolean;
    hasShot: boolean;
  };
  setupTimer: number;
  winner: PlayerID | null;
  lastExplosion: HexCoord | null;
  lastLaunch: HexCoord | null;
  lastShot: { start: HexCoord; end: HexCoord } | null;
}

export const GRID_WIDTH = 14;
export const GRID_HEIGHT = 11;
export const INITIAL_SHIPS_PER_PLAYER = 12;
export const SETUP_DURATION = 30;

export const isHexInGrid = (coord: HexCoord): boolean => {
  const r = coord.r;
  if (r < 0 || r >= GRID_HEIGHT) return false;
  const qOffset = Math.floor(r / 2);
  const rowWidth = r % 2 === 0 ? GRID_WIDTH : GRID_WIDTH - 1;
  return coord.q >= -qOffset && coord.q < rowWidth - qOffset;
};

// ============= SHOP THEME SYSTEM =============
export type ShipTheme = 'classic' | 'neon' | 'stealth' | 'elite';
export type ProjectileTheme = 'standard' | 'electric' | 'plasma';
export type ExplosionTheme = 'default' | 'nuclear' | 'cyber';

export interface ThemePricing {
  type: 'free' | 'premium';
  price?: number;
}

export interface GameTheme {
  ships: ShipTheme;
  projectiles: ProjectileTheme;
  explosions: ExplosionTheme;
}

export const DEFAULT_THEME: GameTheme = {
  ships: 'classic',
  projectiles: 'standard',
  explosions: 'default'
};

export const SHIP_THEMES: ShipTheme[] = ['classic', 'neon', 'stealth', 'elite'];
export const PROJECTILE_THEMES: ProjectileTheme[] = ['standard', 'electric', 'plasma'];
export const EXPLOSION_THEMES: ExplosionTheme[] = ['default', 'nuclear', 'cyber'];

// Pricing for themes
export const THEME_PRICING: Record<string, ThemePricing> = {
  // Ships
  'classic': { type: 'free' },
  'neon': { type: 'premium', price: 9.99 },
  'stealth': { type: 'premium', price: 9.99 },
  'elite': { type: 'premium', price: 14.99 },
  // Projectiles
  'standard': { type: 'free' },
  'electric': { type: 'premium', price: 4.99 },
  'plasma': { type: 'premium', price: 4.99 },
  // Explosions
  'default': { type: 'free' },
  'nuclear': { type: 'premium', price: 4.99 },
  'cyber': { type: 'premium', price: 4.99 }
};
