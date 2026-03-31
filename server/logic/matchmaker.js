const matches = new Map();
const tournamentQueue = [];

const createMatch = (playerEntries) => {
  const matchId = `MATCH-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const match = {
    matchId,
    players: playerEntries.map(entry => entry.socketId),
    users: playerEntries.map(entry => entry.userId),
    pool: [],
    score: {},
    status: 'waiting',
    createdAt: new Date()
  };
  playerEntries.forEach(entry => {
    match.score[entry.socketId] = 0;
  });
  matches.set(matchId, match);
  return match;
};

const addToQueue = (socketId, userId) => {
  if (tournamentQueue.some(entry => entry.userId === userId)) {
    return null;
  }

  tournamentQueue.push({ socketId, userId });
  if (tournamentQueue.length >= 2) {
    const players = tournamentQueue.splice(0, 2);
    const match = createMatch(players);
    match.status = 'active';
    return match;
  }
  return null;
};

const getMatch = (matchId) => matches.get(matchId);

const findMatchBySocket = (socketId) => {
  for (const match of matches.values()) {
    if (match.players.includes(socketId)) {
      return match;
    }
  }
  return null;
};

const addToPool = (matchId, shipId) => {
  const match = matches.get(matchId);
  if (!match) return null;
  match.pool.push(shipId);
  return match;
};

const resolveMatchQuit = (matchId, leaverSocketId) => {
  const match = matches.get(matchId);
  if (!match) return null;
  const winnerSocketId = match.players.find(id => id !== leaverSocketId);
  if (!winnerSocketId) return null;
  match.status = 'completed';
  match.winner = winnerSocketId;
  return { match, winnerSocketId };
};

const removeMatch = (matchId) => {
  matches.delete(matchId);
};

module.exports = {
  addToQueue,
  getMatch,
  findMatchBySocket,
  addToPool,
  resolveMatchQuit,
  removeMatch
};
