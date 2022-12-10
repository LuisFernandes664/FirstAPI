module.exports = {
  test: {
    client: 'pg',
    connection: {
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: '3409',
      database: 'pessoal',
    },
    debug: true,
    migrations: {
      directory: 'src/migrations/test',
    },
    seeds: {
      directory: 'src/seed/test',
    },
    pool: {
      min: 0,
      max: 50,
      propagateCreateError: false,
    },
  },
  docker: {
    client: 'pg',
    connection: {
      host: 'localhost',
      port: 9001,
      user: 'sa',
      password: '3409',
      database: 'pessoal',
    },
    debug: true,
    migrations: {
      directory: 'src/migrations',
    },
    seeds: {
      directory: 'src/seed/test',
    },
    pool: {
      min: 0,
      max: 50,
      propagateCreateError: false,
    },
  },
  staging: {
    client: 'pg',
    connection: {
      host: 'localhost',
      // port: 9002,
      user: 'postgres',
      password: '3409',
      database: 'pessoal',
    },
    debug: true,
    migrations: {
      directory: 'src/migrations',
    },
    pool: {
      min: 0,
      max: 50,
      propagateCreateError: false,
    },
  },
};
