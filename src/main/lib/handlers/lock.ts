import { HandlerFunction, HandlerMetadata } from '../../types/Handler.js'
import {
  commandHandlerHelper,
  Platform,
  PlatformCommands
} from '../helpers.js'

export const id = 'lock'

export const metadata: HandlerMetadata = {
  name: 'Lock',
  description: 'Lock your computer.',
  icon: 'lock'
}

export const hasActions = false

const commands: PlatformCommands = {
  [Platform.WINDOWS]: 'rundll32.exe user32.dll,LockWorkStation',
  [Platform.MACOS]: 'open -a ScreenSaverEngine',
  [Platform.LINUX]: 'xdg-screensaver lock'
}

export const handle: HandlerFunction = (_, res) =>
  commandHandlerHelper(res, commands)
