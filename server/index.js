const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://192.168.0.104:3000'
    ],
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Game rooms storage
const gameRooms = new Map();

// Player sessions storage
const playerSessions = new Map();

// ============ GAME ROOM MANAGEMENT ============

class GameRoom {
  constructor(roomId) {
    this.roomId = roomId;
    this.players = {};
    this.status = 'waiting'; // waiting, setup, battle, gameover
    this.currentPlayer = 'Player1';
    this.setupTimer = 30;
    this.expiresAt = Date.now() + 3600000; // 1 hour from creation
    this.gameState = {
      phase: 'Setup',
      ships: [],
      winner: null,
      turnActions: { hasMoved: false, hasShot: false },
      lastExplosion: null,
      lastLaunch: null,
      lastShot: null
    };
  }

  addPlayer(socketId, nickname) {
    const playerKey = Object.keys(this.players).length === 0 ? 'Player1' : 'Player2';
    this.players[socketId] = {
      id: socketId,
      nickname: nickname || playerKey,
      playerKey: playerKey,
      ready: false,
      ships: []
    };
    return playerKey;
  }

  removePlayer(socketId) {
    delete this.players[socketId];
  }

  isFull() {
    return Object.keys(this.players).length === 2;
  }

  isEmpty() {
    return Object.keys(this.players).length === 0;
  }

  getOpponentKey(playerKey) {
    return playerKey === 'Player1' ? 'Player2' : 'Player1';
  }
}

// ============ SOCKET.IO EVENTS ============

