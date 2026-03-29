import { useState, useEffect, useCallback } from 'react';
import { 
  GamePhase, 
  PlayerID, 
  Ship, 
  GameState, 
  INITIAL_SHIPS_PER_PLAYER, 
  SETUP_DURATION,
  GRID_WIDTH,
  GRID_HEIGHT,
  HexCoord,
  isHexInGrid
} from '../types';
import { hexEqual, getNeighbors, isWithinBounds, getGridCoords } from '../utils/hexUtils';

const createInitialShips = (): Ship[] => {
  const initialShips: Ship[] = [];
  const allCoords = getGridCoords(GRID_WIDTH, GRID_HEIGHT);

  // Player 1 ships start at the bottom
  const p1StartCoords = allCoords.filter(c => c.r >= GRID_HEIGHT - 2);
  for (let i = 0; i < INITIAL_SHIPS_PER_PLAYER; i++) {
    initialShips.push({
      id: `p1-ship-${i}`,
      owner: 'Player1',
      coord: p1StartCoords[i] || { q: 0, r: GRID_HEIGHT - 1 },
      isAlive: true,
    });
  }

  // Player 2 ships start at the top
  const p2StartCoords = allCoords.filter(c => c.r <= 1);
  for (let i = 0; i < INITIAL_SHIPS_PER_PLAYER; i++) {
    initialShips.push({
      id: `p2-ship-${i}`,
      owner: 'Player2',
      coord: p2StartCoords[i] || { q: 0, r: 0 },
      isAlive: true,
    });
  }
  return initialShips;
};

const getInitialGameState = (): GameState => ({
  phase: GamePhase.Lobby,
  currentPlayer: 'Player1',
  ships: createInitialShips(),
  turnActions: { hasMoved: false, hasShot: false },
  setupTimer: SETUP_DURATION,
  winner: null,
  lastExplosion: null,
  lastLaunch: null,
  lastShot: null,
});

export function useGameLogic() {
  const [state, setState] = useState<GameState>(getInitialGameState);

  // Setup timer
  useEffect(() => {
    if (state.phase !== GamePhase.Setup) return;
    if (state.setupTimer <= 0) {
      setState(s => ({ 
        ...s, 
        phase: GamePhase.Battle, 
        currentPlayer: 'Player1',
        turnActions: { hasMoved: false, hasShot: false }
      }));
      return;
    }
    const timer = setInterval(() => {
      setState(s => ({ ...s, setupTimer: s.setupTimer - 1 }));
    }, 1000);
    return () => clearInterval(timer);
  }, [state.phase, state.setupTimer]);

  // Auto-clear combat effects after a delay
  useEffect(() => {
    if (state.lastExplosion || state.lastLaunch || state.lastShot) {
      const timer = setTimeout(() => {
        setState(s => ({ 
          ...s, 
          lastExplosion: null, 
          lastLaunch: null, 
          lastShot: null 
        }));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.lastExplosion, state.lastLaunch, state.lastShot]);

  const moveShip = useCallback((shipId: string, targetCoord: HexCoord) => {
    if (!isHexInGrid(targetCoord)) return;

    setState(s => {
      if (s.phase === GamePhase.Battle && s.turnActions.hasMoved) return s;
      
      const newShips = s.ships.map(ship => 
        ship.id === shipId ? { ...ship, coord: targetCoord } : ship
      );

      const newTurnActions = s.phase === GamePhase.Battle 
        ? { ...s.turnActions, hasMoved: true }
        : s.turnActions;

      return { 
        ...s, 
        ships: newShips, 
        turnActions: newTurnActions,
        lastShot: null, // Clear last action when a new one starts
        lastLaunch: null,
        lastExplosion: null
      };
    });
  }, []);

  const shoot = useCallback((originCoord: { q: number; r: number }, targetCoord: { q: number; r: number }) => {
    setState(s => {
      if (s.phase !== GamePhase.Battle || s.turnActions.hasShot) return s;

      const newShips = s.ships.map(ship => {
        if (hexEqual(ship.coord, targetCoord)) {
          return { ...ship, isAlive: false };
        }
        return ship;
      });

      // Check win condition
      const p1Alive = newShips.filter(sh => sh.owner === 'Player1' && sh.isAlive).length;
      const p2Alive = newShips.filter(sh => sh.owner === 'Player2' && sh.isAlive).length;

      let winner: (typeof s)['winner'] = s.winner;
      let phase: GamePhase = s.phase;
      if (p1Alive === 0) {
        winner = 'Player2';
        phase = GamePhase.GameOver;
      } else if (p2Alive === 0) {
        winner = 'Player1';
        phase = GamePhase.GameOver;
      }

      return { 
        ...s, 
        phase,
        winner,
        ships: newShips, 
        turnActions: { ...s.turnActions, hasShot: true },
        lastExplosion: targetCoord,
        lastLaunch: originCoord,
        lastShot: { start: originCoord, end: targetCoord }
      };
    });
  }, []);

  const endTurn = useCallback(() => {
    setState(s => {
      // Moving is now optional, only shooting is required to end turn
      if (!s.turnActions.hasShot) return s;
      return {
        ...s,
        currentPlayer: s.currentPlayer === 'Player1' ? 'Player2' : 'Player1',
        turnActions: { hasMoved: false, hasShot: false },
        lastExplosion: null,
        lastLaunch: null,
        lastShot: null
      };
    });
  }, []);

  const startSetup = useCallback(() => {
    setState(() => ({
      ...getInitialGameState(),
      phase: GamePhase.Setup
    }));
  }, []);

  const startBattle = useCallback(() => {
    setState(s => ({ 
      ...s, 
      phase: GamePhase.Battle, 
      setupTimer: 0,
      currentPlayer: 'Player1',
      turnActions: { hasMoved: false, hasShot: false }
    }));
  }, []);

  return {
    state,
    moveShip,
    shoot,
    endTurn,
    startBattle,
    startSetup,
  };
}
