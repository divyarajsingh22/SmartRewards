let request;
try {
  request = require('supertest');
} catch (e) {
  request = null;
}

const { app } = require('../server');

if (!request) {
  describe.skip('Daily Rush endpoints (supertest not installed)', () => {
    test('skipped because supertest is not installed', () => {
      expect(true).toBe(true);
    });
  });
} else {
  describe('Daily Rush endpoints', () => {
    test('POST /api/game/daily-rush/start without userId returns 400', async () => {
      const res = await request(app).post('/api/game/daily-rush/start').send({});
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    test('POST /api/game/daily-rush/finish without userId returns 400', async () => {
      const res = await request(app).post('/api/game/daily-rush/finish').send({ answers: [] });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    test('POST /api/game/daily-rush/finish with userId but invalid answers returns 400', async () => {
      const res = await request(app).post('/api/game/daily-rush/finish').send({ userId: '507f1f77bcf86cd799439011', answers: 'not-an-array' });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });
}
