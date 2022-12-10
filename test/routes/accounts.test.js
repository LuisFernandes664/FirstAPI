const jwt = require('jwt-simple');
const request = require('supertest');

const app = require('../../src/app');

const MAIN_ROUTE = '/v1/accounts';
let user;
let user2;
// const mail = `${Date.now()}@ipca.pt`;
const secret = 'ipca!DWM@202122';

beforeAll(async () => {
  const res = await app.services.user.save({ name: 'Luis Fernandes', email: `${Date.now()}@ipca.pt`, password: '12345' });
  user = { ...res[0] };
  user.token = jwt.encode(user, secret);
  const res2 = await app.services.user.save({ name: 'Luis Fernandes', email: `${Date.now()}@ipca.pt`, password: '123456' });
  user2 = { ...res2[0] };
});

test('Teste #1 - Inserir contas', async () => {
  await app.db('transactions').del();
  await app.db('transfers').del();
  await app.db('accounts').del();
  return request(app).post(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .send({ name: 'Account #1' })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Account #1');
    });
});

test('Teste #2 - Listar contas', () => {
  return app.db('accounts')
    .insert({ name: 'Account list', user_id: user.id })
    .then(() => request(app).get(MAIN_ROUTE)
      .set('authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
});

test('Teste #3 - Listar contas por ID', () => {
  return app.db('accounts')
    .insert({ name: 'Account by id #1', user_id: user.id }, ['id'])
    .then((acc) => request(app).get(`${MAIN_ROUTE}/${acc[0].id}`)
      .set('authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Account by id #1');
      expect(res.body.user_id).toBe(user.id);
    });
});

test('Teste #4 - Alterar uma conta', () => {
  return app.db('accounts')
    .insert({ name: 'Account no update #1', user_id: user.id }, ['id'])
    .then((acc) => request(app).put(`${MAIN_ROUTE}/${acc[0].id}`)
      .set('authorization', `bearer ${user.token}`)
      .send({ name: 'Account updated #1' }))
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Account updated #1');
    });
});

test('Teste #5 - Remover uma conta', () => {
  return app.db('accounts')
    .insert({ name: 'Account no remove #1', user_id: user.id }, ['id'])
    .then((acc) => request(app).delete(`${MAIN_ROUTE}/${acc[0].id}`)
      .set('authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(204);
    });
});

test('Teste #8 - Listar apenas contas do utilizador', async () => {
  await app.db('transactions').del();
  await app.db('transfers').del();
  await app.db('accounts').del();
  return app.db('accounts')
    .insert([
      { name: 'Account User 1 #1', user_id: user.id },
      { name: 'Account User 2 #1', user_id: user2.id },
    ]).then(() => request(app).get(MAIN_ROUTE)
      .set('authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe('Account User 1 #1');
    });
});

test('Test #19 - Inserir nome de conta duplicado', () => {
  return app.db('accounts')
    .insert({ name: 'Account Dup', user_id: user.id })
    .then(() => request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${user.token}`)
      .send({ name: 'Account Dup' }))
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Já existe uma conta com o nome indicado');
    });
});

test('Test #20 - Aceder a conta de outro utilizador', () => {
  return app.db('accounts')
    .insert({ name: 'Account U#2', user_id: user2.id }, ['id'])
    .then((acc) => request(app).get(`${MAIN_ROUTE}/${acc[0].id}`)
      .set('authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Não tem acesso ao recurso solicitado');
    });
});

test('Test #21 - Alterar a conta de outro utilizador', () => {
  return app.db('accounts')
    .insert({ name: 'Account U#2', user_id: user2.id }, ['id'])
    .then((acc) => request(app).put(`${MAIN_ROUTE}/${acc[0].id}`)
      .set('authorization', `bearer ${user.token}`)
      .send({ name: 'Account Change' }))
    .then((res) => {
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Não tem acesso ao recurso solicitado');
    });
});

test('Test #22 - Remover a conta de outro utilizador', () => {
  return app.db('accounts')
    .insert({ name: 'Account U#2', user_id: user2.id }, ['id'])
    .then((acc) => request(app).delete(`${MAIN_ROUTE}/${acc[0].id}`)
      .set('authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Não tem acesso ao recurso solicitado');
    });
});
