const request = require('supertest');
const jwt = require('jwt-simple');
const app = require('../../src/app');

const MAIN_ROUTE = '/v1/transactions';
let userA;
let userB;
let accUserA;
let accUserB;
const secret = 'ipca!DWM@202122';

beforeAll(async () => {
  await app.db('transactions').del();
  await app.db('transfers').del();
  await app.db('accounts').del();
  await app.db('users').del();

  const users = await app.db('users').insert([
    { name: 'User Transactions #1', email: 'user1@ipca.pt', password: '$2a$10$jyDVciONNE1TpoVqQDxJ1urBkv1I1ZYE6FWdlbYy8OZjjD/8o/Uk2' },
    { name: 'User Transactions #2', email: 'user2@ipca.pt', password: '$2a$10$jyDVciONNE1TpoVqQDxJ1urBkv1I1ZYE6FWdlbYy8OZjjD/8o/Uk2' },
  ], '*');

  [userA, userB] = users;
  delete userA.secret;
  userA.token = jwt.encode(userA, secret);

  const userAccs = await app.db('accounts').insert([
    { name: 'User Acc #1', user_id: userA.id },
    { name: 'User Acc #2', user_id: userB.id },
  ], '*');

  [accUserA, accUserB] = userAccs;
});

test('Test #1 - Listar as transações do utilizador', () => {
  return app.db('transactions').insert([
    {
      desc: 'T1', date: new Date(), ammount: 100, type: 'I', acc_id: accUserA.id,
    },
    {
      desc: 'T2', date: new Date(), ammount: 300, type: 'O', acc_id: accUserB.id,
    },
  ]).then(() => request(app).get(MAIN_ROUTE)
    .set('authorization', `bearer ${userA.token}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].desc).toBe('T1');
    }));
});

test('Test #2 - Inserir as transações do utilizador', () => {
  return request(app).post(MAIN_ROUTE)
    .set('authorization', `bearer ${userA.token}`)
    .send({
      desc: 'New Trans', date: new Date(), ammount: 150, type: 'I', acc_id: accUserA.id,
    })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.acc_id).toBe(accUserA.id);
    });
});

test('Test #3 - Listar as transação por ID', () => {
  return app.db('transactions').insert({
    desc: 'Trans ID', date: new Date(), ammount: 175, type: 'I', acc_id: accUserA.id,
  }, ['id']).then((trans) => request(app).get(`${MAIN_ROUTE}/${trans[0].id}`)
    .set('authorization', `bearer ${userA.token}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(trans[0].id);
      expect(res.body.desc).toBe('Trans ID');
    }));
});

test('Test #4 - Atualizar uma transação', () => {
  return app.db('transactions').insert({
    desc: 'Trans To Updade', date: new Date(), ammount: 180, type: 'I', acc_id: accUserA.id,
  }, ['id']).then((trans) => request(app).put(`${MAIN_ROUTE}/${trans[0].id}`)
    .set('authorization', `bearer ${userA.token}`)
    .send({ desc: 'Trans Updated' })
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.desc).toBe('Trans Updated');
    }));
});

test('Test #5 - Remover uma transação', () => {
  return app.db('transactions').insert({
    desc: 'Trans To Delete', date: new Date(), ammount: 175, type: 'I', acc_id: accUserA.id,
  }, ['id']).then((trans) => request(app).delete(`${MAIN_ROUTE}/${trans[0].id}`)
    .set('authorization', `bearer ${userA.token}`)
    .then((res) => {
      expect(res.status).toBe(204);
    }));
});

test('Test #6 - Aceder a transação de outro utilizador', () => {
  return app.db('transactions').insert({
    desc: 'Trans To Delete', date: new Date(), ammount: 175, type: 'I', acc_id: accUserB.id,
  }, ['id']).then((trans) => request(app).delete(`${MAIN_ROUTE}/${trans[0].id}`)
    .set('authorization', `bearer ${userA.token}`)
    .then((res) => {
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Não tem acesso ao recurso solicitado');
    }));
});

test('Test #7 - Transações de entrada devem ser positivas', () => {
  return request(app).post(MAIN_ROUTE)
    .set('authorization', `bearer ${userA.token}`)
    .send({
      desc: 'Trans Enter', date: new Date(), ammount: -150, type: 'I', acc_id: accUserA.id,
    })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.acc_id).toBe(accUserA.id);
      expect(res.body.ammount).toBe('150.00');
    });
});

test('Test #8 - Transações de saída devem ser negativas', () => {
  return request(app).post(MAIN_ROUTE)
    .set('authorization', `bearer ${userA.token}`)
    .send({
      desc: 'Trans Enter', date: new Date(), ammount: 150, type: 'O', acc_id: accUserA.id,
    })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.acc_id).toBe(accUserA.id);
      expect(res.body.ammount).toBe('-150.00');
    });
});

describe('Validação de criar uma transação', () => {
  const testTemplate = (newData, errorMessage) => {
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${userA.token}`)
      .send({
        desc: 'New Trans', date: new Date(), ammount: 150, type: 'I', acc_id: accUserA.id, ...newData,
      })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      });
  };

  test('Test #9.1 - Sem descrição', () => testTemplate({ desc: null }, 'A DESCRIÇÃO é um atributo obrigatório'));
  test('Test #9.2 - Sem valor', () => testTemplate({ ammount: null }, 'O VALOR é um atributo obrigatório'));
  test('Test #9.3 - Sem data', () => testTemplate({ date: null }, 'A DATA é um atributo obrigatório'));
  test('Test #9.4 - Sem conta', () => testTemplate({ acc_id: null }, 'A CONTA é um atributo obrigatório'));
  test('Test #9.5 - Sem tipo', () => testTemplate({ type: null }, 'O TIPO é um atributo obrigatório'));
  test('Test #9.6 - Com tipo errado', () => testTemplate({ type: 'P' }, 'O TIPO tem um valor inválido'));
});

test('Test #10 - Remover conta com transação', () => {
  return app.db('transactions').insert({
    desc: 'Trans To Delete', date: new Date(), ammount: 175, type: 'I', acc_id: accUserA.id,
  }, ['id']).then(() => request(app).delete(`/v1/accounts/${accUserA.id}`)
    .set('authorization', `bearer ${userA.token}`)
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('A CONTA tem transções associadas');
    }));
});
