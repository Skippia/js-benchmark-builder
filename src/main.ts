import { type TTransportType, type TUsecaseType, buildTransport } from './transports'

const transportType = process.argv[2] as TTransportType
const usecaseType = process.argv[3] as TUsecaseType

export async function buildServer(transportType: TTransportType, usecaseType: TUsecaseType) {
  const port = Number(process.env.PORT || 3001)

  const transport = await buildTransport(
    { transportType, usecaseType, port },
  )

  // debugger

  transport.run()
}

buildServer(transportType, usecaseType)
