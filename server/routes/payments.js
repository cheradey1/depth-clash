const express = require('express');
const User = require('../models/User');

const router = express.Router();
const pendingTransactions = new Map();

router.post('/withdraw', async (req, res) => {
  const { userId, amount } = req.body;
  if (!userId || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Invalid withdrawal request' });
  }

  const user = await User.getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (Number(user.balance_usd) < amount) {
    return res.status(400).json({ error: 'Insufficient USD balance' });
  }

  const withdrawalId = `wd_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  pendingTransactions.set(withdrawalId, {
    id: withdrawalId,
    userId,
    amount,
    status: 'pending',
    createdAt: new Date().toISOString()
  });

  return res.json({ status: 'pending', withdrawalId });
});

router.get('/withdrawals/:userId', async (req, res) => {
  const { userId } = req.params;
  const transactions = Array.from(pendingTransactions.values()).filter(tx => tx.userId === userId);
  res.json({ withdrawals: transactions });
});

module.exports = router;
