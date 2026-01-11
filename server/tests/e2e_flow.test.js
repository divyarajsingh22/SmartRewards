let request;
try {
  request = require('supertest');
} catch (e) {
  request = null;
}

const mongoose = require('mongoose');
const { app } = require('../server');

const TEST_DB = process.env.TEST_DB_URL;

if (!request || !TEST_DB) {
  describe.skip('E2E flow (requires supertest and TEST_DB_URL)', () => {
    test('skipped because prerequisites are missing', () => { expect(true).toBe(true); });
  });
} else {
  describe('E2E login -> daily rush -> finish -> wallet', () => {
    let server;
    beforeAll(async () => {
      await mongoose.connect(TEST_DB, { useNewUrlParser: true, useUnifiedTopology: true });
      server = app.listen(0);
    }, 20000);

    afterAll(async () => {
      await mongoose.connection.dropDatabase();
      await mongoose.disconnect();
      server.close();
    });

    test('full flow', async () => {
      const email = `test${Date.now()}@test.com`;
      const loginRes = await request(server).post('/api/auth/login').send({ email, name: 'tester' });
      expect(loginRes.statusCode).toBe(200);
      const user = loginRes.body.user;
      expect(user).toHaveProperty('_id');

      const startRes = await request(server).post('/api/game/daily-rush/start').send({ userId: user._id });
      expect([200,201,204].includes(startRes.statusCode)).toBeTruthy();
      const questions = startRes.body.questions || [];

      const answers = questions.slice(0, 3).map(q => ({ questionId: q.id, selectedOption: 0, timeRemaining: 5 }));
      const finishRes = await request(server).post('/api/game/daily-rush/finish').send({ userId: user._id, answers });
      expect(finishRes.statusCode).toBe(200);
      expect(finishRes.body).toHaveProperty('tokensEarned');

      const walletRes = await request(server).get(`/api/user/wallet?userId=${user._id}`);
      expect(walletRes.statusCode).toBe(200);
      expect(walletRes.body).toHaveProperty('totalTokens');
    }, 20000);
  });
}
