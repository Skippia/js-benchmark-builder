import { type TTransportTypeUnion, type TUsecaseTypeUnion, buildTransport } from './transports'

const transportType = process.argv[2] as TTransportTypeUnion
const usecaseType = process.argv[3] as TUsecaseTypeUnion

export async function buildServer(transportType: TTransportTypeUnion, usecaseType: TUsecaseTypeUnion) {
  const port = Number(process.env.PORT || 3001)

  const transport = await buildTransport(
    { transportType, usecaseType, port },
  )

  transport.run()
}

buildServer(transportType, usecaseType)
