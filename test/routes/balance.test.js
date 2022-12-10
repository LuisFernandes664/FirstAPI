const request = require('supertest');
const moment = require('moment');
const jwt = require('jwt-simple');
const app = require('../../src/app');

const MAIN_ROUTE = '/v1/balance';
const ROUTE_TRANSACTION = '/v1/transactions';
const ROUTE_TRANSFER = '/v1/transfers';
const secret = 'ipca!DWM@202122';
const userA = { id: 10100, name: 'User IPCA #3', email: 'user3@ipca.pt' };
const TOKEN = jwt.encode(userA, secret);

const userC = { id: 10103, name: 'User IPCA #5', email: 'user5@ipca.pt' };
const TOKEN_C = jwt.encode(userC, secret);

beforeAll(() => {
  return app.db.seed.run();
});

describe('Test #1 - calcular saldo ...', () => {
  test('Test #1.1 - Retornar as contas com transações', () => {
    return request(app).get(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(0);
      });
  });
  test('Test #1.2 - Adicionar os valores de entrada', () => {
    return request(app).post(ROUTE_TRANSACTION)
      .send({
        desc: 'B.T1', date: new Date(), ammount: 100, type: 'I', acc_id: 10100, status: true,
      })
      .set('authorization', `bearer ${TOKEN}`)
      .then(() => {
        return request(app).get(MAIN_ROUTE)
          .set('authorization', `bearer ${TOKEN}`)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].id).toBe(10100);
            expect(res.body[0].sum).toBe('100.00');
          });
      });
  });
  test('Test #1.2 - Subtrair os valores de saída', () => {
    return request(app).post(ROUTE_TRANSACTION)
      .send({
        desc: 'B.T1', date: new Date(), ammount: 200, type: 'O', acc_id: 10100, status: true,
      })
      .set('authorization', `bearer ${TOKEN}`)
      .then(() => {
        return request(app).get(MAIN_ROUTE)
          .set('authorization', `bearer ${TOKEN}`)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].id).toBe(10100);
            expect(res.body[0].sum).toBe('-100.00');
          });
      });
  });
  test('Test #1.3 - Não considerar a transações pendentes', () => {
    return request(app).post(ROUTE_TRANSACTION)
      .send({
        desc: 'B.T1', date: new Date(), ammount: 200, type: 'O', acc_id: 10100, status: false,
      })
      .set('authorization', `bearer ${TOKEN}`)
      .then(() => {
        return request(app).get(MAIN_ROUTE)
          .set('authorization', `bearer ${TOKEN}`)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].id).toBe(10100);
            expect(res.body[0].sum).toBe('-100.00');
          });
      });
  });
  test('Test #1.3 - Não considerar o saldo de contas distintas', () => {
    return request(app).post(ROUTE_TRANSACTION)
      .send({
        desc: 'B.T1', date: new Date(), ammount: 50, type: 'I', acc_id: 10101, status: true,
      })
      .set('authorization', `bearer ${TOKEN}`)
      .then(() => {
        return request(app).get(MAIN_ROUTE)
          .set('authorization', `bearer ${TOKEN}`)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(res.body[0].id).toBe(10100);
            expect(res.body[0].sum).toBe('-100.00');
            expect(res.body[1].id).toBe(10101);
            expect(res.body[1].sum).toBe('50.00');
          });
      });
  });
  test('Test #1.4 - Não considerar contas de outros utilizadores', () => {
    return request(app).post(ROUTE_TRANSACTION)
      .send({
        desc: 'B.T1', date: new Date(), ammount: 200, type: 'O', acc_id: 10102, status: true,
      })
      .set('authorization', `bearer ${TOKEN}`)
      .then(() => {
        return request(app).get(MAIN_ROUTE)
          .set('authorization', `bearer ${TOKEN}`)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(res.body[0].id).toBe(10100);
            expect(res.body[0].sum).toBe('-100.00');
            expect(res.body[1].id).toBe(10101);
            expect(res.body[1].sum).toBe('50.00');
          });
      });
  });
  test('Test #1.5 - Considerar transações do passado', () => {
    return request(app).post(ROUTE_TRANSACTION)
      .send({
        desc: 'B.T1', date: moment().subtract({ days: 5 }), ammount: 250, type: 'I', acc_id: 10100, status: true,
      })
      .set('authorization', `bearer ${TOKEN}`)
      .then(() => {
        return request(app).get(MAIN_ROUTE)
          .set('authorization', `bearer ${TOKEN}`)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(res.body[0].id).toBe(10100);
            expect(res.body[0].sum).toBe('150.00');
            expect(res.body[1].id).toBe(10101);
            expect(res.body[1].sum).toBe('50.00');
          });
      });
  });
  test('Test #1.6 - Não considerar transações do futuro', () => {
    return request(app).post(ROUTE_TRANSACTION)
      .send({
        desc: 'B.T1', date: moment().add({ days: 5 }), ammount: 250, type: 'I', acc_id: 10100, status: true,
      })
      .set('authorization', `bearer ${TOKEN}`)
      .then(() => {
        return request(app).get(MAIN_ROUTE)
          .set('authorization', `bearer ${TOKEN}`)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(res.body[0].id).toBe(10100);
            expect(res.body[0].sum).toBe('150.00');
            expect(res.body[1].id).toBe(10101);
            expect(res.body[1].sum).toBe('50.00');
          });
      });
  });
  test('Test #1.7 - Considerar transferências', () => {
    return request(app).post(ROUTE_TRANSFER)
      .send({
        desc: 'B.T1', acc_ori_id: 10100, acc_dest_id: 10101, ammount: 250, date: new Date(),
      })
      .set('authorization', `bearer ${TOKEN}`)
      .then(() => {
        return request(app).get(MAIN_ROUTE)
          .set('authorization', `bearer ${TOKEN}`)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(res.body[0].id).toBe(10100);
            expect(res.body[0].sum).toBe('-100.00');
            expect(res.body[1].id).toBe(10101);
            expect(res.body[1].sum).toBe('300.00');
          });
      });
  });
  test('Test #1.8 - Calcular o saldo das contas do utilizador', () => {
    return request(app).get(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN_C}`)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
        expect(res.body[0].id).toBe(10104);
        expect(res.body[0].sum).toBe('162.00');
        expect(res.body[1].id).toBe(10105);
        expect(res.body[1].sum).toBe('-248.00');
      });
  });
});
