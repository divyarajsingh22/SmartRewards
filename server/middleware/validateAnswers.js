module.exports = function validateAnswers(req, res, next) {
  const answers = req.body?.answers;
  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'answers must be an array' });
  }

  for (const a of answers) {
    if (!a.questionId) return res.status(400).json({ error: 'each answer must include questionId' });
    if (typeof a.selectedOption !== 'number') return res.status(400).json({ error: 'each answer must include selectedOption as number' });
  }

  next();
};
