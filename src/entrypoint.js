import { exec } from 'node:child_process'

const transportType = process.argv[2]
const usecaseType = process.argv[3]
const hostEnvironment = transportType === 'bun' ? 'bun' : 'node'

if (!transportType || !usecaseType) {
  console.error('You have specified transport type or usecase type!')
}
else {
  const script = exec(
    `${hostEnvironment} ./src/main.ts ${transportType} ${usecaseType}`,
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
