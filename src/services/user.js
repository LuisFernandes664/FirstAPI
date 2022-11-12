module.exports = (app) => {
  // ao chamar esta função passa o parametro que quer que procure senão coloca a vazio
  const findAll = (filter = {}) => {
    return app.db('users').where(filter).select();
  };

  const save = async (user) => {
    if (!user.name) return { error: 'Nome é um atributo obrigatório' };
    if (!user.email) return { error: 'O email é um atributo obrigatório' };
    if (!user.password) return { error: 'A password é um atributo obrigatório' };

    const userDb = await findAll({ email: user.email });
    if (userDb && userDb.length > 0) return { error: 'Email duplicado na BD' };
    return app.db('users').insert(user, '*');
  };

  return { findAll, save };
};
