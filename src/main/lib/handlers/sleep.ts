import { HandlerFunction, HandlerMetadata } from '../../types/Handler.js'
import {
  commandHandlerHelper,
  Platform,
  PlatformCommands
} from '../helpers.js'

export const id = 'sleep'

export const metadata: HandlerMetadata = {
  name: 'Sleep',
  description: 'Put your computer to sleep.',
  icon: 'bedtime'
}

export const hasActions = false

const commands: PlatformCommands = {
  [Platform.WINDOWS]: `rundll32.exe powrprof.dll,SetSuspendState 0,1,0`,
  [Platform.MACOS]: `pmset sleepnow`,
  [Platform.LINUX]: `systemctl suspend`
}

export const handle: HandlerFunction = (_, res) =>
  commandHandlerHelper(res, commands)
