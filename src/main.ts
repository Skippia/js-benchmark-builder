import { type TTransportType, type TUsecaseType, TransportFactory } from './transports'

const transportType = process.argv[2] as TTransportType
const usecaseType = process.argv[3] as TUsecaseType

export async function buildServer(transportType: TTransportType, usecaseType: TUsecaseType) {
  const port = Number(process.env.PORT || '3000')

  const transport = await TransportFactory.createTransport(
    { transportType, usecaseType, port },
  )

  transport.run()
}

buildServer(transportType, usecaseType)
