const express = require('express');
const router = express.Router();
const { sendFriendRequest, getFriendRequests, respondToFriendRequest, getFriends } = require('../controllers/friend.controller');

router.post('/request', sendFriendRequest);
router.get('/requests/:userId', getFriendRequests);
router.put('/request/:requestId', respondToFriendRequest);
router.get('/:userId', getFriends);

module.exports = router;