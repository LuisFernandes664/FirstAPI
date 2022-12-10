const express = require('express');

module.exports = (app) => {
  app.use('/auths', app.routes.auths);

  const secureRouter = express.Router();
  secureRouter.use('/users', app.routes.users);
  secureRouter.use('/accounts', app.routes.accounts);
  secureRouter.use('/transactions', app.routes.transactions);
  secureRouter.use('/transfers', app.routes.transfers);
  secureRouter.use('/balance', app.routes.balances);

  app.use('/v1', app.config.passport.authenticate(), secureRouter);
};
