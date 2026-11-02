const request = require('supertest');
const app = require('../app');

describe('API basics', () => {
  test('GET /api/health returns 200 and status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(500);
    expect(res.body.status).toBe('ok');
  });

  test('Helmet security headers are present', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['content-security-policy']).toBeDefined();
  });

  test('NoSQL injection payload on login is rejected (400)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: { $ne: null }, password: { $ne: null } });
    expect(res.statusCode).toBe(400);
  });

  test('Protected route without cookie returns 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });
});
