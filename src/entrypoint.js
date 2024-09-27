import { exec } from 'node:child_process'
import { cpus } from 'node:os'

const transportType = process.argv[2]
const usecaseType = process.argv[3]
const cpuAmount = process.argv[4] === 'max'
  ? cpus().length
  : typeof process.argv[4] === 'undefined'
    ? 1
    : Number(process.argv[4])

const hostEnvironment = transportType === 'bun' ? 'bun' : 'node'

if (!transportType || !usecaseType) {
  console.error('You have specified transport type or usecase type!')
}
else {
  const script = exec(
    `NODE_ENV=production ${hostEnvironment} --env-file=.env ./dist/src/main.js ${transportType} ${usecaseType} ${cpuAmount}`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`)
        return
      }

      console.log(`Stdout: ${stdout}`)
      console.error(`Stderr: ${stderr}`)
    },
  )

  script.stdout.on('data', (data) => {
    console.log(data)
  })
}
