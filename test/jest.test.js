test('Testar se o JEST funciona!', () => {
  let number = null;
  expect(number).toBeNull();
  number = 10;
  expect(number).not.toBeNull();
  expect(number).toBe(10);
  expect(number).toEqual(10);
  expect(number).toBeGreaterThan(9);
  expect(number).toBeLessThan(11);
});

test('Testes com objetos', () => {
  const obj = { name: 'Luis Fernandes', mail: 'pesousa@ipca.pt' };
  expect(obj).toHaveProperty('name');
  expect(obj).toHaveProperty('name', 'Luis Fernandes');
  expect(obj.name).toBe('Luis Fernandes');

  const obj2 = { name: 'Luis Fernandes', mail: 'pesousa@ipca.pt' };
  expect(obj).toEqual(obj2);
  // expect(obj).toBe(obj2);
});
