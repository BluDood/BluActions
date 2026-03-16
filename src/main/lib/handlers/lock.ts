import { execAsync } from '../utils.js'

import { HandlerFunction, HandlerMetadata } from '../../types/Handler.js'

export const id = 'lock'

export const metadata: HandlerMetadata = {
  name: 'Lock',
  description: 'Lock your computer',
  icon: 'lock'
}

export const hasActions = false

export const handle: HandlerFunction = async (_, res) => {
  const exec = await execAsync(
    'rundll32.exe user32.dll,LockWorkStation'
  ).catch(err => ({
    err
  }))

  if (typeof exec === 'object' && exec !== null && 'err' in exec) {
    console.error('Error shutting down:', exec.err)
    res.status(500).send({ error: 'Failed to shut down' })
  } else {
    res.send({ success: true })
  }
}
