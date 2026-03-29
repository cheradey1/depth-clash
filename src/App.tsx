import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameLogic } from './hooks/useGameLogic';
import { useNetworkGameLogic } from './hooks/useNetworkGameLogic';
import { getGridCoords, hexToPixel, hexEqual, getNeighbors, pixelToHex } from './utils/hexUtils';
import { HexTile } from './components/HexTile';
import { Ship, SubmarineIcon, SHIP_IMAGE_MAP } from './components/Ship';
import { Projectile, Explosion } from './components/CombatEffects';
import { OnlineGameLobby } from './components/OnlineGameLobby';
import { ShopPanel } from './components/ShopPanel';
import { Tutorial } from './components/Tutorial';
import { GRID_WIDTH, GRID_HEIGHT, GamePhase, HexCoord, Ship as ShipType, INITIAL_SHIPS_PER_PLAYER, isHexInGrid, GameTheme, DEFAULT_THEME } from './types';
import { Move, Target, Check, X, Trophy, Timer, MousePointer2, Volume2, VolumeX, Swords, Shield, Settings, Info, Palette, ShoppingCart } from 'lucide-react';

// Import Luckiest Guy font for Clash Royale style
const LuckiestGuyFont = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @import url('https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=swap');
    .font-clash { font-family: 'Luckiest Guy', cursive; }
    .text-stroke { -webkit-text-stroke: 2.5px #000; filter: drop-shadow(0 4px 0 rgba(0,0,0,0.8)); }
    .text-stroke-sm { -webkit-text-stroke: 1.5px #000; filter: drop-shadow(0 2px 0 rgba(0,0,0,0.8)); }
    .clash-shadow { 
      text-shadow: 0 4px 0 rgba(0,0,0,0.5), 0 0 10px rgba(0,0,0,0.3);
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8));
    }
    .clash-btn-yellow { 
      background: linear-gradient(to bottom, #ffdd44, #ff9900);
      border: 3px solid #ffdd44;
      border-bottom: 8px solid #dd6600;
      border-radius: 20px;
      box-shadow: 
        0 6px 0 rgba(0,0,0,0.4),
        0 0 20px rgba(255, 200, 0, 0.3),
        inset 0 1px 0 rgba(255,255,255,0.3);
      transform: translateY(0);
      transition: all 0.1s;
    }
    .clash-btn-yellow:active {
      transform: translateY(4px);
      box-shadow: 
        0 2px 0 rgba(0,0,0,0.4),
        0 0 15px rgba(255, 200, 0, 0.2),
        inset 0 1px 0 rgba(255,255,255,0.3);
    }
    .clash-btn-yellow:hover {
      box-shadow: 
        0 6px 0 rgba(0,0,0,0.4),
        0 0 30px rgba(255, 200, 0, 0.5),
        inset 0 1px 0 rgba(255,255,255,0.4);
    }
    .clash-btn-blue { 
      background: linear-gradient(to bottom, #66ccff, #0099ff);
      border: 3px solid #66ccff;
      border-bottom: 8px solid #ccbb00;
      border-radius: 20px;
      box-shadow: 
        0 6px 0 rgba(0,0,0,0.4),
        0 0 20px rgba(100, 200, 255, 0.3),
        inset 0 1px 0 rgba(255,255,255,0.3);
      transform: translateY(0);
      transition: all 0.1s;
    }
    .clash-btn-blue:active {
      transform: translateY(4px);
      box-shadow: 
        0 2px 0 rgba(0,0,0,0.4),
        0 0 15px rgba(100, 200, 255, 0.2),
        inset 0 1px 0 rgba(255,255,255,0.3);
    }
    .clash-btn-blue:hover {
      box-shadow: 
        0 6px 0 rgba(0,0,0,0.4),
        0 0 30px rgba(100, 200, 255, 0.5),
        inset 0 1px 0 rgba(255,255,255,0.4);
    }
    .clash-card {
      background: linear-gradient(to bottom, #5a6a7a, #2a3a4a);
      border: 3px solid #7a8aaa;
      border-bottom: 5px solid #1a2a3a;
      border-radius: 12px;
      box-shadow: 
        0 4px 8px rgba(0,0,0,0.5),
        inset 0 1px 0 rgba(255,255,255,0.1),
        0 0 15px rgba(59,130,246,0.1);
    }
    .clash-card:hover {
      box-shadow: 
        0 6px 12px rgba(0,0,0,0.6),
        inset 0 1px 0 rgba(255,255,255,0.15),
        0 0 25px rgba(59,130,246,0.2);
    }
    .clash-nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      color: #94a3b8;
      transition: all 0.2s;
    }
    .clash-nav-item.active {
      color: #fff;
      transform: scale(1.1);
      text-shadow: 0 0 10px rgba(59, 130, 246, 0.8);
    }
  `}} />
);

const HEX_SIZE = 45;

const Fireworks = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 1, x: Math.random() * 400 - 200, y: Math.random() * 300 - 150 }}
          animate={{ scale: [0, 1.5, 0], opacity: [1, 1, 0] }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            delay: Math.random() * 2,
            ease: "easeOut"
          }}
          className="absolute left-1/2 top-1/2"
        >
          {[...Array(8)].map((_, j) => {
            const angle = (j / 8) * Math.PI * 2;
            return (
              <motion.div
                key={j}
                animate={{ x: Math.cos(angle) * 40, y: Math.sin(angle) * 40 }}
                className="absolute w-1 h-1 rounded-full bg-yellow-400 shadow-[0_0_5px_#fbbf24]"
              />
            );
          })}
        </motion.div>
      ))}
    </div>
  );
};

export default function App() {
  const { state, moveShip, shoot, endTurn, startBattle, startSetup } = useGameLogic();
  const [selectedShipId, setSelectedShipId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'move' | 'shoot' | null>(null);
  const [shootTarget, setShootTarget] = useState<HexCoord | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isAiMode, setIsAiMode] = useState(false);
  const [draggedShipId, setDraggedShipId] = useState<string | null>(null);
  const [dragTarget, setDragTarget] = useState<HexCoord | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);
  const [isOnlineMode, setIsOnlineMode] = useState(false);
  const [onlineNickname, setOnlineNickname] = useState('Player');
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showVolumeControls, setShowVolumeControls] = useState(false);
  const [gameTheme, setGameTheme] = useState<GameTheme>(() => {
    const saved = localStorage.getItem('depth-clash-theme');
    return saved ? JSON.parse(saved) : DEFAULT_THEME;
  });
  const [volumes, setVolumes] = useState(() => {
    const saved = localStorage.getItem('depth-clash-volumes');
    return saved ? JSON.parse(saved) : {
      master: 0.5,
      ambient: 0.2,
      music: 0.15,
      effects: 0.5
    };
  });
  
  // Online game logic - only initialized if online mode is active
  const networkGame = useNetworkGameLogic({
    isOnline: isOnlineMode,
    nickname: onlineNickname
  });

  // Handle URL parameters for auto-joining rooms
  useEffect(() => {
    const hash = window.location.hash.substring(1); // Remove the '#'
    const joinRoomId = hash.startsWith('join=') ? hash.substring(5) : null;

    if (joinRoomId && !isOnlineMode) {
      console.log('[URL] Detected join request for room:', joinRoomId);
      setIsOnlineMode(true);
    }
  }, []); // Empty dependency - only run on mount

  // Try to join room when online mode is activated and connection is ready
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const joinRoomId = hash.startsWith('join=') ? hash.substring(5) : null;

    if (joinRoomId && isOnlineMode && networkGame.connectionState === 'connected') {
      console.log('[URL] Joining room:', joinRoomId);
      networkGame.joinRoom(joinRoomId.toUpperCase());
      // Clear the hash to avoid re-joining
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [isOnlineMode, networkGame.connectionState, networkGame]);

  // Use network state when online, local state otherwise
  const gameState = isOnlineMode && networkGame.roomInfo ? networkGame.state : state;
  const gameMoveShip = isOnlineMode && networkGame.roomInfo ? networkGame.moveShip : moveShip;
  const gameShoot = isOnlineMode && networkGame.roomInfo ? networkGame.shoot : shoot;
  const gameEndTurn = isOnlineMode && networkGame.roomInfo ? networkGame.endTurn : endTurn;
  const gameStartBattle = isOnlineMode && networkGame.roomInfo ? networkGame.startBattle : startBattle;
  const gameStartSetup = isOnlineMode && networkGame.roomInfo ? networkGame.startSetup : startSetup;
  const gamePlaceShip = isOnlineMode && networkGame.roomInfo ? networkGame.placeShip : () => {};

  // Audio URLs - спочатку локальні файли, потім internet fallback
  const AUDIO_URLS = {
    ambient: '/sounds/ocean.mp3',
    music: '/sounds/music.mp3',
    missile: '/sounds/missile.mp3',
    explosion: '/sounds/explosion.mp3',
    splash: '/sounds/splash.mp3',
    victory: '/sounds/victory.mp3',
    defeat: '/sounds/defeat.mp3',
    seagulls: '/sounds/seagulls.mp3',
    move: '/sounds/move.mp3',
    stone: '/sounds/splash.mp3'
  };

  const ambientAudio = useMemo(() => {
    const audio = new Audio(AUDIO_URLS.ambient);
    audio.loop = true;
    audio.volume = volumes.ambient * volumes.master;
    return audio;
  }, [volumes]);

  const musicAudio = useMemo(() => {
    const audio = new Audio(AUDIO_URLS.music);
    audio.loop = true;
    audio.volume = volumes.music * volumes.master;
    return audio;
  }, [volumes]);

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('depth-clash-theme', JSON.stringify(gameTheme));
  }, [gameTheme]);

  // Save volumes to localStorage when they change
  useEffect(() => {
    localStorage.setItem('depth-clash-volumes', JSON.stringify(volumes));
  }, [volumes]);

  const handleThemeChange = (newTheme: GameTheme) => {
    setGameTheme(newTheme);
  };

  const handleVolumeChange = (type: keyof typeof volumes, value: number) => {
    setVolumes(prev => ({ ...prev, [type]: value }));
  };

  // Global interaction listener to unlock audio
  useEffect(() => {
    const unlock = () => {
      if (!audioStarted) {
        setAudioStarted(true);
        // Play a tiny silent sound to "prime" the audio context
        const silent = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==');
        silent.play().catch(() => {});
      }
    };
    window.addEventListener('click', unlock);
    window.addEventListener('touchstart', unlock);
    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
    };
  }, [audioStarted]);

  // Handle background audio playback
  useEffect(() => {
    if (audioStarted && !isMuted) {
      // Music and Ambient only play during Lobby and Setup phases
      if (state.phase === GamePhase.Lobby || state.phase === GamePhase.Setup) {
        ambientAudio.volume = volumes.ambient * volumes.master;
        musicAudio.volume = volumes.music * volumes.master;
        ambientAudio.play().catch(e => console.error("Ambient play failed:", e));
        musicAudio.play().catch(e => console.error("Music play failed:", e));
      } else {
        // "Quiet" during Battle phase as requested
        ambientAudio.pause();
        musicAudio.pause();
      }
    } else {
      ambientAudio.pause();
      musicAudio.pause();
    }
  }, [audioStarted, isMuted, ambientAudio, musicAudio, state.phase, volumes]);

  const playSound = (url: string, volume = 1) => {
    if (isMuted || !audioStarted) return;
    const audio = new Audio(url);
    audio.volume = volume * volumes.effects * volumes.master;
    audio.play().catch(e => console.error("Sound play failed:", e));
  };

  const gridCoords = useMemo(() => getGridCoords(GRID_WIDTH, GRID_HEIGHT), []);

  // Clear selection when turn ends or phase changes
  React.useEffect(() => {
    setSelectedShipId(null);
    setActionType(null);
    setShootTarget(null);
    setDraggedShipId(null);
    setDragTarget(null);
    setIsLaunching(false);
  }, [state.currentPlayer, state.phase]);

  const { viewBox, svgWidth, svgHeight } = useMemo(() => {
    const pixels = gridCoords.map(c => hexToPixel(c, HEX_SIZE));
    const minX = Math.min(...pixels.map(p => p.x)) - HEX_SIZE;
    const maxX = Math.max(...pixels.map(p => p.x)) + HEX_SIZE;
    const minY = Math.min(...pixels.map(p => p.y)) - HEX_SIZE;
    const maxY = Math.max(...pixels.map(p => p.y)) + HEX_SIZE;
    
    const w = maxX - minX;
    const h = maxY - minY;
    
    return {
      viewBox: `${minX} ${minY} ${w} ${h}`,
      svgWidth: w,
      svgHeight: h
    };
  }, [gridCoords]);

  const selectedShip = state.ships.find(s => s.id === selectedShipId);

  // Debug logging for selectedShip
  useEffect(() => {
    if (selectedShipId) {
      console.log('📍 selectedShip calculated:', { 
        selectedShipId, 
        foundShip: selectedShip ? { id: selectedShip.id, owner: selectedShip.owner, coord: selectedShip.coord } : 'NOT FOUND',
        phase: state.phase,
        isLaunching,
        actionPanelCondition: selectedShip && state.phase === GamePhase.Battle && !isLaunching
      });
    }
  }, [selectedShipId, selectedShip, state.phase, isLaunching, state.ships]);

  // AI Logic for Player 2 - Setup Phase
  useEffect(() => {
    if (isAiMode && state.phase === GamePhase.Setup) {
      const aiSetupInterval = setInterval(() => {
        const p2Ships = state.ships.filter(s => s.owner === 'Player2');
        if (p2Ships.length === 0) return;

        // Pick a random ship to move
        const ship = p2Ships[Math.floor(Math.random() * p2Ships.length)];
        
        // AI Starting Zone: Top 3 rows (r <= 2)
        const allCoords = getGridCoords(GRID_WIDTH, GRID_HEIGHT);
        const aiZoneCoords = allCoords.filter(c => c.r <= 2);
        
        const target = aiZoneCoords[Math.floor(Math.random() * aiZoneCoords.length)];
        moveShip(ship.id, target);
      }, 2000); // Move a ship every 2 seconds during setup

      return () => clearInterval(aiSetupInterval);
    }
  }, [isAiMode, state.phase, state.ships, moveShip]);

  // AI Logic for Player 2 - Battle Phase
  useEffect(() => {
    if (isAiMode && state.phase === GamePhase.Battle && state.currentPlayer === 'Player2' && !isLaunching && !state.winner) {
      const aiTurn = async () => {
        // Wait a bit for "thinking"
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 1. Select a random alive ship
        const p2Ships = state.ships.filter(s => s.owner === 'Player2' && s.isAlive);
        if (p2Ships.length === 0) return;
        
        // Find a ship that hasn't acted yet or just pick one
        const ship = p2Ships[Math.floor(Math.random() * p2Ships.length)];
        setSelectedShipId(ship.id);

        // 2. Shoot first
        if (!state.turnActions.hasShot) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // AI Strategy: Target the bottom half of the grid (where Player 1 is)
          const allCoords = getGridCoords(GRID_WIDTH, GRID_HEIGHT);
          const playerSideCoords = allCoords.filter(c => c.r >= 7); // Target bottom 4 rows
          
          // Also avoid shooting at own ships (AI knows its own positions)
          const p2ShipCoords = p2Ships.map(s => s.coord);
          const validTargets = playerSideCoords.filter(c => !p2ShipCoords.some(pc => hexEqual(pc, c)));
          
          const target = validTargets.length > 0 
            ? validTargets[Math.floor(Math.random() * validTargets.length)]
            : playerSideCoords[Math.floor(Math.random() * playerSideCoords.length)];

          setShootTarget(target);
          await new Promise(resolve => setTimeout(resolve, 800));
          setIsLaunching(true);
        } 
        // 3. Move after shooting (Shoot and Scoot) - always move after shooting if possible
        else if (!state.turnActions.hasMoved) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const neighbors = getNeighbors(ship.coord).filter(n => isHexInGrid(n));
          
          if (neighbors.length > 0) {
            // Strategic Move: AI prefers to "retreat" (move to a smaller row index 'r')
            // This keeps them further from the player's side (r >= 7)
            const sortedNeighbors = [...neighbors].sort((a, b) => a.r - b.r);
            
            // 80% chance to pick the "safest" (top-most) neighbor, 20% random for unpredictability
            const target = Math.random() > 0.2 
              ? sortedNeighbors[0] 
              : neighbors[Math.floor(Math.random() * neighbors.length)];
            
            moveShip(ship.id, target);
            // End turn immediately after moving to make it mandatory after shooting
            endTurn();
          } else {
            // If no neighbors, just end turn
            endTurn();
          }
        }
        // 4. End turn
        else {
          await new Promise(resolve => setTimeout(resolve, 1000));
          endTurn();
        }
      };

      aiTurn();
    }
  }, [isAiMode, state.phase, state.currentPlayer, state.turnActions, isLaunching, state.winner, state.ships, moveShip, endTurn]);

  // Play game over sounds
  useEffect(() => {
    if (state.phase === GamePhase.GameOver && state.winner) {
      if (state.winner === 'Player1') {
        playSound(AUDIO_URLS.victory);
      } else {
        playSound(AUDIO_URLS.defeat);
      }
    }
  }, [state.phase, state.winner]);

  // Play battle start sounds
  useEffect(() => {
    if (state.phase === GamePhase.Battle) {
      playSound(AUDIO_URLS.seagulls, 0.4);
    }
  }, [state.phase]);

  const handleTileClick = (coord: HexCoord) => {
    console.log('🔍 handleTileClick called:', { coord, phase: state.phase, currentPlayer: state.currentPlayer, isAiMode, selectedShipId });
    
    if (state.phase === GamePhase.GameOver) return;

    // Handle Setup Phase movement
    if (state.phase === GamePhase.Setup) {
      if (selectedShipId) {
        // If a ship is selected, move it to the clicked tile (allows stacking)
        moveShip(selectedShipId, coord);
        playSound(AUDIO_URLS.move, 0.3);
        setSelectedShipId(null);
      } else {
        // Otherwise, try to select a ship at the clicked tile (any owner during setup)
        const shipAtTile = state.ships.find(s => hexEqual(s.coord, coord) && s.isAlive);
        if (shipAtTile) {
          setSelectedShipId(shipAtTile.id);
        }
      }
      return;
    }

    // Handle Battle Phase
    const playerToControl = isAiMode ? 'Player1' : state.currentPlayer;
    const shipsAtTile = state.ships.filter(s => hexEqual(s.coord, coord) && s.owner === playerToControl && s.isAlive);
    console.log('⚔️ Battle Phase - Looking for ships:', { playerToControl, shipsAtTile: shipsAtTile.map(s => ({ id: s.id, owner: s.owner })), totalShips: state.ships.length });
    const firstShipAtTile = shipsAtTile[0];
    
    if (actionType === 'move' && selectedShipId) {
      // Movement is now drag-only in battle phase as per user request
      if (shipsAtTile.length > 0) {
        // Cycle selection if clicking own stack
        const currentIndex = shipsAtTile.findIndex(s => s.id === selectedShipId);
        const nextIndex = (currentIndex + 1) % shipsAtTile.length;
        setSelectedShipId(shipsAtTile[nextIndex].id);
      } else {
        // Deselect if clicked empty tile
        setSelectedShipId(null);
        setActionType(null);
      }
    } else if (actionType === 'shoot' && selectedShipId) {
      // Allow shooting at ANY tile, even if it contains own ships
      setShootTarget(coord);
    } else {
      // Select ship
      if (shipsAtTile.length > 0) {
        const currentIndex = shipsAtTile.findIndex(s => s.id === selectedShipId);
        const nextIndex = (currentIndex + 1) % shipsAtTile.length;
        console.log('✅ Ships found! Setting selectedShipId:', { newId: shipsAtTile[nextIndex].id, currentIndex, nextIndex });
        setSelectedShipId(shipsAtTile[nextIndex].id);
        setActionType(null);
      } else {
        console.log('❌ No ships found from filter, clearing selection');
        setSelectedShipId(null);
        setActionType(null);
      }
    }
  };

  const handleShootConfirm = () => {
    if (selectedShip && shootTarget) {
      setIsLaunching(true);
      // Play missile flight sound
      playSound(AUDIO_URLS.missile);
    }
  };

  const onProjectileComplete = () => {
    if (selectedShip && shootTarget) {
      // Check if it's a hit or miss
      const targetShip = state.ships.find(s => hexEqual(s.coord, shootTarget) && s.isAlive);
      
      if (targetShip) {
        // Play explosion sound
        playSound(AUDIO_URLS.explosion);
      } else {
        // Play stone splash sound for miss
        playSound(AUDIO_URLS.stone);
      }

      gameShoot(selectedShip.coord, shootTarget);
      setIsLaunching(false);
      setShootTarget(null);
      setActionType(null);
      setSelectedShipId(null);
    }
  };

  const handleDragStart = (shipId: string) => {
    if (state.phase === GamePhase.Setup) {
      setDraggedShipId(shipId);
    } else if (state.phase === GamePhase.Battle && !state.turnActions.hasMoved) {
      const ship = state.ships.find(s => s.id === shipId);
      const playerToControl = isAiMode ? 'Player1' : state.currentPlayer;
      if (ship && ship.owner === playerToControl) {
        setDraggedShipId(shipId);
        setSelectedShipId(shipId);
        // Only set actionType to 'move' if not already in 'shoot' mode
        if (actionType !== 'shoot') {
          setActionType('move');
        }
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!draggedShipId) return;
    if (state.phase !== GamePhase.Setup && state.phase !== GamePhase.Battle) return;

    const svg = e.currentTarget as SVGSVGElement;
    const pt = svg.createSVGPoint();
    
    if ('touches' in e) {
      pt.x = e.touches[0].clientX;
      pt.y = e.touches[0].clientY;
    } else {
      pt.x = (e as React.MouseEvent).clientX;
      pt.y = (e as React.MouseEvent).clientY;
    }

    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    const hex = pixelToHex(svgP.x, svgP.y, HEX_SIZE);
    
    // Constrain to grid
    if (!isHexInGrid(hex)) {
      setDragTarget(null);
      return;
    }

    // During battle, only show highlight if it's a valid move (neighbor)
    if (state.phase === GamePhase.Battle && selectedShip) {
      const neighbors = getNeighbors(selectedShip.coord);
      if (neighbors.some(n => hexEqual(n, hex))) {
        setDragTarget(hex);
      } else {
        setDragTarget(null);
      }
    } else {
      setDragTarget(hex);
    }
  };

  const handleDragEnd = () => {
    if (draggedShipId && dragTarget) {
      if (state.phase === GamePhase.Setup) {
        if (isOnlineMode && networkGame.roomInfo) {
          // Online setup: place ship on server
          gamePlaceShip(draggedShipId, dragTarget);
        } else {
          // Local setup: move ship locally
          moveShip(draggedShipId, dragTarget);
        }
        playSound(AUDIO_URLS.move, 0.3);
      } else if (state.phase === GamePhase.Battle && selectedShip) {
        const neighbors = getNeighbors(selectedShip.coord);
        if (neighbors.some(n => hexEqual(n, dragTarget))) {
          gameMoveShip(draggedShipId, dragTarget);
          playSound(AUDIO_URLS.move, 0.3);
          setActionType(null);
          setSelectedShipId(null);
        }
      }
    }
    setDraggedShipId(null);
    setDragTarget(null);
  };

  // Group ships by coordinate for stacking display
  const shipStacks = useMemo(() => {
    const stacks: Record<string, { ships: ShipType[]; owner: string }> = {};
    state.ships.filter(s => s.isAlive).forEach(ship => {
      // Visibility rule: 
      // 1. Battle Phase: Show only current player's ships (Fog of War).
      //    EXCEPTION: In AI Mode, always show Player 1's ships.
      // 2. Game Over: Show all ships.
      const isGameOver = state.phase === GamePhase.GameOver;
      
      let isVisible = false;
      if (isGameOver) {
        isVisible = true;
      } else if (isAiMode) {
        // In AI mode, user (P1) always sees their own ships
        isVisible = ship.owner === 'Player1';
      } else if (isOnlineMode && networkGame.selfPlayerKey) {
        // In online mode, each player sees their own fleet and not opponent during setup/battle
        isVisible = ship.owner === networkGame.selfPlayerKey;
      } else {
        // In Local 1:1 local mode, only current player sees their ships
        isVisible = ship.owner === state.currentPlayer;
      }

      if (!isVisible) return;

      const key = `${ship.coord.q},${ship.coord.r}`;
      if (!stacks[key]) {
        stacks[key] = { ships: [], owner: ship.owner };
      }
      stacks[key].ships.push(ship);
      
      // If current player has a ship in this stack, prioritize their color/icon
      if (ship.owner === state.currentPlayer) {
        stacks[key].owner = ship.owner;
      }
    });
    return stacks;
  }, [state.ships, state.currentPlayer, state.phase]);

  const p1Alive = state.ships.filter(s => s.owner === 'Player1' && s.isAlive).length;
  const p2Alive = state.ships.filter(s => s.owner === 'Player2' && s.isAlive).length;

  const renderShipIcons = (player: 'Player1' | 'Player2', aliveCount: number) => {
    const icons = [];
    const color = player === 'Player1' ? 'blue' : 'red';
    const shipImage = SHIP_IMAGE_MAP[gameTheme.ships][color];
    
    for (let i = 0; i < INITIAL_SHIPS_PER_PLAYER; i++) {
      const isAlive = i < aliveCount;
      icons.push(
        <div key={i} className="relative flex-1 h-6 min-w-0">
          <img 
            src={shipImage}
            alt="ship"
            className={`w-full h-full object-contain rotate-90 ${isAlive ? '' : 'grayscale opacity-50'}`}
          />
          {!isAlive && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1/2 h-[3px] bg-red-500 rotate-45 shadow-lg rounded-full" />
              <div className="absolute w-1/2 h-[3px] bg-red-500 -rotate-45 shadow-lg rounded-full" />
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="flex flex-row gap-0 flex-1">
        {icons}
      </div>
    );
  };

  return (
    <div className="h-screen bg-slate-950 text-slate-100 font-sans flex flex-col overflow-hidden">
      <LuckiestGuyFont />
      {/* Header / Scoreboard */}
      <div className="w-full flex justify-between items-center bg-slate-900/80 p-0.5 sm:p-1 border-b border-white/10 backdrop-blur-md z-10">
        <div className={`flex items-center gap-1 sm:gap-1.5 p-0.5 rounded-lg transition-all flex-1 ${state.currentPlayer === 'Player1' ? 'bg-blue-500/10 ring-1 ring-blue-500/30' : ''}`}>
          <div className="flex flex-col items-center">
            <span className="text-[6px] sm:text-[7px] uppercase tracking-widest text-blue-400 font-bold">P1</span>
            <span className="text-[8px] sm:text-[10px] font-mono font-bold text-blue-400 leading-none">{p1Alive}</span>
          </div>
          {renderShipIcons('Player1', p1Alive)}
        </div>

        <div className="flex flex-col items-center px-1 relative">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowVolumeControls(!showVolumeControls);
            }}
            className="absolute -top-1 -right-6 sm:-right-8 p-1 text-slate-500 hover:text-white transition-colors"
            title="Volume Controls"
          >
            {isMuted ? <VolumeX size={10} className="sm:w-[12px] sm:h-[12px]" /> : <Volume2 size={10} className="sm:w-[12px] sm:h-[12px]" />}
          </button>
          {state.phase === GamePhase.Lobby ? (
            <div className="text-amber-400 font-bold uppercase tracking-widest text-[6px] sm:text-[8px] animate-pulse">Waiting...</div>
          ) : state.phase === GamePhase.Setup ? (
            <div className="flex flex-col items-center gap-0 text-amber-400">
              <div className="flex items-center gap-0.5">
                <Timer size={6} className="sm:w-[8px] sm:h-[8px]" />
                <span className="text-[5px] sm:text-[7px] font-bold uppercase tracking-tighter">Setup</span>
              </div>
              <span className="text-[8px] sm:text-xs font-mono font-bold leading-none">{state.setupTimer}s</span>
            </div>
          ) : state.phase === GamePhase.GameOver ? (
            <div className="flex flex-col items-center gap-0 text-emerald-400">
              <Trophy size={10} className="sm:w-[12px] sm:h-[12px]" />
              <span className="text-[5px] sm:text-[7px] font-bold uppercase tracking-widest">{state.winner} WINS!</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className={`text-[5px] sm:text-[7px] font-bold uppercase tracking-widest ${state.currentPlayer === 'Player1' ? 'text-blue-400' : 'text-red-400'}`}>
                {state.currentPlayer === 'Player1' ? 'Blue' : 'Red'}
              </span>
              <div className={`w-3 h-0.5 sm:w-4 sm:h-0.5 mt-0.5 rounded-full ${state.currentPlayer === 'Player1' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
            </div>
          )}
        </div>

        <div className={`flex items-center gap-1 sm:gap-1.5 p-0.5 rounded-lg transition-all flex-1 ${state.currentPlayer === 'Player2' ? 'bg-red-500/10 ring-1 ring-red-500/30' : ''}`}>
          {renderShipIcons('Player2', p2Alive)}
          <div className="flex flex-col items-center">
            <span className="text-[6px] sm:text-[7px] uppercase tracking-widest text-red-400 font-bold">P2</span>
            <span className="text-[8px] sm:text-[10px] font-mono font-bold text-red-400 leading-none">{p2Alive}</span>
          </div>
        </div>
      </div>

      {/* Game Board */}
      <div className={`relative flex-1 bg-slate-900 w-full overflow-hidden ${isOnlineMode && networkGame.state.phase !== 'Battle' && networkGame.state.phase !== 'GameOver' ? 'pr-64 sm:pr-80' : ''}`}>
        {/* Online Game Lobby */}
        {isOnlineMode && networkGame.state.phase !== GamePhase.Battle && networkGame.state.phase !== GamePhase.GameOver && (
          <OnlineGameLobby
            connectionState={networkGame.connectionState}
            roomId={networkGame.roomInfo?.roomId}
            isHost={networkGame.selfPlayerKey === 'Player1'}
            onCreateRoom={networkGame.createRoom}
            onJoinRoom={networkGame.joinRoom}
            onSetNickname={setOnlineNickname}
            onBack={() => setIsOnlineMode(false)}
          />
        )}

        {/* Main Menu / Lobby Overlay */}
      {state.phase === GamePhase.Lobby && !isOnlineMode && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-[100] flex items-center justify-center overflow-hidden"
        >
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://picsum.photos/seed/submarine-clash-cartoon/1920/1080" 
              alt="Background" 
              className="w-full h-full object-cover scale-105 opacity-70"
              referrerPolicy="no-referrer"
            />
            {/* Hexagonal Pattern Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{ 
                   backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='104' viewBox='0 0 60 104' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 17.32v34.64L30 69.28 0 51.96V17.32L30 0z' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3C/svg%3E")`,
                   backgroundSize: '60px 104px'
                 }} 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-slate-950/60 to-slate-950/90" />
            
            {/* Floating bubbles for atmosphere */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: '110%', x: Math.random() * 100 + '%' }}
                  animate={{ y: '-10%', x: (Math.random() * 100 + (Math.random() * 20 - 10)) + '%' }}
                  transition={{ 
                    duration: 5 + Math.random() * 10, 
                    repeat: Infinity, 
                    delay: Math.random() * 5,
                    ease: "linear"
                  }}
                  className="absolute w-2 h-2 bg-white/20 rounded-full"
                />
              ))}
            </div>
          </div>

          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative z-10 flex flex-col items-center w-full max-w-sm px-3 sm:px-6 max-h-[calc(100vh-120px)] overflow-y-auto"
          >
            {/* Top Bar Icons - Hidden on mobile, visible on sm+ */}
            <div className="hidden sm:flex absolute -top-12 sm:-top-16 left-0 right-0 justify-between px-4">
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                <Trophy size={16} className="text-yellow-400" />
                <span className="font-clash text-xs text-white">4200</span>
              </div>
              <div className="flex gap-2">
                <button className="p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-white/10 transition-colors">
                  <Settings size={18} />
                </button>
                <button className="p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-white/10 transition-colors">
                  <Info size={18} />
                </button>
              </div>
            </div>

            <div className="mb-3 sm:mb-6 text-center">
              <motion.div
                animate={{ y: [0, -5, 0], rotate: [0, 1, -1, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="inline-block mb-1 sm:mb-3"
              >
                <div className="relative">
                  <SubmarineIcon size={60} color="#60a5fa" />
                  <motion.div 
                    animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-3 -right-3 w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/40 rounded-full blur-lg"
                  />
                </div>
              </motion.div>
              <h1 className="text-3xl sm:text-6xl md:text-7xl font-clash text-white tracking-normal clash-shadow text-stroke mb-0.5 sm:mb-1 leading-tight">
                DEPTH <span className="text-yellow-400">CLASH</span>
              </h1>
              <div className="bg-blue-600/80 backdrop-blur-sm px-2 py-0.5 sm:px-4 sm:py-1 rounded-full border-2 border-white/20 inline-block">
                <p className="text-white font-clash text-[8px] sm:text-sm tracking-widest uppercase leading-tight">Arena 1: Deep Ocean</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:gap-4 w-full">
              {!audioStarted && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setAudioStarted(true);
                    ambientAudio.play().catch(() => {});
                    musicAudio.play().catch(() => {});
                  }}
                  className="w-full py-2.5 sm:py-4 clash-btn-yellow text-white font-clash text-base sm:text-xl clash-shadow text-stroke-sm rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 sm:gap-3 animate-pulse"
                >
                  <Volume2 size={18} className="sm:w-6 sm:h-6" />
                  <span className="hidden xs:inline">ENABLE SOUND</span>
                  <span className="inline xs:hidden text-sm">SOUND</span>
                </motion.button>
              )}

              <div className={`flex flex-col gap-2 sm:gap-3 w-full transition-all duration-500 ${!audioStarted ? 'opacity-40 pointer-events-none grayscale' : 'opacity-100'}`}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setIsOnlineMode(false);
                    setIsAiMode(true);
                    startSetup();
                  }}
                  className="group relative w-full py-2 sm:py-3 clash-btn-blue text-white rounded-xl sm:rounded-2xl font-clash flex flex-col items-center justify-center overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                  <div className="flex items-center gap-2">
                    <Shield size={16} className="sm:w-[20px] sm:h-[20px]" />
                    <span className="text-base sm:text-2xl clash-shadow text-stroke-sm">GAME</span>
                  </div>
                  <span className="text-[7px] sm:text-[9px] opacity-80 tracking-widest uppercase">Play vs AI</span>
                </motion.button>

                {/* Chest Slots */}
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-1 sm:mt-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-square clash-card rounded-lg sm:rounded-xl flex flex-col items-center justify-center p-0.5 sm:p-1 opacity-60">
                      <div className="w-4 h-4 sm:w-6 sm:h-6 bg-slate-700/50 rounded mb-0.5" />
                      <span className="text-[4px] sm:text-[5px] font-clash text-slate-400 uppercase text-center">Empty</span>
                    </div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowThemeSelector(true)}
                  className="w-full py-2 sm:py-2.5 bg-gradient-to-r from-yellow-600 to-amber-600 text-white rounded-lg sm:rounded-xl font-clash text-xs sm:text-sm transition-all flex items-center justify-center gap-2 mb-1 shadow-lg hover:shadow-yellow-500/50"
                >
                  <ShoppingCart size={14} className="sm:w-4 sm:h-4" />
                  SHOP
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.reload()}
                  className="w-full py-1.5 sm:py-2 bg-transparent border border-white/5 text-slate-500 hover:text-slate-300 rounded-lg sm:rounded-xl font-clash text-[8px] sm:text-[10px] transition-all flex items-center justify-center gap-1.5"
                >
                  <X size={10} className="sm:w-3 sm:h-3" />
                  EXIT GAME
                </motion.button>
              </div>
            </div>
          </motion.div>

        </motion.div>
      )}

      {/* Tutorial */}
      <Tutorial phase={state.phase} isAiMode={isAiMode} />

      {/* Game Over Overlay */}
        {state.phase === GamePhase.GameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-slate-900 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center max-h-[90vh] overflow-y-auto"
            >
              {state.winner === 'Player1' ? (
                <>
                  <div className="relative mb-6 w-full">
                    <img 
                      src="https://picsum.photos/seed/victory-ships/800/600" 
                      alt="Victory" 
                      className="w-full h-48 object-cover rounded-xl border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                      referrerPolicy="no-referrer"
                    />
                    {/* Balloons/Fireworks simulation */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <Fireworks />
                      {[...Array(12)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ y: 200, x: Math.random() * 300 - 150, opacity: 1 }}
                          animate={{ y: -300, opacity: 0 }}
                          transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
                          className="absolute bottom-0 left-1/2 w-3 h-4 rounded-full"
                          style={{ backgroundColor: ['#ef4444', '#3b82f6', '#f59e0b', '#10b981'][i % 4] }}
                        />
                      ))}
                    </div>
                  </div>
                  <Trophy className="text-yellow-400 w-20 h-20 mb-4 clash-shadow" />
                  <h2 className="text-5xl font-clash text-white mb-2 tracking-normal text-stroke-sm clash-shadow">VICTORY!</h2>
                  <p className="text-emerald-400 font-clash text-lg mb-6 clash-shadow">THE ENEMY FLEET HAS BEEN NEUTRALIZED!</p>
                </>
              ) : (
                <>
                  <div className="mb-6 w-full">
                    <img 
                      src="https://picsum.photos/seed/submarine-wreck/800/600" 
                      alt="Defeat" 
                      className="w-full h-48 object-cover rounded-xl border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="w-20 h-20 mb-4 flex items-center justify-center bg-red-500/30 rounded-full border-4 border-red-500/50 clash-shadow">
                    <X className="text-white w-12 h-12 text-stroke-sm" />
                  </div>
                  <h2 className="text-5xl font-clash text-white mb-2 tracking-normal text-stroke-sm clash-shadow">DEFEAT</h2>
                  <p className="text-red-400 font-clash text-lg mb-6 clash-shadow">YOUR SUBMARINE LIES ON THE OCEAN FLOOR.</p>
                </>
              )}
              
              <button
                onClick={() => window.location.reload()}
                className="w-full py-4 clash-btn-blue text-white rounded-2xl font-clash text-2xl clash-shadow text-stroke-sm"
              >
                RETURN TO BASE
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Grid Background/Water Effect - Enhanced */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Primary gradient background - Deep Ocean */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/60 via-blue-950/70 to-slate-950/90" />
          
          {/* Water animation effect */}
          <div className="absolute inset-0 water-animated opacity-40" style={{
            background: 'linear-gradient(90deg, rgba(30,144,255,0) 0%, rgba(30,144,255,0.3) 25%, rgba(30,144,255,0) 50%, rgba(59,130,246,0.2) 75%, rgba(30,144,255,0) 100%)',
            backgroundSize: '200% 100%',
            animation: 'water-wave 8s linear infinite'
          }} />
          
          {/* Deep Ocean glow */}
          <div className="absolute inset-0 deep-ocean" style={{
            background: 'radial-gradient(circle at center, rgba(59,130,246,0.15) 0%, rgba(30,144,255,0.1) 40%, transparent 70%)'
          }} />
          
          {/* Floating particles for depth */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                initial={{ y: '100%', x: Math.random() * 100 + '%', opacity: 0 }}
                animate={{ y: '-100%', opacity: [0, 0.4, 0] }}
                transition={{ 
                  duration: 8 + Math.random() * 6, 
                  repeat: Infinity, 
                  delay: Math.random() * 4,
                  ease: "linear"
                }}
                className="absolute w-1 h-1 bg-cyan-400/50 rounded-full"
              />
            ))}
          </div>

          {/* Subtle grid pattern overlay */}
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(59, 130, 246, .05) 25%, rgba(59, 130, 246, .05) 26%, transparent 27%, transparent 74%, rgba(59, 130, 246, .05) 75%, rgba(59, 130, 246, .05) 76%, transparent 77%, transparent),
                              linear-gradient(90deg, transparent 24%, rgba(59, 130, 246, .05) 25%, rgba(59, 130, 246, .05) 26%, transparent 27%, transparent 74%, rgba(59, 130, 246, .05) 75%, rgba(59, 130, 246, .05) 76%, transparent 77%, transparent)`,
              backgroundSize: '50px 50px'
            }}
          />
        </div>
        
        <svg
          viewBox={viewBox}
          className="w-full h-full touch-none drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]"
          preserveAspectRatio="xMidYMid meet"
          onMouseMove={handleMouseMove}
          onTouchMove={handleMouseMove}
          onMouseUp={handleDragEnd}
          onTouchEnd={handleDragEnd}
          onMouseLeave={handleDragEnd}
        >
          {/* Animated water background */}
          <defs>
            <linearGradient id="waterBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.1" />
              <stop offset="25%" stopColor="#0284c7" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#0369a1" stopOpacity="0.1" />
              <stop offset="75%" stopColor="#075985" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0c4a6e" stopOpacity="0.1" />
            </linearGradient>
            
            <pattern id="waterWaves" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M0,50 Q25,30 50,50 T100,50 V100 H0 Z" fill="rgba(14, 165, 233, 0.05)">
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; 10,5; 0,0"
                  dur="8s"
                  repeatCount="indefinite"
                />
              </path>
              <path d="M0,60 Q25,40 50,60 T100,60 V100 H0 Z" fill="rgba(2, 132, 199, 0.03)">
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; -15,3; 0,0"
                  dur="12s"
                  repeatCount="indefinite"
                />
              </path>
            </pattern>
            
            <pattern id="waterShimmer" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
              <circle cx="25" cy="25" r="2" fill="rgba(255, 255, 255, 0.1)">
                <animate attributeName="r" values="2;4;2" dur="4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.1;0.3;0.1" dur="4s" repeatCount="indefinite" />
              </circle>
              <circle cx="10" cy="40" r="1.5" fill="rgba(255, 255, 255, 0.08)">
                <animate attributeName="r" values="1.5;3;1.5" dur="6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.08;0.2;0.08" dur="6s" repeatCount="indefinite" />
              </circle>
            </pattern>
          </defs>
          
          {/* Water background */}
          <rect
            x={viewBox.split(' ')[0]}
            y={viewBox.split(' ')[1]}
            width={viewBox.split(' ')[2]}
            height={viewBox.split(' ')[3]}
            fill="url(#waterBg)"
            className="pointer-events-none"
          />
          
          {/* Animated water waves */}
          <rect
            x={viewBox.split(' ')[0]}
            y={viewBox.split(' ')[1]}
            width={viewBox.split(' ')[2]}
            height={viewBox.split(' ')[3]}
            fill="url(#waterWaves)"
            className="pointer-events-none"
          />
          
          {/* Water shimmer effect */}
          <rect
            x={viewBox.split(' ')[0]}
            y={viewBox.split(' ')[1]}
            width={viewBox.split(' ')[2]}
            height={viewBox.split(' ')[3]}
            fill="url(#waterShimmer)"
            className="pointer-events-none water-shimmer"
          />
          
          {/* Floating bubbles across the battlefield */}
          {[...Array(20)].map((_, i) => {
            const x = parseFloat(viewBox.split(' ')[0]) + Math.random() * parseFloat(viewBox.split(' ')[2]);
            const y = parseFloat(viewBox.split(' ')[1]) + Math.random() * parseFloat(viewBox.split(' ')[3]);
            const size = Math.random() * 3 + 1;
            return (
              <circle
                key={`bubble-${i}`}
                cx={x}
                cy={y}
                r={size}
                fill="rgba(255, 255, 255, 0.2)"
                className="pointer-events-none"
              >
                <animateMotion
                  dur={`${8 + Math.random() * 4}s`}
                  repeatCount="indefinite"
                  path={`M 0 0 L ${Math.random() * 50 - 25} ${-50 - Math.random() * 50}`}
                />
                <animate
                  attributeName="opacity"
                  values="0;0.3;0"
                  dur={`${8 + Math.random() * 4}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="r"
                  values={`${size};${size * 1.5};${size}`}
                  dur={`${8 + Math.random() * 4}s`}
                  repeatCount="indefinite"
                />
              </circle>
            );
          })}
          
          {/* Grid Tiles */}
          {gridCoords.map(coord => {
            const pixel = hexToPixel(coord, HEX_SIZE);
            let highlight = false;
            let color = undefined;

            if (dragTarget && hexEqual(dragTarget, coord)) {
              highlight = true;
              color = 'rgba(59, 130, 246, 0.5)';
            } else if (actionType === 'move' && selectedShip) {
              const neighbors = getNeighbors(selectedShip.coord);
              highlight = neighbors.some(n => hexEqual(n, coord));
            } else if (actionType === 'shoot') {
              highlight = true;
              if (shootTarget && hexEqual(shootTarget, coord)) {
                color = 'rgba(239, 68, 68, 0.5)'; // Red for selected target
              } else {
                color = 'rgba(249, 115, 22, 0.5)'; // Orange for available targets
              }
            }

            return (
              <HexTile
                key={`${coord.q},${coord.r}`}
                coord={coord}
                size={HEX_SIZE}
                pixelPos={pixel}
                isHighlighted={highlight}
                highlightColor={color}
                onClick={() => handleTileClick(coord)}
              />
            );
          })}

          {/* Ships */}
          {Object.entries(shipStacks).map(([key, stack]: [string, any]) => {
            const pixel = hexToPixel(stack.ships[0].coord, HEX_SIZE);
            const isSelected = stack.ships.some(s => s.id === selectedShipId);
            const isBeingDragged = stack.ships.some(s => s.id === draggedShipId);
            
            return (
              <Ship
                key={key}
                ship={{ ...stack.ships[0], owner: stack.owner }}
                pixelPos={isBeingDragged && dragTarget ? hexToPixel(dragTarget, HEX_SIZE) : pixel}
                isSelected={isSelected || isBeingDragged}
                count={stack.ships.length}
                shipTheme={gameTheme.ships}
                onDragStart={() => handleDragStart(stack.ships[0].id)}
                onClick={() => handleTileClick(stack.ships[0].coord)}
              />
            );
          })}

          {/* Combat Effects */}
          {state.lastShot && (
            <line
              x1={hexToPixel(state.lastShot.start, HEX_SIZE).x}
              y1={hexToPixel(state.lastShot.start, HEX_SIZE).y}
              x2={hexToPixel(state.lastShot.end, HEX_SIZE).x}
              y2={hexToPixel(state.lastShot.end, HEX_SIZE).y}
              stroke="white"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.2"
              className="pointer-events-none"
            />
          )}

          {(isLaunching && selectedShip && shootTarget) ? (
            <Projectile
              start={hexToPixel(selectedShip.coord, HEX_SIZE)}
              end={hexToPixel(shootTarget, HEX_SIZE)}
              onComplete={onProjectileComplete}
            />
          ) : state.lastShot && (
            <Projectile
              start={hexToPixel(state.lastShot.start, HEX_SIZE)}
              end={hexToPixel(state.lastShot.end, HEX_SIZE)}
              onComplete={() => {}}
            />
          )}

          {state.lastExplosion && (
            <Explosion 
              x={hexToPixel(state.lastExplosion, HEX_SIZE).x} 
              y={hexToPixel(state.lastExplosion, HEX_SIZE).y} 
            />
          )}

          {/* Enemy Launch Origin Indicator */}
          {state.lastLaunch && (
            <g className="pointer-events-none">
              <circle 
                cx={hexToPixel(state.lastLaunch, HEX_SIZE).x} 
                cy={hexToPixel(state.lastLaunch, HEX_SIZE).y} 
                r="12" 
                fill="none" 
                stroke="white" 
                strokeWidth="2"
                strokeDasharray="4 2"
                className="animate-spin-slow"
              />
              <circle 
                cx={hexToPixel(state.lastLaunch, HEX_SIZE).x} 
                cy={hexToPixel(state.lastLaunch, HEX_SIZE).y} 
                r="10" 
                fill="white" 
                fillOpacity="0.2" 
                className="animate-ping"
              />
              <text
                x={hexToPixel(state.lastLaunch, HEX_SIZE).x}
                y={hexToPixel(state.lastLaunch, HEX_SIZE).y + 25}
                fontSize="8"
                fill="white"
                textAnchor="middle"
                className="font-bold uppercase tracking-widest opacity-60"
              >
                Launch Detected
              </text>
            </g>
          )}
        </svg>

        {/* Action Panel */}
        {selectedShip && state.phase === GamePhase.Battle && !isLaunching && (
          <div 
            className="fixed flex gap-1 bg-slate-800/95 p-1 rounded-lg border border-white/20 shadow-2xl backdrop-blur-md z-50"
            style={{
              left: '50%',
              top: 'calc(50% + 150px)',
              transform: 'translateX(-50%)',
              pointerEvents: 'auto'
            }}
          >
            {!state.turnActions.hasMoved && (
              <button
                onClick={() => setActionType('move')}
                className={`p-1.5 sm:p-2 rounded-md transition-all ${actionType === 'move' ? 'bg-blue-500 text-white' : 'hover:bg-white/10 text-blue-400'}`}
                title="Move (1 hex)"
              >
                <Move size={14} className="sm:w-[16px] sm:h-[16px]" />
              </button>
            )}
            {!state.turnActions.hasShot && (
              <button
                onClick={() => setActionType('shoot')}
                className={`p-1.5 sm:p-2 rounded-md transition-all ${actionType === 'shoot' ? 'bg-red-500 text-white' : 'hover:bg-white/10 text-red-400'}`}
                title="Shoot (any hex)"
              >
                <Target size={14} className="sm:w-[16px] sm:h-[16px]" />
              </button>
            )}
            {actionType === 'shoot' && shootTarget && (
              <button
                onClick={handleShootConfirm}
                className="p-1.5 sm:p-2 rounded-md bg-emerald-500 text-white hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                title="Confirm Shot"
              >
                <Check size={14} className="sm:w-[16px] sm:h-[16px]" />
              </button>
            )}
            <button
              onClick={() => { setSelectedShipId(null); setActionType(null); }}
              className="p-1.5 sm:p-2 rounded-md hover:bg-white/10 transition-all text-slate-400"
              title="Cancel"
            >
              <X size={14} className="sm:w-[16px] sm:h-[16px]" />
            </button>
          </div>
        )}
      </div>

      {/* Footer Controls - Desktop Bottom (Local modes) */}
      {!(isOnlineMode && networkGame.roomInfo) && (
      <div className="mt-0.5 sm:mt-1 flex gap-1 sm:gap-2">
        {state.phase === GamePhase.Lobby && (
          <div className="flex gap-2 items-center opacity-0 pointer-events-none">
            {/* Hidden as it's now in the main menu overlay */}
          </div>
        )}
        {state.phase === GamePhase.Setup && (
          <button
            onClick={gameStartBattle}
            className="px-2 sm:px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg font-bold uppercase tracking-widest transition-all shadow-lg text-[8px] sm:text-[9px] flex items-center gap-1"
          >
            <Check size={10} className="sm:w-[12px] sm:h-[12px]" />
            Ready
          </button>
        )}
        {state.phase === GamePhase.Battle && (
          <div className="flex gap-1 sm:gap-2 items-center">
            <button
              onClick={gameEndTurn}
              disabled={!state.turnActions.hasShot}
              className={`px-2 sm:px-3 py-1 rounded-lg font-bold uppercase tracking-widest transition-all shadow-lg text-[8px] sm:text-[9px] ${
                state.turnActions.hasShot
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              End Turn
            </button>
            <button
              onClick={() => {
                if (!audioStarted) setAudioStarted(true);
                window.location.reload();
              }}
              className="px-2 sm:px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold uppercase tracking-widest transition-all shadow-lg text-[8px] sm:text-[9px]"
            >
              Exit Menu
            </button>
          </div>
        )}
        {state.phase === GamePhase.GameOver && (
          <button
            onClick={() => {
              if (!audioStarted) setAudioStarted(true);
              window.location.reload();
            }}
            className="px-2 sm:px-3 py-1 bg-blue-500 hover:bg-blue-400 text-white rounded-lg font-bold uppercase tracking-widest transition-all shadow-lg text-[8px] sm:text-[9px]"
          >
            Play Again
          </button>
        )}
      </div>
      )}

      {/* Online Controls - Right Side */}
      {isOnlineMode && networkGame.roomInfo && (
      <div className="fixed right-1 sm:right-2 md:right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 sm:gap-3 z-50 pointer-events-auto">
        {gameState.phase === GamePhase.Battle && (
          <>
            <button
              onClick={gameEndTurn}
              disabled={!gameState.turnActions.hasShot}
              className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-bold uppercase tracking-widest transition-all shadow-xl text-[10px] sm:text-xs md:text-sm whitespace-nowrap ${
                gameState.turnActions.hasShot
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-white hover:scale-105 active:scale-95 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
              }`}
            >
              End Turn
            </button>
            <button
              onClick={() => {
                if (!audioStarted) setAudioStarted(true);
                window.location.reload();
              }}
              className="px-3 sm:px-4 py-2 sm:py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold uppercase tracking-widest transition-all shadow-xl text-[10px] sm:text-xs md:text-sm whitespace-nowrap hover:scale-105 active:scale-95"
            >
              Exit Menu
            </button>
          </>
        )}
        {gameState.phase === GamePhase.GameOver && (
          <button
            onClick={() => {
              if (!audioStarted) setAudioStarted(true);
              window.location.reload();
            }}
            className="px-3 sm:px-4 py-2 sm:py-3 bg-blue-500 hover:bg-blue-400 text-white rounded-lg font-bold uppercase tracking-widest transition-all shadow-xl text-[10px] sm:text-xs md:text-sm whitespace-nowrap hover:scale-105 active:scale-95"
          >
            Play Again
          </button>
        )}
      </div>
      )}

      {/* Instructions */}
      <div className="mt-0.5 sm:mt-1 text-slate-400 text-[7px] sm:text-[8px] max-w-xs text-center leading-tight bg-slate-900/30 px-1 sm:px-2 py-0.5 sm:py-1 rounded border border-white/5 relative">
        {(!audioStarted && state.phase !== GamePhase.Lobby) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-20 bg-amber-500/20 backdrop-blur-sm flex items-center justify-center rounded cursor-pointer"
            onClick={() => setAudioStarted(true)}
          >
            <span className="text-amber-400 font-bold animate-pulse text-[8px] sm:text-[10px] uppercase tracking-widest">
              Tap to Enable Sound 🔊
            </span>
          </motion.div>
        )}
        {state.phase === GamePhase.Lobby ? (
          <div className="flex flex-col gap-0">
            <span className="text-amber-400 font-bold uppercase">Lobby</span>
            <span>Click Start to begin setup. {isAiMode ? "(AI Mode Active)" : "(Local 2-Player)"}</span>
          </div>
        ) : state.phase === GamePhase.Setup ? (
          <div className="flex flex-col gap-0">
            <span className="text-amber-400 font-bold uppercase">Setup</span>
            <span>Drag ships anywhere! Multiple ships can stack.</span>
          </div>
        ) : state.phase === GamePhase.GameOver ? (
          <span className="text-emerald-400 font-bold uppercase">Game Over!</span>
        ) : (
          <div className="flex flex-col gap-0">
            <span className={`${state.currentPlayer === 'Player1' ? 'text-blue-400' : 'text-red-400'} font-bold uppercase`}>
              {state.currentPlayer === 'Player1' ? 'Blue' : 'Red'}
            </span>
            <span>Drag to Move → Select Shoot → Tap Target</span>
          </div>
        )}
      </div>

      {/* Shop Panel Modal */}
      <AnimatePresence>
        {showThemeSelector && (
          <ShopPanel
            currentTheme={gameTheme}
            onThemeChange={handleThemeChange}
            onClose={() => setShowThemeSelector(false)}
          />
        )}
      </AnimatePresence>

      {/* Volume Controls Modal */}
      <AnimatePresence>
        {showVolumeControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowVolumeControls(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800/95 p-6 rounded-lg border border-white/20 shadow-2xl backdrop-blur-md max-w-sm w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Volume2 size={20} />
                  Volume Controls
                </h3>
                <button
                  onClick={() => setShowVolumeControls(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Master Volume */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300">Master Volume</span>
                    <span className="text-xs text-slate-500">{Math.round(volumes.master * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volumes.master}
                    onChange={(e) => handleVolumeChange('master', parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                {/* Ambient Volume */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300">Ocean Ambient</span>
                    <span className="text-xs text-slate-500">{Math.round(volumes.ambient * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volumes.ambient}
                    onChange={(e) => handleVolumeChange('ambient', parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                {/* Music Volume */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300">Background Music</span>
                    <span className="text-xs text-slate-500">{Math.round(volumes.music * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volumes.music}
                    onChange={(e) => handleVolumeChange('music', parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                {/* Effects Volume */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300">Sound Effects</span>
                    <span className="text-xs text-slate-500">{Math.round(volumes.effects * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volumes.effects}
                    onChange={(e) => handleVolumeChange('effects', parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                {/* Mute Toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-600">
                  <span className="text-sm text-slate-300">Mute All</span>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isMuted ? 'bg-red-600' : 'bg-blue-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isMuted ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
