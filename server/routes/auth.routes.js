const express = require('express');
const router = express.Router();
const { login, getProfile } = require('../controllers/auth.controller');

router.post('/login', login);
router.get('/profile/:userId', getProfile);

module.exports = router;

