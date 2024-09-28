import { createRequire } from 'node:module'
import path from 'node:path'
import autocannon from 'autocannon'
import { usecaseMap } from '../server/usecases/usecase-map.js'
import type { TUsecaseTypeUnion } from '../server/transports/types.js'
import type { TBenchmarkSettingsCLI, TBenchmarkSettingsProgrammatically, TResultBenchmark, TUsecaseConfig } from './utils/index'

const require = createRequire(import.meta.url)

function prepareRequests(usecaseConfig: TUsecaseConfig) {
  let requests = []

  if (usecaseConfig.method === 'POST') {
    requests = require(path.resolve('benchmarks-data/users.json')).map((user: unknown) => ({
      method: 'POST',
      path: usecaseConfig.path,
      body: JSON.stringify(user),
      headers: {
        'Content-Type': 'application/json',
      },
    }))
  }
  else {
    requests = [{
      method: 'GET',
      path: usecaseConfig.path,
      headers: {
        'Content-Type': 'application/json',
      },
    }]
  }

  return requests
}

function startBench(
  { connections, duration, pipelining, usecaseConfig, workers, transport, usecase }: TBenchmarkSettingsCLI | TBenchmarkSettingsProgrammatically,
): Promise<TResultBenchmark> {
  return new Promise((resolve) => {
    const port = process.env.PORT
    const url = `http://localhost:${port}`
    const requests = prepareRequests(usecaseConfig)
    const instance = autocannon(
      {
        url,
        connections,
        pipelining,
        workers,
        duration,
        headers: {
          'Content-Type': 'application/json',
        },
        requests,
      },
      (err, res) => {
        return resolve({
          transport: transport as any,
          usecase: usecase as any,
          critical_errors: err,
          errors: res.errors,
          timeouts: res.timeouts,
          latency: {
            average: res.latency.average,
            min: res.latency.min,
            max: res.latency.max,
            p75: res.latency.p75,
            p90: res.latency.p90,
            p99: res.latency.p99,
          },
          requests: {
            totalAmount: res.requests.total,
            average: res.requests.average,
            min: res.requests.min,
            max: res.requests.max,
            p75: res.requests.p75,
            p90: res.requests.p90,
            p99: res.requests.p99,
          },
        })
      },
    )

    autocannon.track(instance)
  })
}

// Run from CLI
if (process.argv[2]) {
  const usecase = process.argv[2] as TUsecaseTypeUnion
  /**
   * method: 'GET' | 'POST',
   * path: '/some-path',
   */
  // @ts-expect-error ...
  const usecaseConfig: TUsecaseConfig = usecaseMap[usecase]

  if (!usecaseConfig) {
    throw new Error('Usecase not found!')
  }

  startBench({
    connections: 100,
    pipelining: 1,
    workers: 3,
    duration: 30,
    usecaseConfig,
  })
}

// Export for benchmark
export { startBench }
