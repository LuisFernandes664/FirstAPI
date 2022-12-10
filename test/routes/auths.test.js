const request = require('supertest');

const app = require('../../src/app');

const mail = `${Date.now()}@ipca.pt`;

test('Teste #1 - Autenticar: receber token', () => {
  return app.services.user.save(
    { name: 'Luis Auth', email: mail, password: '123456' },
  ).then(() => request(app).post('/auths/signin')
    .send({ email: mail, password: '123456' }))
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });
});

test('Teste #2 - Autenticar: falha no processo', () => {
  const nmail = `${Date.now()}@ipca.pt`;
  return app.services.user.save(
    { name: 'Luis Auth Fail', email: nmail, password: '123456789' },
  ).then(() => request(app).post('/auths/signin')
    .send({ email: nmail, password: '12345' }))
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Autenticação inválida! #1');
    });
});

test('Teste #3 - Autenticar: utilizador errado', () => {
  const nmail = `${Date.now()}@ipca.pt`;
  return request(app).post('/auths/signin')
    .send({ email: nmail, password: '12345' })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Autenticação inválida! #2');
    });
});

test('Teste #4 - Criar utilizador', () => {
  const nmail = `${Date.now()}@ipca.pt`;
  return request(app).post('/auths/signup')
    .send({ name: 'Luis Signup', email: nmail, password: 'signup' })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Luis Signup');
      expect(res.body).toHaveProperty('email');
      expect(res.body).not.toHaveProperty('password');
    });
});

test('Test #16 - Aceder a rotas protegidas', () => {
  return request(app).get('/v1/users')
    .then((res) => {
      expect(res.status).toBe(401);
    });
});
