module.exports = function forbiddenError(message = 'Não tem acesso ao recurso solicitado') {
  this.name = 'forbiddenError';
  this.message = message;
};
