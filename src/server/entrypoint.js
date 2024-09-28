import { spawn } from 'node:child_process'
import { cpus } from 'node:os'
import process from 'node:process'

function startEntrypoint({
  transportType,
  usecaseType,
  cpuAmount,
}) {
  return new Promise((resolve) => {
    const hostEnvironment = transportType === 'bun' ? 'bun' : 'node'

    const serverProcess = spawn(hostEnvironment, [
      './dist/server/main.js',
      transportType,
      usecaseType,
      cpuAmount,
    ], {
      detached: true,
    })

    serverProcess.stdout.on('data', (data) => {
      const stdoutInfo = data?.toString()

      if (!stdoutInfo.startsWith('[Hook]')) console.log(stdoutInfo)

      if (stdoutInfo.includes('server running on')) {
        // Server is ready to accept requests
        resolve(serverProcess)
      }
    })

    serverProcess.stderr.on('data', (data) => {
      console.log(`stderr`, data?.toString())
    })
  })
}

// Run from CLI
if (process.argv[2] && process.argv[3]) {
  const transportType = process.argv[2]
  const usecaseType = process.argv[3]
  const cpuAmount = process.argv[4] === 'max'
    ? cpus().length
    : typeof process.argv[4] === 'undefined'
      ? 1
      : Number(process.argv[4])

  startEntrypoint({ transportType, usecaseType, cpuAmount })
}

// Export for benchmark
export { startEntrypoint }
