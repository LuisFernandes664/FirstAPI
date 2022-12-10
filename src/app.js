const app = require('express')();
const consign = require('consign');

const knex = require('knex');
const knexfile = require('../knexfile');

app.db = knex(knexfile.test);

// A importar o ficheiro das middlewares atraves do "Consign" varios ficheiros
consign({ cwd: 'src', verbose: false })
  .include('./config/passport.js')
  .include('./config/middlewares.js')
  .include('./services')
  .include('./routes')
  .include('./config/router.js')
  .into(app);

app.get('/', (req, res) => {
  res.status(200).send('Olá!');
});

app.use((err, req, res, next) => {
  const { name, message, stack } = err;
  if (name === 'validationError') res.status(400).json({ error: message });
  if (name === 'forbiddenError') res.status(403).json({ error: message });
  else res.status(500).json({ name, message, stack });
  next(err);
});

module.exports = app;
