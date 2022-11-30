const request = require('supertest');

const app = require('../../src/app');

const mail = `${Date.now()}@ipca.pt`;

test('Test #13 - Receber token ao autenticar', () => {
  return app.services.user.save(
    { name: 'Luis Auth', email: mail, password: '12345' },
  ).then(() => request(app).post('/auth/signin')
    .send({ email: mail, password: '12345' }))
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });
});

test('Test #14 - Tentativa de autenticação errada', () => {
  const nmail = `${Date.now()}@ipca.pt`;
  return app.services.user.save(
    { name: 'Luis Auth', email: nmail, password: '12345' },
  ).then(() => request(app).post('/auth/signin')
    .send({ email: nmail, password: '67890' }))
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Autenticação inválida!');
    });
});

test('Test #15 - Tentativa de autenticação com utilizador errado', () => {
  const nmail = `${Date.now()}@ipca.pt`;
  return request(app).post('/auth/signin')
    .send({ email: nmail, password: '67890' })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Autenticação inválida! #2');
    });
});

test('Test #16 - Aceder a rotas protegidas', () => {
  return request(app).get('/users')
    .then((res) => {
      expect(res.status).toBe(401);
    });
});

test('Test #17 - Criar utilizador', () => {
  const nmail = `${Date.now()}@ipca.pt`;
  return request(app).post('/auth/signup')
    .send({ name: 'Luis Signup', email: nmail, password: '12345' })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Luis Signup');
      expect(res.body).toHaveProperty('email');
      expect(res.body).not.toHaveProperty('password');
    });
});
