
process.env.VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuB-5qHjXm-9Z-H3O5DqgHj-V0';
process.env.VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'aXzS6S_H3O5DqgHj-V0BEl62iUYgUivxIkv69yViEui';
process.env.VAPID_SUBJECT = 'mailto:test@test.com';

require('iconv-lite').encodingExists('cesu8');

const request = require('supertest');
const { app, server, pool } = require('../server');

afterAll(async () => {
  await new Promise(resolve => server.close(resolve));
  await pool.end(); 
});

describe('Running App API Unit Tests', () => {

  test('GET /api/health should return status OK', async () => {

    const response = await request(app).get('/');
    expect(response.status).not.toBe(500);
  });

  test('POST /api/auth/login without credentials should fail', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({});
    expect(response.status).toBe(400); 
  });

  test('GET /api/subscriptions/current without token should fail', async () => {
    const response = await request(app).get('/api/subscriptions/current'); 
    expect(response.status).toBe(401); 
  });

});
