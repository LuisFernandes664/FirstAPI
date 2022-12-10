const request = require('supertest');
const jwt = require('jwt-simple');
const app = require('../../src/app');

const MAIN_ROUTE = '/v1/transfers';
const secret = 'ipca!DWM@202122';
const userA = { id: 10000, name: 'User IPCA #1', email: 'user1@ipca.pt' };
const TOKEN = jwt.encode(userA, secret);

beforeAll(() => {
  return app.db.seed.run();
});

test('Test #1 - Listar as transferências apenas do utilizador', () => {
  return request(app).get(MAIN_ROUTE)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].desc).toBe('Transfer #1');
    });
});

test('Test #2 - Inserir transferência do utilizador', () => {
  return request(app).post(MAIN_ROUTE)
    .set('authorization', `bearer ${TOKEN}`)
    .send({
      desc: 'Regular Transfer', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, ammount: 102, date: new Date(),
    })
    .then(async (res) => {
      expect(res.status).toBe(201);
      expect(res.body.desc).toBe('Regular Transfer');

      const transactions = await app.db('transactions').where({ transfer_id: res.body.id });
      expect(transactions).toHaveLength(2);
      expect(transactions[0].desc).toBe('Transfer to acc #10001');
      expect(transactions[1].desc).toBe('Transfer from acc #10000');
      expect(transactions[0].ammount).toBe('-102.00');
      expect(transactions[1].ammount).toBe('102.00');
      expect(transactions[0].acc_id).toBe(10000);
      expect(transactions[1].acc_id).toBe(10001);
    });
});

describe('Test #3 - transferência válida ...', () => {
  let transferId;
  let income;
  let outcome;

  test('Test #3.1 - Retornar o código 201', () => {
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send({
        desc: 'Regular Transfer', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, ammount: 102, date: new Date(),
      })
      .then((res) => {
        expect(res.status).toBe(201);
        expect(res.body.desc).toBe('Regular Transfer');
        transferId = res.body.id;
      });
  });

  test('Test #3.2 - Gerar transações', async () => {
    const transactions = await app.db('transactions').where({ transfer_id: transferId }).orderBy('ammount');
    expect(transactions).toHaveLength(2);
    [outcome, income] = transactions;
  });

  test('Test #3.3 - Transação de saída negativa', () => {
    expect(outcome.desc).toBe('Transfer to acc #10001');
    expect(outcome.ammount).toBe('-102.00');
    expect(outcome.acc_id).toBe(10000);
    expect(outcome.type).toBe('O');
  });

  test('Test #3.4 - Transação de entrada positiva', () => {
    expect(income.desc).toBe('Transfer from acc #10000');
    expect(income.ammount).toBe('102.00');
    expect(income.acc_id).toBe(10001);
    expect(income.type).toBe('I');
  });

  test('Test #3.5 - Transações com a mesma referência', () => {
    expect(income.transfer_id).toBe(transferId);
    expect(outcome.transfer_id).toBe(transferId);
  });
});

describe('Test #4 - transferência inválida ...', () => {
  const testTemplate = (newData, errorMessage) => {
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send({
        desc: 'Regular Transfer', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, ammount: 102, date: new Date(), ...newData,
      })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      });
  };

  test('Test #4.1 - Inserir sem descrição', () => testTemplate({ desc: null }, 'A DESCRIÇÃO é um atributo obrigatório'));
  test('Test #4.2 - Inserir sem valor', () => testTemplate({ ammount: null }, 'O VALOR é um atributo obrigatório'));
  test('Test #4.3 - Inserir sem data', () => testTemplate({ date: null }, 'A DATA é um atributo obrigatório'));
  test('Test #4.4 - Inserir sem conta de origem', () => testTemplate({ acc_ori_id: null }, 'A CONTA de ORIGEM é um atributo obrigatório'));
  test('Test #4.5 - Inserir sem conta de destino', () => testTemplate({ acc_dest_id: null }, 'A CONTA de DESTINO é um atributo obrigatório'));
  test('Test #4.6 - Conta de origem e destino são iguais', () => testTemplate({ acc_dest_id: 10000 }, 'As CONTAS ORIGEM e DESTINO têm de ser diferentes'));
  test('Test #4.7.1 - Se as contas forem de outro utilizador', () => testTemplate({ acc_ori_id: 10002 }, 'A CONTA de ORIGEM ou DESTINO não pertence ao utilizador'));
  test('Test #4.7.2 - Se as contas forem de outro utilizador', () => testTemplate({ acc_dest_id: 10003 }, 'A CONTA de ORIGEM ou DESTINO não pertence ao utilizador'));
});

