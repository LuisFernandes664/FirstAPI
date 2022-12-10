const ValidationError = require('../errors/validationError');

module.exports = (app) => {
  const find = (filter = {}) => {
    return app.db('transfers')
      .where(filter)
      .select();
  };

  const findOne = (filter = {}) => {
    const result = app.db('transfers').where(filter).first();
    return result;
  };

  const validate = async (transfer) => {
    if (!transfer.desc) throw new ValidationError('A DESCRIÇÃO é um atributo obrigatório');
    if (!transfer.ammount) throw new ValidationError('O VALOR é um atributo obrigatório');
    if (!transfer.date) throw new ValidationError('A DATA é um atributo obrigatório');
    if (!transfer.acc_ori_id) throw new ValidationError('A CONTA de ORIGEM é um atributo obrigatório');
    if (!transfer.acc_dest_id) throw new ValidationError('A CONTA de DESTINO é um atributo obrigatório');
    if (transfer.acc_ori_id === transfer.acc_dest_id) throw new ValidationError('As CONTAS ORIGEM e DESTINO têm de ser diferentes');

    const accounts = await app.db('accounts').whereIn('id', [transfer.acc_ori_id, transfer.acc_dest_id]);
    accounts.forEach((acc) => {
      if (acc.user_id !== parseInt(transfer.user_id, 10)) throw new ValidationError('A CONTA de ORIGEM ou DESTINO não pertence ao utilizador');
    });
  };

  const save = async (transfer) => {
    const result = await app.db('transfers').insert(transfer, '*');
    const transferId = result[0].id;

    const transactions = [
      {
        desc: `Transfer to acc #${transfer.acc_dest_id}`, date: transfer.date, ammount: transfer.ammount * -1, type: 'O', acc_id: transfer.acc_ori_id, transfer_id: transferId, status: true,
      },
      {
        desc: `Transfer from acc #${transfer.acc_ori_id}`, date: transfer.date, ammount: transfer.ammount, type: 'I', acc_id: transfer.acc_dest_id, transfer_id: transferId, status: true,
      },
    ];

    await app.db('transactions').insert(transactions);

    return result;
  };

  const update = async (id, transfer) => {
    const result = app.db('transfers')
      .where({ id })
      .update(transfer, '*');

    const transactions = [
      {
        desc: `Transfer to acc #${transfer.acc_dest_id}`, date: transfer.date, ammount: transfer.ammount * -1, type: 'O', acc_id: transfer.acc_ori_id, transfer_id: id, status: true,
      },
      {
        desc: `Transfer from acc #${transfer.acc_ori_id}`, date: transfer.date, ammount: transfer.ammount, type: 'I', acc_id: transfer.acc_dest_id, transfer_id: id, status: true,
      },
    ];

    await app.db('transactions').where({ transfer_id: id }).del();
    await app.db('transactions').insert(transactions);

    return result;
  };

  const remove = async (id) => {
    await app.db('transactions').where({ transfer_id: id }).del();
    return app.db('transfers').where({ id }).del();
  };

  return {
    find, save, findOne, update, validate, remove,
  };
};
