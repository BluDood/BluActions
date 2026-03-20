import type { Response } from 'express'

import { execAsync, log } from './utils.js'

export enum Platform {
  LINUX,
  WINDOWS,
  MACOS
}

export function parsePlatform(): Platform | null {
  switch (process.platform) {
    case 'win32':
      return Platform.WINDOWS
    case 'darwin':
      return Platform.MACOS
    case 'linux':
      return Platform.LINUX
    default:
      return null
  }
}

export type PlatformCommands = Partial<Record<Platform, string>>

export async function commandHandlerHelper(
  res: Response,
  commands: PlatformCommands
) {
  const platform = parsePlatform()
  if (platform === null) {
    log(`Your system platform is not supported`, 'CommandHandler')
    return res.status(500).send({ error: 'Unsupported platform' })
  }

  const command = commands[platform]
  if (!command)
    return res
      .status(400)
      .send({ error: 'Command not available on platform' })

  const result = await execAsync(command)
  if (!result.success) {
    log(`Error running command: ${result.error}`, 'CommandHandler')
    return res.status(500).send({ error: 'Failed to execute command' })
  }

  return res.send({ success: true })
}
