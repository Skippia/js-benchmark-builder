export const usecaseMap = {
  'empty': {
    method: 'GET',
    path: '/empty',
  },
  'heavy-blocking': {
    method: 'GET',
    path: '/heavy-blocking',
  },
  'heavy-non-blocking': {
    method: 'GET',
    path: '/heavy-non-blocking',
  },
  // Postgres
  'pg-pool-create-user': {
    method: 'POST',
    path: '/pg-pool-create-user',
  },
  'pg-pool-get-user': {
    method: 'GET',
    path: '/pg-pool-get-user',
  },
  // Redis
  'redis-create-user': {
    method: 'POST',
    path: '/redis-create-user',
  },
  'redis-get-user': {
    method: 'GET',
    path: '/redis-get-user',
  },
}
