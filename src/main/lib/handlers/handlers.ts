import { Handler } from '../../types/Handler.js'

import * as lock from './lock.js'
import * as sleep from './sleep.js'
import * as shutdown from './shutdown.js'

export const handlers: Handler[] = [lock, sleep, shutdown]
