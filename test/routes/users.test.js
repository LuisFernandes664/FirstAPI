const request = require('supertest');

const app = require('../../src/app');

const mail = `${Date.now()}@wave.pt`;

test('Teste #1 - Listar utilizadores', () => {
  return request(app).get('/users')
    .then((res) => {
      expect(res.status).toBe(200);
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

test('Teste #3 - Inserir utilizador sem nome', () => {
  return request(app).post('/users')
    .send({ email: mail, password: '1234' })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Nome é um atributo obrigatório');
    });
});

test('Teste #4 - Inserir utilizador sem email', async () => {
  const result = await request(app).post('/users')
    .send({ name: 'Luis Miguel', password: '1234' });
  expect(result.status).toBe(400);
  expect(result.body.error).toBe('O email é um atributo obrigatório');
});

test('Teste #5 - Inserir utilizador sem password', (done) => {
  request(app).post('/users')
    .send({ name: 'Luis Miguel', email: mail })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('A password é um atributo obrigatório');
      done();
    });
});

test('Teste #6 - Inserir utilizadores com email duplicado', () => {
  return request(app).post('/users')
    .send({ name: 'Luis Miguel', email: mail, password: '1234' })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Email duplicado na BD');
    });
});
