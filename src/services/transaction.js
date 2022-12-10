const ValidationError = require('../errors/validationError');

module.exports = (app) => {
  const find = (userId, filter = {}) => {
    return app.db('transactions')
      .join('accounts', 'accounts.id', 'acc_id')
      .where(filter)
      .andWhere('accounts.user_id', '=', userId)
      .select();
  };

  const findOne = (filter = {}) => {
    return app.db('transactions')
      .where(filter)
      .first();
  };

  const save = (trans) => {
    if (!trans.desc) throw new ValidationError('A DESCRIÇÃO é um atributo obrigatório');
    if (!trans.ammount) throw new ValidationError('O VALOR é um atributo obrigatório');
    if (!trans.date) throw new ValidationError('A DATA é um atributo obrigatório');
    if (!trans.acc_id) throw new ValidationError('A CONTA é um atributo obrigatório');
    if (!trans.type) throw new ValidationError('O TIPO é um atributo obrigatório');
    if (!(trans.type === 'I' || trans.type === 'O')) throw new ValidationError('O TIPO tem um valor inválido');

    const newTrans = { ...trans };
    if ((trans.type === 'I' && trans.ammount < 0)
      || (trans.type === 'O' && trans.ammount > 0)) {
      newTrans.ammount *= -1;
    }
    return app.db('transactions')
      .insert(newTrans, '*');
  };

  const update = (id, trans) => {
    return app.db('transactions')
      .where({ id })
      .update(trans, '*');
  };

  const remove = async (id) => {
    return app.db('transactions')
      .where({ id })
      .del();
  };

  return {
    find, save, findOne, update, remove,
  };
};
