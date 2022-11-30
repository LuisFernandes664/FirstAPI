const request = require('supertest');
const jwt = require('jwt-simple');

const app = require('../../src/app');

const mail = `${Date.now()}@wave.pt`;
const secret = 'ipca!DWM@202122';
let user;

beforeAll(async () => {
  const res = await app.services.user.save({ name: 'Luis Fernandes', email: mail, password: '12345' });
  user = { ...res[0] };
  user.token = jwt.encode(user, secret);
});

test('Teste #1 - Listar utilizadores', () => {
  return request(app).get('/users')
    .set('authorization', `bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
});

test('Teste #2 - Inserir utilizadores', () => {
  return request(app).post('/users')
    .set('authorization', `bearer ${user.token}`)
    .send({ name: 'Luis Miguel', email: `${Date.now()}@ipca.pt`, password: '1234' })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Luis Miguel');
      expect(res.body).not.toHaveProperty('password');
    });
});

test('Teste #2.1 - Guardar password encriptada', async () => {
  const res = await request(app).post('/users')
    .set('authorization', `bearer ${user.token}`)
    .send({ name: 'Luis Miguel', email: `${Date.now()}@wave.pt`, password: '1234' });
  expect(res.status).toBe(201);

  const { id } = res.body;
  const userDB = await app.services.user.findOne({ id });
  expect(userDB.password).not.toBeUndefined();
  expect(userDB.password).not.toBe('1234');
});

test('Teste #3 - Inserir utilizador sem nome', () => {
  return request(app).post('/users')
    .set('authorization', `bearer ${user.token}`)
    .send({ email: mail, password: '1234' })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Nome é um atributo obrigatório');
    });
});

test('Teste #4 - Inserir utilizador sem email', async () => {
  const result = await request(app).post('/users')
    .set('authorization', `bearer ${user.token}`)
    .send({ name: 'Luis Miguel', password: '1234' });
  expect(result.status).toBe(400);
  expect(result.body.error).toBe('O email é um atributo obrigatório');
});

test('Teste #5 - Inserir utilizador sem password', (done) => {
  request(app).post('/users')
    .set('authorization', `bearer ${user.token}`)
    .send({ name: 'Luis Miguel', email: mail })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('A password é um atributo obrigatório');
      done();
    });
});

test('Teste #6 - Inserir utilizadores com email duplicado', () => {
  return request(app).post('/users')
    .set('authorization', `bearer ${user.token}`)
    .send({ name: 'Luis Miguel', email: mail, password: '1234' })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Email duplicado na BD');
    });
});
