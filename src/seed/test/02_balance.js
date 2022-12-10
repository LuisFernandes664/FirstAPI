const moment = require('moment');

exports.seed = (knex) => {
  return knex('users').del().insert([
    {
      id: 10100, name: 'User IPCA #3', email: 'user3@ipca.pt', password: '$2a$10$jyDVciONNE1TpoVqQDxJ1urBkv1I1ZYE6FWdlbYy8OZjjD/8o/Uk2',
    },
    {
      id: 10101, name: 'User IPCA #4', email: 'user4@ipca.pt', password: '$2a$10$jyDVciONNE1TpoVqQDxJ1urBkv1I1ZYE6FWdlbYy8OZjjD/8o/Uk2',
    },
    {
      id: 10103, name: 'User IPCA #5', email: 'user5@ipca.pt', password: '$2a$10$jyDVciONNE1TpoVqQDxJ1urBkv1I1ZYE6FWdlbYy8OZjjD/8o/Uk2',
    },
  ])
    .then(() => knex('accounts').insert([
      { id: 10100, name: 'Acc Saldo Principal', user_id: 10100 },
      { id: 10101, name: 'Acc Saldo Secundário', user_id: 10100 },
      { id: 10102, name: 'Acc Saldo Alt #1', user_id: 10101 },
      { id: 10103, name: 'Acc Saldo Alt #2', user_id: 10101 },
      { id: 10104, name: 'Acc IPVC #5.1', user_id: 10103 },
      { id: 10105, name: 'Acc IPVC #5.2', user_id: 10103 },
    ]))
    .then(() => knex('transfers').insert([
      {
        id: 10100, desc: 'Transfer B #1', user_id: 10103, acc_ori_id: 10105, acc_dest_id: 10104, ammount: 256, date: new Date(),
      },
      {
        id: 10101, desc: 'Transfer B #2', user_id: 10101, acc_ori_id: 10102, acc_dest_id: 10103, ammount: 512, date: new Date(),
      },
    ]))
    .then(() => knex('transactions').insert([
      // transação positiva / Saldo = 2
      {
        desc: 'Trans B#1', date: new Date(), ammount: 2, type: 'I', acc_id: 10104, status: true,
      },
      // transação utilizador errado / Saldo = 2
      {
        desc: 'Trans B#1', date: new Date(), ammount: 4, type: 'I', acc_id: 10102, status: true,
      },
      // transação outra conta / Saldo = 2 / Saldo = 8
      {
        desc: 'Trans B#1', date: new Date(), ammount: 8, type: 'I', acc_id: 10105, status: true,
      },
      // transação pendente / Saldo = 2 / Saldo = 8
      {
        desc: 'Trans B#1', date: new Date(), ammount: 16, type: 'I', acc_id: 10104, status: false,
      },
      // transação passada / Saldo = 34 / Saldo = 8
      {
        desc: 'Trans B#1', date: moment().subtract({ days: 5 }), ammount: 32, type: 'I', acc_id: 10104, status: true,
      },
      // transação futura / Saldo = 34 / Saldo = 8
      {
        desc: 'Trans B#1', date: moment().add({ days: 5 }), ammount: 64, type: 'I', acc_id: 10104, status: true,
      },
      // transação negativa / Saldo = -94 / Saldo = 8
      {
        desc: 'Trans B#1', date: new Date(), ammount: -128, type: 'O', acc_id: 10104, status: true,
      },
      // transferência / Saldo = 162 / Saldo = -248
      {
        desc: 'Trans B#1', date: new Date(), ammount: 256, type: 'I', acc_id: 10104, status: true,
      },
      {
        desc: 'Trans B#1', date: new Date(), ammount: -256, type: 'O', acc_id: 10105, status: true,
      },
      // transferência outro / Saldo = 162 / Saldo = -248
      {
        desc: 'Trans B#1', date: new Date(), ammount: 512, type: 'I', acc_id: 10103, status: true,
      },
      {
        desc: 'Trans B#1', date: new Date(), ammount: -512, type: 'O', acc_id: 10102, status: true,
      },
    ]));
};
