import { execAsync } from '../utils.js'

import { HandlerFunction, HandlerMetadata } from '../../types/Handler.js'

export const id = 'shutdown'

export const metadata: HandlerMetadata = {
  name: 'Shutdown',
  description: 'Shut down your computer.',
  icon: 'power_settings_new'
}

export const hasActions = false

export const handle: HandlerFunction = async (_, res) => {
  const exec = await execAsync('shutdown /s /t 0 /f').catch(err => ({
    err
  }))

  if (typeof exec === 'object' && exec !== null && 'err' in exec) {
    console.error('Error shutting down:', exec.err)
    res.status(500).send({ error: 'Failed to shut down' })
  } else {
    res.send({ success: true })
  }
}
