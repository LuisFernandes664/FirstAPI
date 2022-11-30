const bcrypt = require('bcrypt-nodejs');
const ValidationError = require('../errors/validationError');

module.exports = (app) => {
  // ao chamar esta função passa o parametro que quer que procure senão coloca a vazio
  const findAll = (filter = {}) => {
    return app.db('users').where(filter).select(['id', 'email', 'name']);
  };

  const findOne = (filter = {}) => {
    return app.db('users').where(filter).first();
  };

  const getPasswordHash = (password) => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  };

  const save = async (user) => {
    if (!user.name) throw new ValidationError('Nome é um atributo obrigatório');
    if (!user.email) throw new ValidationError('O email é um atributo obrigatório');
    if (!user.password) throw new ValidationError('A password é um atributo obrigatório');

    const userDb = await findAll({ email: user.email });
    if (userDb && userDb.length > 0) throw new ValidationError('Email duplicado na BD');

    const newUser = { ...user };
    newUser.password = getPasswordHash(user.password);
    return app.db('users').insert(newUser, ['id', 'email', 'name']);
  };

  return { findAll, save, findOne };
};
