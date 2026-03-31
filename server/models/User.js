const db = require('../db');

const USER_FIELDS = 'user_id, socket_id, nickname, currency_balance, premium_ship_count, balance_usd, is_in_match';

const createUser = async (userId, socketId, nickname = 'Player') => {
  const result = await db.query(
    `INSERT INTO users (user_id, socket_id, nickname)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id) DO UPDATE SET socket_id = EXCLUDED.socket_id, nickname = EXCLUDED.nickname
     RETURNING ${USER_FIELDS}`,
    [userId, socketId, nickname]
  );
  return result.rows[0];
};

const getUserById = async (userId) => {
  const result = await db.query(
    `SELECT ${USER_FIELDS} FROM users WHERE user_id = $1`,
    [userId]
  );
  return result.rowCount ? result.rows[0] : null;
};

const ensureUser = async (userId, socketId, nickname = 'Player') => {
  const existing = await getUserById(userId);
  if (existing) {
    const updated = await db.query(
      `UPDATE users SET socket_id = $2, nickname = $3 WHERE user_id = $1 RETURNING ${USER_FIELDS}`,
      [userId, socketId, nickname]
    );
    return updated.rows[0];
  }
  return createUser(userId, socketId, nickname);
};

const updateSocketId = async (userId, socketId) => {
  const result = await db.query(
    `UPDATE users SET socket_id = $2 WHERE user_id = $1 RETURNING ${USER_FIELDS}`,
    [userId, socketId]
  );
  return result.rowCount ? result.rows[0] : null;
};

const setInMatch = async (userId, inMatch) => {
  const result = await db.query(
    `UPDATE users SET is_in_match = $2 WHERE user_id = $1 RETURNING ${USER_FIELDS}`,
    [userId, inMatch]
  );
  return result.rowCount ? result.rows[0] : null;
};

const reservePremiumShips = async (userId, count = 12) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const existing = await client.query('SELECT premium_ship_count FROM users WHERE user_id = $1 FOR UPDATE', [userId]);
    if (existing.rowCount === 0 || existing.rows[0].premium_ship_count < count) {
      await client.query('ROLLBACK');
      return null;
    }
    await client.query('UPDATE users SET premium_ship_count = premium_ship_count - $2 WHERE user_id = $1', [userId, count]);
    await client.query('COMMIT');
    return await getUserById(userId);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[User] reservePremiumShips failed:', error.message);
    return null;
  } finally {
    client.release();
  }
};

const releasePremiumShips = async (userId, count = 12) => {
  const result = await db.query(
    `UPDATE users SET premium_ship_count = premium_ship_count + $2 WHERE user_id = $1 RETURNING ${USER_FIELDS}`,
    [userId, count]
  );
  return result.rowCount ? result.rows[0] : null;
};

const addUsdBalance = async (userId, amount) => {
  const result = await db.query(
    `UPDATE users SET balance_usd = balance_usd + $2 WHERE user_id = $1 RETURNING ${USER_FIELDS}`,
    [userId, amount]
  );
  return result.rowCount ? result.rows[0] : null;
};

const deductUsdBalance = async (userId, amount) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const existing = await client.query('SELECT balance_usd FROM users WHERE user_id = $1 FOR UPDATE', [userId]);
    if (existing.rowCount === 0 || Number(existing.rows[0].balance_usd) < amount) {
      await client.query('ROLLBACK');
      return null;
    }
    const updated = await client.query(
      `UPDATE users SET balance_usd = balance_usd - $2 WHERE user_id = $1 RETURNING ${USER_FIELDS}`,
      [userId, amount]
    );
    await client.query('COMMIT');
    return updated.rowCount ? updated.rows[0] : null;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[User] deductUsdBalance failed:', error.message);
    return null;
  } finally {
    client.release();
  }
};

module.exports = {
  ensureUser,
  getUserById,
  updateSocketId,
  setInMatch,
  reservePremiumShips,
  releasePremiumShips,
  addUsdBalance,
  deductUsdBalance
};
