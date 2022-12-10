exports.seed = (knex) => {
  return knex('transactions').del()
    .then(() => knex('transfers').del())
    .then(() => knex('accounts').del())
    .then(() => knex('users').del())
    .then(() => knex('users').insert([
      {
        id: 10000, name: 'User IPCA #1', email: 'user1@ipca.pt', password: '$2a$10$jyDVciONNE1TpoVqQDxJ1urBkv1I1ZYE6FWdlbYy8OZjjD/8o/Uk2',
      },
      {
        id: 10001, name: 'User IPCA #2', email: 'user2@ipca.pt', password: '$2a$10$jyDVciONNE1TpoVqQDxJ1urBkv1I1ZYE6FWdlbYy8OZjjD/8o/Uk2',
      },
    ]))
    .then(() => knex('accounts').insert([
      { id: 10000, name: 'AccOri #1.1', user_id: 10000 },
      { id: 10001, name: 'AccDest #1.2', user_id: 10000 },
      { id: 10002, name: 'AccOri #2.1', user_id: 10001 },
      { id: 10003, name: 'AccDest #2.2', user_id: 10001 },
    ]))
    .then(() => knex('transfers').insert([
      {
        id: 10000, desc: 'Transfer #1', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, ammount: 100, date: new Date(),
      },
      {
        id: 10001, desc: 'Transfer #2', user_id: 10001, acc_ori_id: 10002, acc_dest_id: 10003, ammount: 200, date: new Date(),
      },
    ]))
    .then(() => knex('transactions').insert([
      {
        desc: 'Transfer from AccOri #1.1', date: new Date(), ammount: 100, type: 'I', acc_id: 10001, transfer_id: 10000,
      },
      {
        desc: 'Transfer to AccDest #1.2', date: new Date(), ammount: -100, type: 'O', acc_id: 10000, transfer_id: 10000,
      },
      {
        desc: 'Transfer from AccOri #2.1', date: new Date(), ammount: 200, type: 'I', acc_id: 10003, transfer_id: 10001,
      },
      {
        desc: 'Transfer to AccDest #2.2', date: new Date(), ammount: -200, type: 'O', acc_id: 10002, transfer_id: 10001,
      },
    ]));
};
