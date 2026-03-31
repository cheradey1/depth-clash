const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL || process.env.PG_CONNECTION_STRING || 'postgresql://postgres@localhost:5432/depthclash';
let pool = null;
let dbEnabled = true;

const inMemoryUsers = new Map();
const inMemoryShips = new Map();

const query = async (text, params = []) => {
  if (!dbEnabled) {
    throw new Error('Database not available');
  }
  return pool.query(text, params);
};

const initTables = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      user_id TEXT PRIMARY KEY,
      socket_id TEXT,
      nickname TEXT,
      currency_balance INTEGER NOT NULL DEFAULT 20,
      premium_ship_count INTEGER NOT NULL DEFAULT 0,
      balance_usd NUMERIC(12,2) NOT NULL DEFAULT 0.00,
      is_in_match BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS player_ships (
      ship_id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(user_id) ON DELETE CASCADE,
      is_locked BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS transactions (
      tx_id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(user_id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      amount INTEGER NOT NULL,
      match_id TEXT,
      details JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS match_results (
      match_id TEXT PRIMARY KEY,
      winner_id TEXT REFERENCES users(user_id),
      loser_id TEXT REFERENCES users(user_id),
      processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
};

const init = async () => {
  try {
    pool = new Pool({ connectionString });
    await pool.query('SELECT 1');
    await initTables();
    console.log('[DB] Connected to PostgreSQL');
  } catch (error) {
    dbEnabled = false;
    console.warn('[DB] PostgreSQL unavailable, using in-memory fallback:', error.message);
  }
};

const ensureUser = async (userId, socketId, nickname = 'Player') => {
  if (!dbEnabled) {
    if (!inMemoryUsers.has(userId)) {
      inMemoryUsers.set(userId, {
        user_id: userId,
        socket_id: socketId,
        nickname,
        currency_balance: 20,
        premium_ship_count: 0,
        balance_usd: 0.00,
        is_in_match: false,
        created_at: new Date()
      });
    } else {
      const existing = inMemoryUsers.get(userId);
      inMemoryUsers.set(userId, { ...existing, socket_id: socketId, nickname });
    }
    return inMemoryUsers.get(userId);
  }

  const result = await query('SELECT * FROM users WHERE user_id = $1', [userId]);
  if (result.rowCount === 0) {
    const insert = await query(
      'INSERT INTO users (user_id, socket_id, nickname) VALUES ($1, $2, $3) RETURNING *',
      [userId, socketId, nickname]
    );
    return insert.rows[0];
  }

  const update = await query(
    'UPDATE users SET socket_id = $2, nickname = $3 WHERE user_id = $1 RETURNING *',
    [userId, socketId, nickname]
  );
  return update.rows[0];
};

const getUserInventory = async (userId) => {
  if (!dbEnabled) {
    return inMemoryUsers.get(userId) || null;
  }

  const result = await query('SELECT user_id, socket_id, nickname, currency_balance, premium_ship_count, balance_usd, is_in_match FROM users WHERE user_id = $1', [userId]);
  return result.rowCount ? result.rows[0] : null;
};

const ensurePlayerShips = async (userId) => {
  if (!dbEnabled) {
    if (!inMemoryShips.has(userId)) {
      const ships = Array.from({ length: 12 }, (_, idx) => ({ ship_id: `${userId}-ship-${idx}`, user_id: userId, is_locked: false }));
      inMemoryShips.set(userId, ships);
    }
    return inMemoryShips.get(userId);
  }

  const existing = await query('SELECT ship_id FROM player_ships WHERE user_id = $1', [userId]);
  const currentCount = existing.rowCount;
  const createdShips = [];
  for (let i = currentCount; i < 12; i += 1) {
    const shipId = `${userId}-ship-${i}`;
    await query('INSERT INTO player_ships (ship_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [shipId, userId]);
    createdShips.push(shipId);
  }
  return await query('SELECT ship_id, user_id, is_locked FROM player_ships WHERE user_id = $1', [userId]).then(r => r.rows);
};

const lockPlayerShips = async (userId, isLocked) => {
  if (!dbEnabled) {
    const ships = inMemoryShips.get(userId) || [];
    inMemoryShips.set(userId, ships.map(ship => ({ ...ship, is_locked: isLocked })));
    return;
  }
  await query('UPDATE player_ships SET is_locked = $1 WHERE user_id = $2', [isLocked, userId]);
};

const spendShotToken = async (userId, cost = 1) => {
  if (!dbEnabled) {
    const user = inMemoryUsers.get(userId);
    if (!user || user.currency_balance < cost) return false;
    user.currency_balance -= cost;
    inMemoryUsers.set(userId, user);
    return true;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query('SELECT currency_balance FROM users WHERE user_id = $1 FOR UPDATE', [userId]);
    if (result.rowCount === 0 || result.rows[0].currency_balance < cost) {
      await client.query('ROLLBACK');
      return false;
    }
    await client.query('UPDATE users SET currency_balance = currency_balance - $2 WHERE user_id = $1', [userId, cost]);
    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[DB] spendShotToken failed:', error.message);
    return false;
  } finally {
    client.release();
  }
};

const purchasePremiumShip = async (userId, cost = 10) => {
  if (!dbEnabled) {
    const user = inMemoryUsers.get(userId);
    if (!user || user.currency_balance < cost) return null;
    user.currency_balance -= cost;
    user.premium_ship_count += 1;
    inMemoryUsers.set(userId, user);
    return user;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query('SELECT currency_balance, premium_ship_count, balance_usd, is_in_match, balance_usd, is_in_match FROM users WHERE user_id = $1 FOR UPDATE', [userId]);
    if (result.rowCount === 0 || result.rows[0].currency_balance < cost) {
      await client.query('ROLLBACK');
      return null;
    }
    const nextPremium = result.rows[0].premium_ship_count + 1;
    await client.query(
      'UPDATE users SET currency_balance = currency_balance - $2, premium_ship_count = $3 WHERE user_id = $1',
      [userId, cost, nextPremium]
    );
    await client.query('COMMIT');
    const updated = await client.query('SELECT user_id, socket_id, nickname, currency_balance, premium_ship_count, balance_usd, is_in_match FROM users WHERE user_id = $1', [userId]);
    return updated.rowCount ? updated.rows[0] : null;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[DB] purchasePremiumShip failed:', error.message);
    return null;
  } finally {
    client.release();
  }
};

const updateSocketId = async (userId, socketId) => {
  if (!dbEnabled) {
    const user = inMemoryUsers.get(userId);
    if (!user) return null;
    user.socket_id = socketId;
    inMemoryUsers.set(userId, user);
    return user;
  }
  const result = await query('UPDATE users SET socket_id = $2 WHERE user_id = $1 RETURNING *', [userId, socketId]);
  return result.rowCount ? result.rows[0] : null;
};

const logTransaction = async (userId, type, amount, matchId, details = {}) => {
  const txId = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  if (!dbEnabled) {
    console.log(`[TX] ${txId} | User: ${userId} | ${type} | Amount: ${amount}`);
    return { txId, success: false };
  }

  try {
    await query(
      `INSERT INTO transactions (tx_id, user_id, type, amount, match_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [txId, userId, type, amount, matchId, JSON.stringify(details)]
    );
    console.log(`[TX] ${txId} | User: ${userId} | ${type} | Amount: ${amount}`);
    return { txId, success: true };
  } catch (error) {
    console.error('[TX] Failed:', error.message);
    return { txId, success: false, error: error.message };
  }
};

const handleMatchReward = async (matchId, winnerUserId, loserUserId) => {
  if (!dbEnabled) {
    console.log(`[MATCH] ${matchId} | Winner: +12 ships, Loser: -3 ships (in-memory only)`);
    return { success: false };
  }

  const client = await getClient();
  try {
    await client.query('BEGIN');

    const alreadyProcessed = await client.query(
      'SELECT 1 FROM match_results WHERE match_id = $1',
      [matchId]
    );

    if (alreadyProcessed.rowCount > 0) {
      await client.query('ROLLBACK');
      console.warn(`[MATCH] ${matchId} already processed`);
      return { success: false, reason: 'already_processed' };
    }

    await client.query(
      'UPDATE users SET premium_ship_count = premium_ship_count + 12 WHERE user_id = $1',
      [winnerUserId]
    );
    await logTransaction(winnerUserId, 'match_reward', 12, matchId, { opponent: loserUserId });

    await client.query(
      'UPDATE users SET premium_ship_count = GREATEST(0, premium_ship_count - 3) WHERE user_id = $1',
      [loserUserId]
    );
    await logTransaction(loserUserId, 'match_penalty', -3, matchId, { opponent: winnerUserId });

    await client.query(
      'INSERT INTO match_results (match_id, winner_id, loser_id) VALUES ($1, $2, $3)',
      [matchId, winnerUserId, loserUserId]
    );

    await client.query('COMMIT');
    console.log(`[MATCH] ${matchId} settled: +12 to ${winnerUserId}, -3 to ${loserUserId}`);
    return { success: true, matchId };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[MATCH] Reward failed:', error.message);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
};

const getClient = async () => {
  if (!dbEnabled) {
    throw new Error('Database not available');
  }
  return pool.connect();
};

module.exports = {
  init,
  query,
  getClient,
  ensureUser,
  getUserInventory,
  ensurePlayerShips,
  lockPlayerShips,
  spendShotToken,
  purchasePremiumShip,
  updateSocketId,
  logTransaction,
  handleMatchReward
};
