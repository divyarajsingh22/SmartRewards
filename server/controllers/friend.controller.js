const Friend = require('../models/Friend');
const User = require('../models/User');

const sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.body;
    const { recipientEmail } = req.body;

    const recipient = await User.findOne({ email: recipientEmail });
    if (!recipient) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (recipient._id.toString() === userId) {
      return res.status(400).json({ error: 'Cannot add yourself' });
    }

    const existing = await Friend.findOne({
      $or: [
        { requester: userId, recipient: recipient._id },
        { requester: recipient._id, recipient: userId }
      ]
    });

    if (existing) {
      return res.status(400).json({ error: 'Friend request already exists' });
    }

    const friendRequest = new Friend({
      requester: userId,
      recipient: recipient._id
    });

    await friendRequest.save();
    res.json({ message: 'Friend request sent' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send friend request' });
  }
};

const getFriendRequests = async (req, res) => {
  try {
    const { userId } = req.params;

    const requests = await Friend.find({
      recipient: userId,
      status: 'pending'
    }).populate('requester', 'name email');

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get friend requests' });
  }
};

const respondToFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body;

    const request = await Friend.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    if (action === 'accept') {
      request.status = 'accepted';
    } else if (action === 'reject') {
      request.status = 'rejected';
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

    await request.save();
    res.json({ message: `Friend request ${action}ed` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to respond to friend request' });
  }
};

const getFriends = async (req, res) => {
  try {
    const { userId } = req.params;

    const friends = await Friend.find({
      $or: [
        { requester: userId, status: 'accepted' },
        { recipient: userId, status: 'accepted' }
      ]
    }).populate('requester recipient', 'name email');

    const friendList = friends.map(f => ({
      id: f._id,
      friend: f.requester._id.toString() === userId ? f.recipient : f.requester
    }));

    res.json(friendList);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get friends' });
  }
};

module.exports = { sendFriendRequest, getFriendRequests, respondToFriendRequest, getFriends };