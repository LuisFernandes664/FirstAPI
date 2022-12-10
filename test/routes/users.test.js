const jwt = require('jwt-simple');
const request = require('supertest');

const app = require('../../src/app');

const mail = `${Date.now()}@ipca.pt`;
const MAIN_ROUTE = '/v1/users';
const secret = 'ipca!DWM@202122';
let user;

beforeAll(async () => {
  const umail = `${Date.now()}@ipca.pt`;
  const res = await app.services.user.save({ name: 'Luis Fernandes', email: umail, password: '12345' });
  user = { ...res[0] };
  user.token = jwt.encode(user, secret);
});

test('Teste #1 - Listar utilizadores', () => {
  return request(app).get(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
});

test('Teste #21.1 - Listar utilizadores erros', async () => {
  await app.db('users').where({ email: 'dummy@ipca.pt' }).del();
  return app.db('users')
    .insert({ name: 'User Dummy', email: 'dummy@ipca.pt', password: '123abc' })
    .then(() => request(app).get(MAIN_ROUTE)
      .set('authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(400);
    });
});

test('Teste #2 - Inserir utilizadores', async () => {
  await app.db('users').where({ email: 'dummy@ipca.pt' }).del();
  return request(app).post(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .send({ name: 'Luis Miguel', email: mail, password: '123456' })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Luis Miguel');
      expect(res.body).not.toHaveProperty('password');
    });
});

test('Teste #2.1 - Guardar password encriptada', async () => {
  const res = await request(app).post(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .send({ name: 'Luis Pass Encriptada', email: `${Date.now()}@ipca.pt`, password: '12345' });
  expect(res.status).toBe(201);

  const { id } = res.body;
  const userDb = await app.services.user.findOne({ id });
  expect(userDb.password).not.toBeUndefined();
  expect(userDb.password).not.toBe('12345');
});

test('Teste #3 - Inserir utilizador sem nome', () => {
  return request(app).post(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .send({ email: mail, password: '123456' })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('O nome é um atributo obrigatório');
    });
});

test('Teste #4 - Inserir utilizador sem email', () => {
  return request(app).post(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .send({ name: 'Luis Miguel', password: '123456' })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('O email é um atributo obrigatório');
    });
});

test('Teste #5 - Inserir utilizador sem password', (done) => {
  request(app).post(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .send({ name: 'Luis Miguel', email: mail })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('A password é um atributo obrigatório');
      done();
    });
});

test('Teste #6 - Inserir utilizador com email duplicado', () => {
  return request(app).post(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .send({ name: 'Luis Miguel', email: mail, password: '123456' })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Email duplicado na BD');
    });
});
