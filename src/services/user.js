const bcrypt = require('bcrypt-nodejs');
const ValidationError = require('../errors/validationError');

module.exports = (app) => {
  const findAll = async (filter = {}) => {
    const dummyUser = await app.db('users').where({ email: 'dummy@ipca.pt' }).select(['id', 'name', 'email']);
    if (dummyUser && dummyUser.length > 0) throw new ValidationError('Dummy User');
    return app.db('users').where(filter).select(['id', 'name', 'email']);
  };

  const findOne = (filter = {}) => {
    return app.db('users').where(filter).first();
  };

  const getPasswordHash = (password) => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  };

  const save = async (user) => {
    if (!user.name) throw new ValidationError('O nome é um atributo obrigatório');
    if (!user.email) throw new ValidationError('O email é um atributo obrigatório');
    if (!user.password) throw new ValidationError('A password é um atributo obrigatório');

    const userDb = await findAll({ email: user.email });
    if (userDb && userDb.length > 0) throw new ValidationError('Email duplicado na BD');

    const newUser = { ...user };
    newUser.password = getPasswordHash(user.password);
    return app.db('users').insert(newUser, ['id', 'name', 'email']);
  };

  return { findAll, save, findOne };
};
