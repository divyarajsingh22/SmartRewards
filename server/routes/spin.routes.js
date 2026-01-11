const express = require('express');
const router = express.Router();
const { spinWheel } = require('../controllers/spin.controller');

router.post('/spin', spinWheel);

module.exports = router;
