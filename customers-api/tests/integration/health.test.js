const request = require('supertest');
const { app } = require('../../src/index');

describe('GET /health', () => {
  it('returns health payload', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.service).toBe('customers-api');
    expect(response.body.timestamp).toBeTruthy();
  });
});
