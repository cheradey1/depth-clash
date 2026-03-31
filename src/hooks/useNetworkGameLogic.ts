import { useEffect, useRef, useCallback, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { GameState, GamePhase, Ship, HexCoord, PlayerID, GRID_HEIGHT, GRID_WIDTH, INITIAL_SHIPS_PER_PLAYER } from '../types';
import { getGridCoords } from '../utils/hexUtils';

const SERVER_URL = (import.meta as any).env?.VITE_SERVER_URL || 'http://localhost:4000';

interface NetworkGameLogicOptions {
  isOnline: boolean;
  nickname?: string;
  roomId?: string;
  onShotHit?: (hit: boolean) => void;
  onGameOver?: (winner: string, wasVictory: boolean) => void;
}

const buildInitialShips = (owner: PlayerID | null): Ship[] => {
  if (!owner) {
    return [];
  }

  const allCoords = getGridCoords(GRID_WIDTH, GRID_HEIGHT);
  const ships: Ship[] = [];
  const startCoords = owner === 'Player1'
    ? allCoords.filter(c => c.r >= GRID_HEIGHT - 2)
    : allCoords.filter(c => c.r <= 1);

  for (let i = 0; i < INITIAL_SHIPS_PER_PLAYER; i++) {
    ships.push({
      id: `${owner.toLowerCase()}-ship-${i}`,
      owner,
      coord: startCoords[i] || { q: 0, r: owner === 'Player1' ? GRID_HEIGHT - 1 : 0 },
      isAlive: true
    });
  }

  return ships;
};

export const useNetworkGameLogic = (options: NetworkGameLogicOptions) => {
  const socketRef = useRef<Socket | null>(null);
  const [selfPlayerKey, setSelfPlayerKey] = useState<PlayerID | null>(null);
  const [userId] = useState<string>(() => {
    if (typeof window === 'undefined') return `guest-${Math.random().toString(36).substring(2, 10)}`;
    const stored = window.localStorage.getItem('depth-clash-user-id');
    if (stored) return stored;
    const generated = window.crypto?.randomUUID?.() || `user-${Math.random().toString(36).substring(2, 10)}`;
    window.localStorage.setItem('depth-clash-user-id', generated);
    return generated;
  });
  const [state, setState] = useState<GameState>({
    phase: GamePhase.Lobby,
    currentPlayer: 'Player1',
    ships: [],
    turnActions: { hasMoved: false, hasShot: false },
    setupTimer: 30,
    winner: null,
    lastExplosion: null,
    lastLaunch: null,
    lastShot: null
  });
  
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [roomInfo, setRoomInfo] = useState<{ roomId: string; playerKey: PlayerID } | null>(null);
  const [inventory, setInventory] = useState<{ currency_balance: number; premium_ship_count: number } | null>(null);

  // Initialize WebSocket
  useEffect(() => {
    if (!options.isOnline) return;

    const socket = io(SERVER_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    socketRef.current = socket;
    setConnectionState('connecting');

    // Connection events
    socket.on('connect', () => {
      console.log('[WS] Connected to server');
      setConnectionState('connected');

      if (typeof window !== 'undefined') {
        const savedMatchId = window.localStorage.getItem('activeMatchId');
        if (savedMatchId) {
          console.log('[WS] Attempting reconnect to saved match:', savedMatchId);
          socket.emit('reconnect_to_match', { matchId: savedMatchId, userId });
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('[WS] Disconnected from server');
      setConnectionState('disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('[WS] Connection error:', error);
      setConnectionState('disconnected');
    });

    // Room events
    socket.on('room_created', (data) => {
      console.log('[WS] Room created:', data);
      setRoomInfo({ roomId: data.roomId, playerKey: data.playerKey });
      setSelfPlayerKey(data.playerKey);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('activeMatchId', data.roomId);
      }
      setState(prev => ({
        ...prev,
        phase: GamePhase.Setup,
        currentPlayer: 'Player1',
        ships: buildInitialShips(data.playerKey),
        setupTimer: 30
      }));
    });

    socket.on('room_joined', (data) => {
      console.log('[WS] Room joined:', data);
      setRoomInfo({ roomId: data.roomId, playerKey: data.playerKey });
      setSelfPlayerKey(data.playerKey);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('activeMatchId', data.roomId);
      }
      setState(prev => ({
        ...prev,
        phase: GamePhase.Setup,
        currentPlayer: data.playerKey,
        ships: buildInitialShips(data.playerKey),
        setupTimer: 30
      }));
    });

    socket.on('inventory', (data) => {
      console.log('[WS] Inventory loaded:', data);
      setInventory(data);
    });

    socket.on('inventory_updated', (data) => {
      console.log('[WS] Inventory updated:', data);
      setInventory(data);
    });

    socket.on('join_error', (data) => {
      console.error('[WS] Join error:', data.message);
      alert(`Error: ${data.message}`);
    });

    socket.on('player_joined', (data) => {
      console.log('[WS] Player joined:', data);
      if (data.readyToStart) {
        setState(prev => ({ ...prev, phase: GamePhase.Setup }));
      }
    });

    socket.on('ship_placed', (data) => {
      console.log('[WS] Ship placed:', data);
      setState(prev => {
        const existing = prev.ships.find(s => s.id === data.shipId && s.owner === data.playerKey);
        if (existing) {
          return {
            ...prev,
            ships: prev.ships.map(ship => ship.id === data.shipId && ship.owner === data.playerKey ? { ...ship, coord: data.coord } : ship)
          };
        }

        return {
          ...prev,
          ships: [...prev.ships, { id: data.shipId, owner: data.playerKey, coord: data.coord, isAlive: true }]
        };
      });
    });

    socket.on('setup_start', (data) => {
      console.log('[WS] Setup phase started');
      setState(prev => ({
        ...prev,
        phase: GamePhase.Setup,
        setupTimer: data.setupTimer
      }));
    });

    socket.on('battle_start', (data) => {
      console.log('[WS] Battle started');
      setState(prev => ({
        ...prev,
        phase: GamePhase.Battle,
        currentPlayer: data.currentPlayer,
        turnActions: { hasMoved: false, hasShot: false }
      }));
    });

    socket.on('ship_moved', (data) => {
      console.log('[WS] Ship moved:', data);
      // Update local state with ship movement
      setState(prev => ({
        ...prev,
        ships: prev.ships.map(ship =>
          ship.id === data.shipId ? { ...ship, coord: data.targetCoord } : ship
        )
      }));
    });

    socket.on('shot_result', (data) => {
      console.log('[WS] Shot result');
      setState(prev => ({
        ...prev,
        lastShot: { start: data.originCoord, end: data.targetCoord },
        lastLaunch: data.originCoord,
        lastExplosion: data.hit ? data.targetCoord : null
      }));
      if (data.hit && options.onShotHit) {
        options.onShotHit(true);
      }
    });

    socket.on('ship_destroyed', (data) => {
      console.log('[WS] Ship destroyed:', data);
      setState(prev => ({
        ...prev,
        ships: prev.ships.filter(ship => ship.id !== data.shipId)
      }));
    });

    socket.on('reconnect_success', (data) => {
      console.log('[WS] Reconnect successful:', data);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('activeMatchId', data.roomId);
      }
      setRoomInfo({ roomId: data.roomId, playerKey: data.playerKey });
      setSelfPlayerKey(data.playerKey);
      setState(prev => ({
        ...prev,
        phase: data.phase === 'battle' ? GamePhase.Battle : data.phase === 'setup' ? GamePhase.Setup : GamePhase.Lobby,
        currentPlayer: data.currentPlayer || prev.currentPlayer,
        ships: data.ships || prev.ships
      }));
    });

    socket.on('reconnect_failed', (data) => {
      console.warn('[WS] Reconnect failed:', data);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('activeMatchId');
      }
      if (data?.message) alert(`Reconnect failed: ${data.message}`);
    });

    socket.on('turn_ended', (data) => {
      console.log('[WS] Turn ended, next player:', data.nextPlayer);
      setState(prev => ({
        ...prev,
        currentPlayer: data.nextPlayer,
        turnActions: { hasMoved: false, hasShot: false }
      }));
    });

    socket.on('setup_start', (data) => {
      console.log('[WS] Setup phase started');
      setState(prev => ({
        ...prev,
        phase: GamePhase.Setup,
        setupTimer: data.setupTimer
      }));
    });

    socket.on('opponent_ship_placed', (data) => {
      console.log('[WS] Opponent placed ship:', data);
      // Could show opponent ship count for UI feedback
    });

    socket.on('game_over', (data) => {
      console.log('[WS] Game over:', data);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('activeMatchId');
      }
      setState(prev => ({
        ...prev,
        phase: GamePhase.GameOver,
        winner: data.winner
      }));
      if (options.onGameOver) {
        const wasVictory = selfPlayerKey === data.winner;
        options.onGameOver(data.winner, wasVictory);
      }
    });

    socket.on('room_expired', (data) => {
      console.log('[WS] Room expired:', data);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('activeMatchId');
      }
      alert('Room has expired');
      setRoomInfo(null);
      setState(prev => ({ ...prev, phase: GamePhase.Lobby }));
    });

    return () => {
      socket.disconnect();
    };
  }, [options.isOnline]);

  // Game actions
  const createRoom = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit('create_room', { userId, nickname: options.nickname || 'Player' });
  }, [options.nickname, userId]);

  const joinRoom = useCallback((roomId: string) => {
    if (!socketRef.current) return;

    const normalizedRoomId = roomId.toUpperCase();
    if (roomInfo && roomInfo.roomId === normalizedRoomId) {
      console.log('[WS] joinRoom skipped: already in room', normalizedRoomId);
      return;
    }

    socketRef.current.emit('join_room', {
      roomId: normalizedRoomId,
      nickname: options.nickname || 'Player',
      userId
    });
  }, [options.nickname, roomInfo, userId]);

  const moveShip = useCallback((shipId: string, targetCoord: HexCoord) => {
    if (!socketRef.current || !roomInfo) return;
    socketRef.current.emit('move_ship', { shipId, targetCoord });
  }, [roomInfo]);

  const placeShip = useCallback((shipId: string, coord: HexCoord) => {
    if (!socketRef.current || !roomInfo || !selfPlayerKey) return;

    // Optimistic local update for player responsiveness
    setState(prev => ({
      ...prev,
      ships: prev.ships.map(ship =>
        ship.id === shipId && ship.owner === selfPlayerKey ? { ...ship, coord } : ship
      )
    }));

    socketRef.current.emit('place_ship', { shipId, coord });
  }, [roomInfo, selfPlayerKey]);

  const shoot = useCallback((originCoord: HexCoord, targetCoord: HexCoord) => {
    if (!socketRef.current || !roomInfo) return;
    socketRef.current.emit('shoot', { originCoord, targetCoord });
  }, [roomInfo]);

  const endTurn = useCallback(() => {
    if (!socketRef.current || !roomInfo) return;
    socketRef.current.emit('end_turn');
  }, [roomInfo]);

  const requestInventory = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit('get_inventory');
  }, []);

  const buyPremiumShip = useCallback((cost = 10) => {
    if (!socketRef.current) return;
    socketRef.current.emit('buy_premium_ship', { cost });
  }, []);

  const playerReady = useCallback(() => {
    if (!socketRef.current || !roomInfo) return;
    socketRef.current.emit('player_ready');
  }, [roomInfo]);

  const startSetup = useCallback(() => {
    createRoom();
  }, [createRoom]);

  const startBattle = useCallback(() => {
    playerReady();
  }, [playerReady]);

  return {
    state,
    selfPlayerKey,
    moveShip,
    shoot,
    endTurn,
    startBattle,
    startSetup,
    placeShip,
    roomInfo,
    connectionState,
    createRoom,
    joinRoom,
    requestInventory,
    buyPremiumShip,
    inventory,
    isOnline: options.isOnline
  };
};
