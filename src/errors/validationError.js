module.exports = function validationError(message) {
  this.name = 'validationError';
  this.message = message;
};
