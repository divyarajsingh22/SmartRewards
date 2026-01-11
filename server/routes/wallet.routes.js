const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');

router.get('/:userId/transactions', walletController.getWalletTransactions);
router.get('/:userId/balance', walletController.getWalletBalance);

module.exports = router;