const request = require('supertest');

const app = require('../../src/app');

const mail = `${Date.now()}@wave.pt`;

test('Teste #1 - Listar utilizadores', () => {
  return request(app).get('/users')
    .then((res) => {
      expect(res.status).toBe(200);
      // expect(res.body.Length).toLength(0);
      expect(res.body.length).toBeGreaterThan(0);
    });
});

test('Teste #2 - Inserir utilizadores', () => {
  return request(app).post('/users')
    .send({ name: 'Luis Miguel', email: mail, password: '1234' })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Luis Miguel');
    });
});