io.on('connection', (socket) => {
  console.log(`[CONNECTION] Player connected: ${socket.id}`);

  // CREATE ROOM
  socket.on('create_room', (data) => {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const room = new GameRoom(roomId);
    const playerKey = room.addPlayer(socket.id, data.nickname);

    gameRooms.set(roomId, room);
    playerSessions.set(socket.id, { roomId, playerKey });

    socket.join(roomId);
    socket.emit('room_created', { roomId, playerKey });
    console.log(`[ROOM] Created room: ${roomId}, Nickname: ${data.nickname}, PlayerKey: ${playerKey}, SocketID: ${socket.id}`);
  });

  // JOIN ROOM
  socket.on('join_room', (data) => {
    const { roomId, nickname } = data;
    const room = gameRooms.get(roomId);

    console.log(`[JOIN] Attempt to join room: ${roomId}, Nickname: ${nickname}, SocketID: ${socket.id}`);

    if (!room) {
      socket.emit('join_error', { message: 'Room not found' });
      console.log(`[JOIN] Error: Room ${roomId} not found`);
      return;
    }

    if (room.isFull()) {
      socket.emit('join_error', { message: 'Room is full' });
      console.log(`[JOIN] Error: Room ${roomId} is full`);
      return;
    }

    const playerKey = room.addPlayer(socket.id, nickname);
    playerSessions.set(socket.id, { roomId, playerKey });

    socket.join(roomId);
    socket.emit('room_joined', { roomId, playerKey });

    // Get all players info
    const players_in_room = Object.values(room.players).map(p => ({
      playerKey: p.playerKey,
      nickname: p.nickname
    }));

    // Notify all players that a new player joined
    io.to(roomId).emit('player_joined', {
      playerKey,
      totalPlayers: 2,
      readyToStart: true,
      players: players_in_room
    });

    // Start setup phase when both players are present
    room.status = 'setup';
    io.to(roomId).emit('setup_start', {
      setupTimer: room.setupTimer
    });

    console.log(`[JOIN] Success: ${playerKey} joined room: ${roomId}, Players in room:`, players_in_room);
  });

  // PLAYER READY (After setup phase)
  socket.on('player_ready', () => {
    const session = playerSessions.get(socket.id);
    if (!session) return;

    const room = gameRooms.get(session.roomId);
    if (!room) return;

    room.players[socket.id].ready = true;

    const allReady = Object.values(room.players).every(p => p.ready);
    if (allReady && room.status === 'setup') {
      room.status = 'battle';
      io.to(session.roomId).emit('battle_start', {
        currentPlayer: room.currentPlayer
      });
      console.log(`[BATTLE] Battle started in room: ${session.roomId}`);
    }
  });

  // PLACE SHIP (during setup phase)
  socket.on('place_ship', (data) => {
    const session = playerSessions.get(socket.id);
    if (!session) return;

    const room = gameRooms.get(session.roomId);
    if (!room || room.status !== 'setup') return;

    const { shipId, coord } = data;
    const playerShips = room.players[socket.id].ships;

    // Check if ship already exists
    const existingShipIndex = playerShips.findIndex(ship => ship.id === shipId);
    if (existingShipIndex !== -1) {
      // Update existing ship position
      playerShips[existingShipIndex].coord = coord;
    } else {
      // Add new ship
      playerShips.push({ id: shipId, coord, isAlive: true });
    }

    // Broadcast ship placement to all players in room (works for both host and guest)
    io.to(session.roomId).emit('ship_placed', {
      playerKey: session.playerKey,
      shipId,
      coord
    });

    // Notify opponent about ship amount for UI hints (optional)
    const opponentKey = room.getOpponentKey(session.playerKey);
    const opponentSocketId = Object.keys(room.players).find(id => room.players[id].playerKey === opponentKey);

    if (opponentSocketId) {
      io.to(opponentSocketId).emit('opponent_ship_placed', {
        playerKey: session.playerKey,
        shipCount: playerShips.length
      });
    }

    console.log(`[SETUP] ${session.playerKey} placed ship ${shipId} in room ${session.roomId}`);
  });

  // MOVE SHIP
  socket.on('move_ship', (data) => {
    const session = playerSessions.get(socket.id);
    if (!session) return;

    const room = gameRooms.get(session.roomId);
    if (!room || room.status !== 'battle') return;

    // Validate: only current player can move
    if (room.currentPlayer !== session.playerKey) {
      socket.emit('action_error', { message: 'Not your turn' });
      return;
    }

    // TODO: Validate move is within hex bounds and adjacent
    const { shipId, targetCoord } = data;
    room.gameState.turnActions.hasMoved = true;

    // Broadcast to both players (hide opponent ships)
    io.to(session.roomId).emit('ship_moved', {
      shipId,
      targetCoord,
      playerKey: session.playerKey
    });

    console.log(`[MOVE] ${session.playerKey} moved ship ${shipId} in room ${session.roomId}`);
  });

  // SHOOT
  socket.on('shoot', (data) => {
    const session = playerSessions.get(socket.id);
    if (!session) return;

    const room = gameRooms.get(session.roomId);
    if (!room || room.status !== 'battle') return;

    // Validate: only current player can shoot
    if (room.currentPlayer !== session.playerKey) {
      socket.emit('action_error', { message: 'Not your turn' });
      return;
    }

    const { originCoord, targetCoord } = data;
    const opponentKey = room.getOpponentKey(session.playerKey);
    const opponentSocketId = Object.keys(room.players).find(id => room.players[id].playerKey === opponentKey);

    // Check if target has ship and apply damage/destruction
    let hit = false;
    let destroyedShipId = null;

    if (opponentSocketId) {
      const opponentShips = room.players[opponentSocketId].ships;
      const targetShipIndex = opponentShips.findIndex(ship =>
        ship.coord.q === targetCoord.q &&
        ship.coord.r === targetCoord.r &&
        ship.coord.s === targetCoord.s
      );

      if (targetShipIndex !== -1) {
        hit = true;
        destroyedShipId = opponentShips[targetShipIndex].id;
        opponentShips.splice(targetShipIndex, 1); // Remove destroyed ship

        // Check if opponent has no ships left
        if (opponentShips.length === 0) {
          room.status = 'gameover';
          room.gameState.winner = session.playerKey;
          io.to(session.roomId).emit('game_over', {
            winner: session.playerKey,
            loser: opponentKey
          });
          console.log(`[GAMEOVER] ${session.playerKey} wins in room ${session.roomId}`);
          return;
        }
      }
    }

    room.gameState.lastShot = { start: originCoord, end: targetCoord };
    room.gameState.turnActions.hasShot = true;

    // Broadcast to both players
    io.to(session.roomId).emit('projectile_fired', {
      shooterKey: session.playerKey,
      originCoord,
      targetCoord,
      hit,
      destroyedShipId
    });

    console.log(`[SHOOT] ${session.playerKey} fired at ${JSON.stringify(targetCoord)} in room ${session.roomId} - ${hit ? 'HIT!' : 'MISS'}`);
  });

  // END TURN
  socket.on('end_turn', () => {
    const session = playerSessions.get(socket.id);
    if (!session) return;

    const room = gameRooms.get(session.roomId);
    if (!room || room.status !== 'battle') return;

    // Validate: only current player can end turn
    if (room.currentPlayer !== session.playerKey) {
      socket.emit('action_error', { message: 'Not your turn' });
      return;
    }

    // Validate: must have shot
    if (!room.gameState.turnActions.hasShot) {
      socket.emit('action_error', { message: 'Must shoot before ending turn' });
      return;
    }

    // Switch player
    room.currentPlayer = room.getOpponentKey(session.playerKey);
    room.gameState.turnActions = { hasMoved: false, hasShot: false };

    io.to(session.roomId).emit('turn_ended', {
      nextPlayer: room.currentPlayer
    });

    console.log(`[TURN] Turn passed to ${room.currentPlayer} in room ${session.roomId}`);
  });

  // DISCONNECT
  socket.on('disconnect', () => {
    const session = playerSessions.get(socket.id);
    if (!session) {
      console.log(`[DISCONNECT] Player ${socket.id} disconnected (no session)`);
      return;
    }

    const room = gameRooms.get(session.roomId);
    if (room) {
      room.removePlayer(socket.id);

      if (room.isEmpty()) {
        gameRooms.delete(session.roomId);
        console.log(`[ROOM] Room ${session.roomId} deleted (empty)`);
      } else {
        // Notify remaining player
        io.to(session.roomId).emit('opponent_disconnected', {
          message: 'Opponent disconnected'
        });
        console.log(`[DISCONNECT] Player ${session.playerKey} left room ${session.roomId}`);
      }
    }

    playerSessions.delete(socket.id);
  });

  // PING (heartbeat)
  socket.on('ping', () => {
    socket.emit('pong');
  });
});

