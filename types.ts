export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export interface GameState {
  status: GameStatus;
  score: number;
  speed: number;
  highScore: number;
}

export interface CarPosition {
  x: number;
  z: number;
  lane: number; // -1 (left), 0 (center), 1 (right)
  speed: number;
  color: string;
}

export interface Controls {
  left: boolean;
  right: boolean;
  forward: boolean; // Accelerate
  backward: boolean; // Brake
}

export const LANE_WIDTH = 2.5;
export const PLAYER_SPEED_LATERAL = 0.15;
export const ACCELERATION = 0.005;
export const MAX_SPEED = 0.8;
export const MIN_SPEED = 0.3;
