import { createRequire } from 'node:module'
import autocannon from 'autocannon'

import { usecaseMap } from '../src/usecases/usecase-map.js'

const require = createRequire(import.meta.url)
const usersData = require('./users.json') // 100_000 users

const PORT = process.env.PORT
const usecaseType = process.argv[2]

/**
 * method: 'GET' | 'POST',
 * path: '/some-path',
 */
const usecaseConfig = usecaseMap[usecaseType]

if (!usecaseConfig) {
  throw new Error('Usecase not found!')
}

function startBench() {
  const url = `http://localhost:${PORT}`

  let requestNumber = 0

  const instance = autocannon(
    {
      url,
      connections: 100,
      duration: 30,
      headers: {
        'Content-Type': 'application/json',
      },
      requests: [
        {
          method: usecaseConfig.method,
          path: usecaseConfig.path,
          setupRequest(request) {
            if (usecaseConfig.method === 'POST') {
              request.body = JSON.stringify(usersData[requestNumber % usersData.length])
              requestNumber++
            }

            return request
          },
        },
      ],
    },
    (err, _res) => console.log('Finished Bench', err /* res */),
  )

  autocannon.track(instance)
}

startBench()