// ============ HTTP ROUTES ============

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/rooms', (req, res) => {
  const activeRooms = Array.from(gameRooms.values()).map(room => ({
    roomId: room.roomId,
    players: Object.keys(room.players).length,
    status: room.status
  }));
  res.json({ activeRooms, totalRooms: gameRooms.size });
});

// Shareable room link
app.get('/join/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = gameRooms.get(roomId.toUpperCase());

  if (!room) {
    return res.status(404).json({ error: 'Room not found or expired' });
  }

  if (room.isFull()) {
    return res.status(400).json({ error: 'Room is full' });
  }

  if (Date.now() > room.expiresAt) {
    return res.status(410).json({ error: 'Room has expired' });
  }

  // Return room info for the client to auto-join
  res.json({
    roomId: room.roomId,
    status: room.status,
    players: Object.keys(room.players).length,
    expiresAt: room.expiresAt
  });
});

// ============ ROOM CLEANUP ============

// Clean up expired rooms every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [roomId, room] of gameRooms.entries()) {
    if (now > room.expiresAt) {
      // Notify players if room is expiring
      io.to(roomId).emit('room_expired', {
        message: 'Room has expired'
      });

      // Clean up player sessions
      for (const socketId of Object.keys(room.players)) {
        playerSessions.delete(socketId);
      }

      gameRooms.delete(roomId);
      console.log(`[CLEANUP] Room ${roomId} expired and deleted`);
    }
  }
}, 5 * 60 * 1000); // 5 minutes

const PORT = process.env.PORT || 4000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🎮 Depth Clash Server running on port ${PORT}`);
  console.log(`🌐 WebSocket endpoint: ws://0.0.0.0:${PORT}`);
});
