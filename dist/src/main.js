import { buildTransport } from './transports/index.js'

const transportType = process.argv[2]
const usecaseType = process.argv[3]
export async function buildServer(transportType, usecaseType) {
  const port = Number(process.env.PORT || 3001)
  const transport = await buildTransport({ transportType, usecaseType, port })

  transport.run()
}
buildServer(transportType, usecaseType)
