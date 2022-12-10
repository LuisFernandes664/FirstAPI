const supertest = require('supertest');

const request = supertest('http://localhost:3001');

test.skip('Validar o servidor', () => {
  return request.get('/').then((res) => expect(res.status).toBe(200));
});
