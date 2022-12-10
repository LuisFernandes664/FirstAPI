exports.up = (knex) => {
  return knex.schema.createTable('users', (t) => {
    t.increments('id').primary();
    t.string('name').notNull();
    t.string('email').notNull().unique();
    t.string('password').notNull();
  });
};

exports.down = (knex) => {
  return knex.schema.dropTable('users');
};
