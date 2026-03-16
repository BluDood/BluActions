import TypedEmitter from 'typed-emitter'
import EventEmitter from 'events'
import express from 'express'

import { Server } from 'http'

import { getServerPort, log } from '../lib/utils.js'
import { handlers } from './handlers/handlers.js'
import { isHandlerEnabled } from './storage.js'
import { authenticate } from './auth.js'

interface ServerInfo {
  running: boolean
  port: number | null
}

class ServerManager extends (EventEmitter as new () => TypedEmitter<{
  status: (up: ServerInfo) => void
}>) {
  private server: Server | null = null
  private port: number | null = null

  async start() {
    if (this.server) return

    this.port = await getServerPort()

    const app = express()

    app.use(express.json())
    app.use(authenticate)

    app.use('/api/:handler{/:action}', async (req, res) => {
      const { handler, action } = req.params

      const found = handlers.find(h => h.id === handler)

      if (!found) {
        log(`Handler ${handler} not found`, 'Server')
        return res.status(404).send('Handler not found')
      }

      if (!isHandlerEnabled(found.id)) {
        log(`Handler ${handler} is disabled`, 'Server')
        return res.status(403).send('Handler is disabled')
      }

      if (found.hasActions) {
        if (!action && found.handle) {
          log(`Running "${handler}" handler`, 'Server')
          return await found.handle(req, res)
        } else if (!action) {
          log(`No action provided for handler ${handler}`, 'Server')
          return res.status(400).send('Action is required')
        }

        const foundAction = found.actions.find(
          a => a.action === foundAction
        )

        if (!foundAction) {
          log(
            `Action ${action} not found for handler ${handler}`,
            'Server'
          )
          return res.status(404).send('Action not found')
        }

        log(`Running "${handler}${action}" handler`, 'Server')
        return await foundAction.handle(req, res)
      } else {
        log(`Running "${handler}" handler`, 'Server')
        return await found.handle(req, res)
      }
    })

    return new Promise<void>(resolve => {
      this.server = app.listen(this.port, () => {
        log(`Started on port ${this.port}`, 'Server')

        this.emit('status', {
          running: true,
          port: this.port
        })
        resolve()
      })

      this.server.on('close', () => {
        log(`Stopped on port ${this.port}`, 'Server')

        this.server = null
        this.emit('status', {
          running: false,
          port: null
        })
      })
    })
  }

  async stop() {
    if (!this.server) return
    await new Promise<void>(r => this.server!.close(() => r()))
  }

  async restart() {
    log('Restarting server', 'Server')
    await this.stop()
    await this.start()
  }

  getServerInfo(): ServerInfo {
    return {
      running: !!this.server,
      port: this.port
    }
  }
}

export const serverManager = new ServerManager()
