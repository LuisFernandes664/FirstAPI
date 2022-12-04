const request = require('supertest');
const jwt = require('jwt-simple');

const app = require('../../src/app');

const MAIN_ROUTE = '/accounts';
const secret = 'ipca!DWM@202122';
let user;
const mail = `${Date.now()}@ipca.pt`;

beforeAll(async () => {
  const res = await app.services.user.save({ name: 'Luis Fernandes', email: mail, password: '1234' });
  user = { ...res[0] };
  user.token = jwt.encode(user, secret);
});

test('Test #7 - Inserir contas', () => {
  return request(app).post(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .send({ name: 'Account #1', user_id: user.id })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Account #1');
    });
});

test('Test #8 - Listar contas', () => {
  return app.db('accounts')
    .insert({ name: 'Account list', user_id: user.id })
    .then(() => request(app).get(MAIN_ROUTE)
      .set('authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
});

test('Test #9 - Listar conta por ID', () => {
  return app.db('accounts')
    .insert({ name: 'Account by ID', user_id: user.id }, ['id'])
    .then((acc) => request(app).get(`${MAIN_ROUTE}/${acc[0].id}`)
      .set('authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Account by ID');
      expect(res.body.user_id).toBe(user.id);
    });
});

test('Test #10 - Alterar uma conta', () => {
  return app.db('accounts')
    .insert({ name: 'Account - Update', user_id: user.id }, ['id'])
    .then((acc) => request(app).put(`${MAIN_ROUTE}/${acc[0].id}`)
      .set('authorization', `bearer ${user.token}`)
      .send({ name: 'Account updated' }))
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Account updated');
    });
});

test('Test #11 - Remover conta', () => {
  return app.db('accounts')
    .insert({ name: 'Account - Remove', user_id: user.id }, ['id'])
    .then((acc) => request(app).delete(`${MAIN_ROUTE}/${acc[0].id}`)
      .set('authorization', `bearer ${user.token}`)
      .send({ name: 'Account updated' }))
    .then((res) => {
      expect(res.status).toBe(204);
    });
});

test('Test #12 - Inserir conta sem nome', () => {
  return request(app).post(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .send({ user_id: user.id })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Nome é um atributo obrigatório');
    });
});
