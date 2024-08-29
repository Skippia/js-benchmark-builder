import cluster from 'node:cluster'
import { cpus } from 'node:os'
import { runWS } from '../3-heavy-blocking-request/index.mjs'

const PORT = +process.env.PORT

if (cluster.isPrimary) {
  const numCPUs = cpus().length

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork()
  }

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died`)
  })
}
else {
  runWS(PORT)
}
