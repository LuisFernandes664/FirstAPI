const ValidationError = require('../errors/validationError');

module.exports = (app) => {
  const a = 1234;
  const findAll = (filter = {}) => {
    return app.db('accounts').where(filter).select('*');
  };

  const find = (filter = {}) => {
    return app.db('accounts').where(filter).first();
  };

  const save = async (account) => {
    if (!account.name) throw new ValidationError('Nome é um atributo obrigatório');

    const accDB = await find({ name: account.name, user_id: account.user_id });
    if (accDB) throw new ValidationError('Já existe uma conta com o nome indicado');

    return app.db('accounts').insert(account, '*');
  };

  const update = async (id, account) => {
    return app.db('accounts')
      .where({ id })
      .update(account, '*');
  };

  const remove = async (id) => {
    const trans = await app.services.transaction.findOne({ acc_id: id });
    if (trans) throw new ValidationError('A CONTA tem transções associadas');

    return app.db('accounts')
      .where({ id })
      .del();
  };

  return {
    findAll, find, save, update, remove,
  };
};
