module.exports = function validateUserId(req, res, next) {
  const userId = req.body?.userId || req.params?.userId || req.query?.userId;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  next();
};
