import { HandlerFunction, HandlerMetadata } from '../../types/Handler.js'

export const id = 'ping'

export const metadata: HandlerMetadata = {
  name: 'Ping',
  description: 'A simple ping handler to test connectivity.',
  icon: 'wifi'
}

export const hasActions = false

export const handle: HandlerFunction = async (_, res) => {
  res.send({
    type: 'pong',
    data: 'pong'
  })
}