test('Test #5 - Obter transferência por ID', () => {
  return request(app).get(`${MAIN_ROUTE}/10000`)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.desc).toBe('Transfer #1');
    });
});

describe('Test #6 - alterar transferência válida ...', () => {
  let transferId;
  let income;
  let outcome;

  test('Test #6.1 - Retornar o código 200', () => {
    return request(app).put(`${MAIN_ROUTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({
        desc: 'Regular Transfer Updated', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, ammount: 900, date: new Date(),
      })
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.desc).toBe('Regular Transfer Updated');
        expect(res.body.ammount).toBe('900.00');
        transferId = res.body.id;
      });
  });

  test('Test #6.2 - Gerar transações', async () => {
    const transactions = await app.db('transactions').where({ transfer_id: transferId }).orderBy('ammount');
    expect(transactions).toHaveLength(2);
    [outcome, income] = transactions;
  });

  test('Test #6.3 - Transação de saída negativa', () => {
    expect(outcome.desc).toBe('Transfer to acc #10001');
    expect(outcome.ammount).toBe('-900.00');
    expect(outcome.acc_id).toBe(10000);
    expect(outcome.type).toBe('O');
  });

  test('Test #6.4 - Transação de entrada positiva', () => {
    expect(income.desc).toBe('Transfer from acc #10000');
    expect(income.ammount).toBe('900.00');
    expect(income.acc_id).toBe(10001);
    expect(income.type).toBe('I');
  });

  test('Test #6.5 - Transações com a mesma referência', () => {
    expect(income.transfer_id).toBe(transferId);
    expect(outcome.transfer_id).toBe(transferId);
  });

  test('Test #6.6 - Transações com status true', () => {
    expect(income.status).toBe(true);
    expect(outcome.status).toBe(true);
  });
});

describe('Test #7 - alterar transferência inválida ...', () => {
  const testTemplate = (newData, errorMessage) => {
    return request(app).put(`${MAIN_ROUTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({
        desc: 'Regular Transfer', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, ammount: 102, date: new Date(), ...newData,
      })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      });
  };

  test('Test #7.1 - Alterar sem descrição', () => testTemplate({ desc: null }, 'A DESCRIÇÃO é um atributo obrigatório'));
  test('Test #7.2 - Alterar sem valor', () => testTemplate({ ammount: null }, 'O VALOR é um atributo obrigatório'));
  test('Test #7.3 - Alterar sem data', () => testTemplate({ date: null }, 'A DATA é um atributo obrigatório'));
  test('Test #7.4 - Alterar sem conta de origem', () => testTemplate({ acc_ori_id: null }, 'A CONTA de ORIGEM é um atributo obrigatório'));
  test('Test #7.5 - Alterar sem conta de destino', () => testTemplate({ acc_dest_id: null }, 'A CONTA de DESTINO é um atributo obrigatório'));
  test('Test #7.6 - Conta de origem e destino são iguais', () => testTemplate({ acc_dest_id: 10000 }, 'As CONTAS ORIGEM e DESTINO têm de ser diferentes'));
  test('Test #7.7.1 - Se as contas forem de outro utilizador', () => testTemplate({ acc_ori_id: 10002 }, 'A CONTA de ORIGEM ou DESTINO não pertence ao utilizador'));
  test('Test #7.7.2 - Se as contas forem de outro utilizador', () => testTemplate({ acc_dest_id: 10003 }, 'A CONTA de ORIGEM ou DESTINO não pertence ao utilizador'));
});

describe('Test #8 - remover uma transferência ...', () => {
  test('Test #8.1 - Retornar o código 204', () => {
    return request(app).delete(`${MAIN_ROUTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(204);
      });
  });

  test('Test #8.2 - Registo removido da BD', () => {
    return app.db('transfers').where({ id: 10000 })
      .then((result) => {
        expect(result).toHaveLength(0);
      });
  });

  test('Test #8.3 - Remover transações associadas', () => {
    return app.db('transactions').where({ transfer_id: 10000 })
      .then((result) => {
        expect(result).toHaveLength(0);
      });
  });
});

test('Test #9 - Proteger recursos do utilizador', () => {
  return request(app).get(`${MAIN_ROUTE}/10001`)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Não tem acesso ao recurso solicitado');
    });
});
