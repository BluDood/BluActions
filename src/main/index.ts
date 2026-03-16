import { app, ipcMain } from 'electron'

// https://github.com/electron/electron/issues/46538
if (process.platform === 'linux')
  app.commandLine.appendSwitch('gtk-version', '3')

import {
  shell,
  BrowserWindow,
  Tray,
  Menu,
  Notification,
  nativeImage
} from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { join } from 'path'

import {
  getStorageValue,
  loadStorage,
  setStorageValue
} from './lib/storage.js'
import {
  clearLogs,
  downloadLogs,
  findOpenPort,
  getLogs,
  isDev,
  isPortOpen,
  log,
  LogLevel,
  resourceFolder,
  setLogLevel
} from './lib/utils.js'
import { getLatestVersion } from './lib/update.js'
import { serverManager } from './lib/server.js'
import { handlers } from './lib/handlers/handlers.js'
import { createKey, deleteKey, getKeys } from './lib/auth.js'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux'
      ? { icon: `${resourceFolder}/icon.png` }
      : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js')
    },
    titleBarStyle: 'hidden',
    resizable: false,
    maximizable: false,
    minimizable: false
  })

  mainWindow.on('ready-to-show', async () => {
    mainWindow!.show()
    mainWindow!.center()
    mainWindow?.setWindowButtonVisibility?.(false)
    app.dock?.show()
  })

  mainWindow.on('closed', async () => {
    const firstClose = getStorageValue('firstClose')

    if (firstClose !== false) {
      await setStorageValue('firstClose', false)

      new Notification({
        title: 'Still Running!',
        body: 'BluActions has been minimized to the system tray, and is still running in the background!'
      }).show()
    }
    mainWindow = null
    app.dock?.hide()
  })

  mainWindow.webContents.setWindowOpenHandler(details => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.on('second-instance', () => {
  if (mainWindow) {
    mainWindow.focus()
  } else {
    createWindow()
  }
})

app.on('ready', async () => {
  log('Welcome!', 'BluActions')

  const gotLock = app.requestSingleInstanceLock()
  if (!gotLock) return app.quit()

  loadStorage()
  setLogLevel(getStorageValue('logLevel') ?? LogLevel.INFO)

  if (
    process.env.NODE_ENV === 'development' &&
    getStorageValue('devMode') === null
  ) {
    await setStorageValue('devMode', true)
  }
  if (isDev()) log('Running in development mode', 'BluActions')
  electronApp.setAppUserModelId(`com.bludood.${app.getName()}`)

  if (getStorageValue('setupComplete') === true)
    await serverManager.start()

  await setupIpcHandlers()
  await setupTray()

  serverManager.on('status', up => {
    mainWindow?.webContents.send('serverStatus', up)
  })

  if (getStorageValue('launchMinimized') !== true) createWindow()
  else app.dock?.hide()
})

app.on('browser-window-created', (_, window) => {
  optimizer.watchWindowShortcuts(window)
})

app.on('window-all-closed', () => {
  // don't quit the process
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

enum IPCHandler {
  StartServer = 'startServer',
  StopServer = 'stopServer',
  GetServerInfo = 'getServerInfo',
  GetVersion = 'getVersion',
  GetStorageValue = 'getStorageValue',
  SetStorageValue = 'setStorageValue',
  IsDevMode = 'isDevMode',
  GetLogs = 'getLogs',
  ClearLogs = 'clearLogs',
  DownloadLogs = 'downloadLogs',
  OpenDevTools = 'openDevTools',
  CheckUpdate = 'checkUpdate',
  GetHandlers = 'getHandlers',
  GetKeys = 'getKeys',
  CreateKey = 'createKey',
  DeleteKey = 'deleteKey',
  FindOpenPort = 'findOpenPort',
  IsPortOpen = 'isPortOpen'
}

async function setupIpcHandlers() {
  ipcMain.handle(IPCHandler.StartServer, async () => {
    await serverManager.start()
  })

  ipcMain.handle(IPCHandler.StopServer, async () => {
    await serverManager.stop()
  })

  ipcMain.handle(IPCHandler.GetServerInfo, () => {
    return serverManager.getServerInfo()
  })

  ipcMain.handle(IPCHandler.GetVersion, () => {
    return app.getVersion()
  })

  ipcMain.handle(IPCHandler.GetStorageValue, (_event, key) => {
    return getStorageValue(key)
  })

  ipcMain.handle(
    IPCHandler.SetStorageValue,
    async (_event, key, value) => {
      return await setStorageValue(key, value)
    }
  )

  ipcMain.handle(IPCHandler.IsDevMode, () => {
    return isDev()
  })

  ipcMain.handle(IPCHandler.GetLogs, () => {
    return getLogs()
  })

  ipcMain.handle(IPCHandler.ClearLogs, () => {
    return clearLogs()
  })

  ipcMain.handle(IPCHandler.DownloadLogs, async () => {
    await downloadLogs()
  })

  ipcMain.handle(IPCHandler.OpenDevTools, () => {
    if (mainWindow) {
      mainWindow.webContents.openDevTools()
    }
  })

  ipcMain.handle(IPCHandler.CheckUpdate, async () => {
    const currentVersion = 'v' + app.getVersion()
    const latestVersion = await getLatestVersion()
    if (!latestVersion) return null

    return {
      currentVersion,
      latestVersion: latestVersion.version,
      downloadUrl: latestVersion.downloadUrl
    }
  })

  ipcMain.handle(IPCHandler.GetHandlers, () => {
    return handlers.map(handler => ({
      id: handler.id,
      metadata: handler.metadata
    }))
  })

  ipcMain.handle(IPCHandler.GetKeys, () => {
    return getKeys()
  })

  ipcMain.handle(IPCHandler.CreateKey, async (_event, name) => {
    return await createKey(name)
  })

  ipcMain.handle(IPCHandler.DeleteKey, async (_event, hash) => {
    return await deleteKey(hash)
  })

  ipcMain.handle(IPCHandler.FindOpenPort, async () => {
    return await findOpenPort()
  })

  ipcMain.handle(IPCHandler.IsPortOpen, async (_event, port) => {
    return await isPortOpen(port as number)
  })
}

async function setupTray() {
  const icon =
    process.platform === 'darwin'
      ? nativeImage
          .createFromPath(`${resourceFolder}/tray.png`)
          .resize({ height: 24, width: 24 })
      : `${resourceFolder}/tray.png`
  const tray = new Tray(icon)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: `BluActions v${app.getVersion()}`,
      enabled: false
    },
    {
      type: 'separator'
    },
    {
      label: 'Show',
      click: () => {
        if (mainWindow) {
          mainWindow.show()
        } else {
          createWindow()
        }
      }
    },
    {
      label: 'Quit',
      click: () => {
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)

  tray.setToolTip(`BluActions v${app.getVersion()}`)

  tray.on('click', () => {
    if (process.platform === 'darwin') return
    if (mainWindow) {
      mainWindow.show()
    } else {
      createWindow()
    }
  })
}
