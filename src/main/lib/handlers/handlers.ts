import { Handler } from '../../types/Handler.js'

import * as lock from './lock.js'
import * as ping from './ping.js'
import * as shutdown from './shutdown.js'

export const handlers: Handler[] = [lock, shutdown, ping]
