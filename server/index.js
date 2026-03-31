const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');
const User = require('./models/User');
const matchmaker = require('./logic/matchmaker');
const paymentsRouter = require('./routes/payments');

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
app.use('/payments', paymentsRouter);

db.init().catch(error => console.error('[DB] initialization failed:', error));

// Game rooms storage
const gameRooms = new Map();
const activeMatches = gameRooms;

// Player sessions storage
const playerSessions = new Map();

// ============ GAME ROOM MANAGEMENT ============

class GameRoom {
  constructor(roomId) {
    this.roomId = roomId;
    this.players = {};
    this.scores = {};
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

  addPlayer(socketId, nickname, userId) {
    const playerKey = Object.keys(this.players).filter(id => !this.players[id]?.disconnected).length === 0 ? 'Player1' : 'Player2';
    this.players[socketId] = {
      id: socketId,
      socketId,
      userId,
      nickname: nickname || playerKey,
      playerKey,
      ready: false,
      disconnected: false,
      disconnectedAt: null,
      ships: []
    };
    this.scores[socketId] = 0;
    return playerKey;
  }

  removePlayer(socketId) {
    if (this.players[socketId]) {
      this.players[socketId].disconnected = true;
      this.players[socketId].disconnectedAt = Date.now();
    }
  }

  isFull() {
    return Object.values(this.players).filter(player => !player.disconnected).length === 2;
  }

  isEmpty() {
    return Object.values(this.players).every(player => player.disconnected);
  }

  getOpponentKey(playerKey) {
    return playerKey === 'Player1' ? 'Player2' : 'Player1';
  }
}

const findPlayerSocketByUserId = (room, userId) => {
  return Object.keys(room.players).find(socketId => room.players[socketId]?.userId === userId);
};

const transferPlayerSocket = (room, oldSocketId, newSocketId) => {
  const oldPlayer = room.players[oldSocketId];
  if (!oldPlayer) return null;

  const updatedPlayer = {
    ...oldPlayer,
    id: newSocketId,
    socketId: newSocketId,
    disconnected: false,
    disconnectedAt: null
  };

  delete room.players[oldSocketId];
  room.players[newSocketId] = updatedPlayer;

  if (room.scores[oldSocketId] !== undefined) {
    room.scores[newSocketId] = room.scores[oldSocketId];
    delete room.scores[oldSocketId];
  }

  return updatedPlayer;
};

const handleShipTransfer = db.handleMatchReward;

// ============ SOCKET.IO EVENTS ============

io.on('connection', (socket) => {
  console.log(`[CONNECTION] Player connected: ${socket.id}`);

  // CREATE ROOM
  socket.on('create_room', async (data) => {
    const userId = data.userId || socket.id;
    const nickname = data.nickname || 'Player';

    const user = await User.ensureUser(userId, socket.id, nickname);
    if (user.is_in_match) {
      socket.emit('room_error', { message: 'You are already in an active match' });
      return;
    }

    await db.ensurePlayerShips(userId);

    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const room = new GameRoom(roomId);
    const playerKey = room.addPlayer(socket.id, nickname, userId);

    gameRooms.set(roomId, room);
    playerSessions.set(socket.id, { roomId, playerKey, userId });

    socket.join(roomId);
    socket.emit('room_created', { roomId, playerKey });
    const inventory = await User.getUserById(userId);
    socket.emit('inventory', inventory);
    console.log(`[ROOM] Created room: ${roomId}, Nickname: ${nickname}, PlayerKey: ${playerKey}, SocketID: ${socket.id}, UserID: ${userId}`);
  });

  // JOIN ROOM
  socket.on('join_room', async (data) => {
    const { roomId, nickname, userId: requestedUserId } = data;
    const userId = requestedUserId || socket.id;
    const room = gameRooms.get(roomId);

    console.log(`[JOIN] Attempt to join room: ${roomId}, Nickname: ${nickname}, SocketID: ${socket.id}, UserID: ${userId}`);

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

    const user = await User.ensureUser(userId, socket.id, nickname || 'Player');
    if (user.is_in_match) {
      socket.emit('join_error', { message: 'You are already in an active match' });
      return;
    }

    await db.ensurePlayerShips(userId);

    const playerKey = room.addPlayer(socket.id, nickname, userId);
    playerSessions.set(socket.id, { roomId, playerKey, userId });

    socket.join(roomId);
    socket.emit('room_joined', { roomId, playerKey });
    const inventory = await User.getUserById(userId);
    socket.emit('inventory', inventory);

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
  socket.on('player_ready', async () => {
    const session = playerSessions.get(socket.id);
    if (!session) return;

    const room = gameRooms.get(session.roomId);
    if (!room) return;

    room.players[socket.id].ready = true;

    const allReady = Object.values(room.players).every(p => p.ready);
    if (allReady && room.status === 'setup') {
      room.status = 'battle';
      const playerEntries = Object.keys(room.players).map(socketId => ({
        socketId,
        userId: playerSessions.get(socketId)?.userId
      }));
      await Promise.all(playerEntries.map(entry => {
        if (entry.userId) {
          return Promise.all([
            db.lockPlayerShips(entry.userId, true),
            User.setInMatch(entry.userId, true)
          ]);
        }
        return Promise.resolve();
      }));
      // Store all ships on server for Fog of War (before sending to client)
      room.gameState.playerShips = {};
      Object.keys(room.players).forEach(socketId => {
        const playerKey = room.players[socketId].playerKey;
        room.gameState.playerShips[playerKey] = room.players[socketId].ships.map(ship => ({
          ...ship,
          id: ship.id
        }));
      });

      io.to(session.roomId).emit('battle_start', {
        currentPlayer: room.currentPlayer,
        enemyShipCount: 12
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

    // Send ship placement only to the owner; opponent receives a count hint.
    socket.emit('ship_placed', {
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

    // Send movement only to the owner. Opponent is not given the exact coordinates.
    socket.emit('ship_moved', {
      shipId,
      targetCoord,
      playerKey: session.playerKey
    });

    console.log(`[MOVE] ${session.playerKey} moved ship ${shipId} in room ${session.roomId}`);
  });

  // FIRE SHOT
  const handleFireShot = async (data) => {
    const session = playerSessions.get(socket.id);
    if (!session) return;

    const room = gameRooms.get(session.roomId);
    if (!room || room.status !== 'battle') return;

    if (room.currentPlayer !== session.playerKey) {
      socket.emit('action_error', { message: 'Not your turn' });
      return;
    }

    const { originCoord, targetCoord } = data;
    const originShip = room.players[socket.id].ships.find(ship =>
      ship.coord.q === originCoord.q &&
      ship.coord.r === originCoord.r
    );

    if (!originShip) {
      socket.emit('action_error', { message: 'Invalid firing ship' });
      return;
    }

    const hasShotToken = await db.spendShotToken(session.userId, 1);
    if (!hasShotToken) {
      socket.emit('action_error', { message: 'Not enough premium ship currency to shoot' });
      return;
    }

    const opponentKey = room.getOpponentKey(session.playerKey);
    const opponentSocketId = Object.keys(room.players).find(id => room.players[id].playerKey === opponentKey);

    let hit = false;

    if (opponentSocketId && room.gameState.playerShips) {
      const opponentShips = room.gameState.playerShips[opponentKey] || [];
      const targetShipIndex = opponentShips.findIndex(ship =>
        ship.coord.q === targetCoord.q &&
        ship.coord.r === targetCoord.r
      );

      if (targetShipIndex !== -1) {
        hit = true;
        room.scores[socket.id] = (room.scores[socket.id] || 0) + 1;
        // Remove ship from server-side list (fog of war)
        opponentShips.splice(targetShipIndex, 1);
        // Also remove from player ships for cleanup
        room.players[opponentSocketId].ships = room.players[opponentSocketId].ships.filter(s => 
          !(s.coord.q === targetCoord.q && s.coord.r === targetCoord.r)
        );

        if (opponentShips.length === 0) {
          room.status = 'gameover';
          room.gameState.winner = session.playerKey;
          const opponentSession = playerSessions.get(opponentSocketId);
          const opponentUserId = opponentSession ? opponentSession.userId : null;
          await Promise.all([
            db.lockPlayerShips(session.userId, false),
            opponentUserId ? db.lockPlayerShips(opponentUserId, false) : Promise.resolve()
          ]);
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

    io.to(session.roomId).emit('shot_result', {
      shooterKey: session.playerKey,
      originCoord,
      targetCoord,
      hit
    });

    console.log(`[FIRE_SHOT] ${session.playerKey} fired at ${JSON.stringify(targetCoord)} in room ${session.roomId} - ${hit ? 'HIT!' : 'MISS'}`);
  };

  socket.on('fire_shot', handleFireShot);
  socket.on('shoot', handleFireShot);

  socket.on('game_over', async (data) => {
    const { matchId, winnerId } = data || {};
    const match = activeMatches.get(matchId);
    if (!match) return;

    const session = playerSessions.get(socket.id);
    if (!session) return;

    const opponentSocketId = Object.keys(match.players).find(id => id !== socket.id && !match.players[id].disconnected);
    const actualWinner = match.scores[socket.id] >= 12 ? socket.id :
                         opponentSocketId && match.scores[opponentSocketId] >= 12 ? opponentSocketId : null;

    if (!actualWinner) {
      console.error('[CHEAT] game_over received but no player has 12 kills:', { matchId, winnerId, scores: match.scores });
      socket.emit('game_over_invalid', { message: 'No valid winner yet' });
      return;
    }

    const validWinnerIds = [actualWinner, match.players[actualWinner]?.playerKey, match.players[actualWinner]?.userId].filter(Boolean);
    if (validWinnerIds.includes(winnerId)) {
      const loserSocketId = actualWinner === socket.id ? opponentSocketId : socket.id;
      const winnerSession = playerSessions.get(actualWinner);
      const loserSession = loserSocketId ? playerSessions.get(loserSocketId) : null;
      const rewardResult = await db.handleMatchReward(matchId, winnerSession?.userId, loserSession?.userId);
      socket.emit('game_over_validated', { matchId, winnerId, rewardResult });
      console.log('[MATCH] game_over validated for', winnerId, 'in', matchId, '- reward:', rewardResult.success);
    } else {
      console.error('[CHEAT] Invalid game_over payload!', { matchId, winnerId, actualWinner });
      socket.emit('game_over_invalid', { message: 'Invalid result data' });
    }
  });

  socket.on('reconnect_to_match', async (data) => {
    const { matchId, userId } = data || {};
    const room = activeMatches.get(matchId);
    if (!room) {
      socket.emit('reconnect_failed', { message: 'Match not found' });
      return;
    }

    const oldSocketId = findPlayerSocketByUserId(room, userId);
    if (!oldSocketId) {
      socket.emit('reconnect_failed', { message: 'No disconnected player found for this match' });
      return;
    }

    const oldPlayer = room.players[oldSocketId];
    if (!oldPlayer?.disconnected) {
      socket.emit('reconnect_failed', { message: 'Player already connected' });
      return;
    }

    const restoredPlayer = transferPlayerSocket(room, oldSocketId, socket.id);
    if (!restoredPlayer) {
      socket.emit('reconnect_failed', { message: 'Unable to restore match session' });
      return;
    }

    playerSessions.set(socket.id, { roomId: matchId, playerKey: restoredPlayer.playerKey, userId });
    await db.updateSocketId(userId, socket.id);
    socket.join(matchId);

    socket.emit('reconnect_success', {
      roomId: matchId,
      playerKey: restoredPlayer.playerKey,
      phase: room.status,
      currentPlayer: room.currentPlayer,
      ships: restoredPlayer.ships,
      opponentShipCount: Object.values(room.players).filter(player => player.playerKey !== restoredPlayer.playerKey && !player.disconnected).reduce((sum, player) => sum + player.ships.length, 0)
    });

    io.to(matchId).emit('opponent_reconnected', {
      playerKey: restoredPlayer.playerKey
    });
  });

  socket.on('get_inventory', async () => {
    const session = playerSessions.get(socket.id);
    if (!session) return;
    const inventory = await db.getUserInventory(session.userId);
    socket.emit('inventory', inventory);
  });

  socket.on('buy_premium_ship', async (data) => {
    const session = playerSessions.get(socket.id);
    if (!session) return;

    const cost = data?.cost || 10;
    const purchase = await db.purchasePremiumShip(session.userId, cost);
    if (!purchase) {
      socket.emit('action_error', { message: 'Insufficient currency to buy premium ship' });
      return;
    }
    socket.emit('inventory_updated', purchase);
  });

  socket.on('join_tournament', async () => {
    const session = playerSessions.get(socket.id);
    if (!session) return;

    const user = await User.getUserById(session.userId);
    if (!user) {
      socket.emit('action_error', { message: 'Unable to load user inventory' });
      return;
    }

    if (user.is_in_match) {
      socket.emit('action_error', { message: 'You are already in an active match' });
      return;
    }

    if (user.premium_ship_count < 12) {
      socket.emit('action_error', { message: 'You need at least 12 premium ships to join the tournament' });
      return;
    }

    const reserved = await User.reservePremiumShips(session.userId, 12);
    if (!reserved) {
      socket.emit('action_error', { message: 'Unable to reserve premium ships for tournament' });
      return;
    }

    await User.setInMatch(session.userId, true);

    const matched = matchmaker.addToQueue(socket.id, session.userId);
    if (matched) {
      matched.players.forEach((playerSocketId) => {
        io.to(playerSocketId).emit('tournament_match_found', {
          matchId: matched.matchId,
          players: matched.players,
          pool: matched.pool
        });
      });
    } else {
      socket.emit('tournament_waiting', {
        message: 'Waiting for an opponent in the tournament queue...'
      });
    }
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
  socket.on('disconnect', async () => {
    const session = playerSessions.get(socket.id);
    if (!session) {
      console.log(`[DISCONNECT] Player ${socket.id} disconnected (no session)`);
      return;
    }

    const user = await User.getUserById(session.userId);
    if (user && user.is_in_match) {
      await User.setInMatch(session.userId, false);
      await db.lockPlayerShips(session.userId, false);
    }

    const tournamentMatch = matchmaker.findMatchBySocket(socket.id);
    if (tournamentMatch) {
      const result = matchmaker.resolveMatchQuit(tournamentMatch.matchId, socket.id);
      if (result && result.winnerSocketId) {
        io.to(result.winnerSocketId).emit('tournament_victory', {
          matchId: tournamentMatch.matchId,
          message: 'Your opponent left the tournament. You win the pool!'
        });
      }
      matchmaker.removeMatch(tournamentMatch.matchId);
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
