module.exports = (app) => {
  const create = (req, res) => {
    app.services.account.save(req.body)
      .then((result) => {
        return res.status(201).json(result[0]);
      });
  };

  const getAll = (req, res) => {
    app.services.account.findAll()
      .then((result) => res.status(200).json(result));
  };

  const get = (req, res) => {
    app.services.account.find({ id: req.params.id })
      .then((result) => res.status(200).json(result));
  };

  const update = (req, res) => {
    app.services.account.update(req.params.id, req.body)
      .then((result) => res.status(200).json(result[0]));
  };

  const remove = (req, res) => {
    app.services.account.remove(req.params.id)
      .then(() => res.status(204).send());
  };

  return {
    create, getAll, get, update, remove,
  };
};
