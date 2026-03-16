import { exec, ExecOptions } from 'child_process'
import { app, dialog } from 'electron'
import crypto from 'crypto'
import path from 'path'
import net from 'net'
import fs from 'fs'

import { getStorageValue, setStorageValue } from './storage.js'

export const isDev = () => getStorageValue('devMode') === true

export const hash = (str: string) =>
  crypto.createHash('sha256').update(str).digest('hex')

export const random = (len: number) =>
  crypto.randomBytes(len / 2).toString('hex')

export async function execAsync(
  cmd: string,
  options?: ExecOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, options, (error, stdout) => {
      if (error) {
        reject(error)
      } else {
        resolve(stdout.toString())
      }
    })
  })
}

let logPath: string | null = null

export enum LogLevel {
  DEBUG,
  INFO,
  WARN,
  ERROR
}

const logLevelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR']

let logLevel = LogLevel.INFO

export function setLogLevel(level: LogLevel) {
  logLevel = level
}

export function getLogLevel() {
  return logLevel
}

const logs: string[] = []

export function getLogs() {
  return logs
}

export async function downloadLogs() {
  const savePath = await dialog.showSaveDialog({
    title: 'Save logs',
    filters: [{ name: 'Log files', extensions: ['log'] }]
  })

  if (savePath.canceled) return null

  if (savePath) {
    fs.writeFileSync(savePath.filePath, logs.join('\n'), 'utf-8')

    return savePath
  }

  return null
}

export function clearLogs() {
  logs.length = 0
  log('Logs were cleared')
}

export function log(text: string, scope?: string, level = LogLevel.INFO) {
  if (level < logLevel) return

  if (!logPath) logPath = path.join(app.getPath('userData'), 'actions.log')

  const time = new Date().toLocaleTimeString([], {
    hour12: false,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  })

  const levelName = logLevelNames[level]

  const log = `[${time}] ${levelName}${scope ? ` <${scope}>:` : ''} ${text}`

  console.log(log)
  fs.appendFileSync(logPath, log + '\n')

  logs.push(log)
  if (logs.length > 1000) logs.shift()
}

export function safeParse(json: string) {
  try {
    return JSON.parse(json)
  } catch {
    return null
  }
}

export async function findOpenPort() {
  return new Promise<number>(resolve => {
    const server = net.createServer()

    server.listen(0, () => {
      const port = (server.address() as net.AddressInfo).port
      server.close(() => resolve(port))
    })
  })
}

export async function isPortOpen(port: number) {
  return new Promise<boolean>(resolve => {
    const server = net.createServer()

    server.once('error', () => resolve(false))

    server.once('listening', () => {
      server.close(() => resolve(true))
    })

    server.listen(port)
  })
}

export async function checkInternet() {
  return new Promise<boolean>(resolve => {
    const socket = net.createConnection(80, 'bludood.com')

    socket.setTimeout(5000)

    socket.on('connect', () => {
      socket.end()
      resolve(true)
    })

    socket.on('timeout', () => {
      socket.destroy()
      resolve(false)
    })

    socket.on('error', () => {
      resolve(false)
    })
  })
}

export const resourceFolder = path.join(
  process.env.NODE_ENV === 'development'
    ? app.getAppPath()
    : `${path.join(process.resourcesPath, 'app.asar.unpacked')}`,
  'resources'
)

export async function getServerPort() {
  const savedPort = getStorageValue('port')
  let port = savedPort

  if (savedPort) {
    const isOpen = await isPortOpen(savedPort)

    if (!isOpen) {
      log(
        `Port ${savedPort} is not open, finding a new one`,
        'Server',
        LogLevel.WARN
      )
      port = await findOpenPort()
    }
  } else {
    port = await findOpenPort()
  }

  if (port !== savedPort) {
    log(`Using port ${port}`, 'Server')
    await setStorageValue('port', port)
  }

  return port
}
