import { contextBridge, ipcRenderer } from 'electron'

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

// Custom APIs for renderer
const api = {
  on: (channel: string, listener: (...args: unknown[]) => void) => {
    const _listener = (_event, ...args: unknown[]) => listener(...args)
    ipcRenderer.on(channel, _listener)

    return () => ipcRenderer.removeListener(channel, _listener)
  },
  startServer: () => ipcRenderer.invoke(IPCHandler.StartServer),
  stopServer: () => ipcRenderer.invoke(IPCHandler.StopServer),
  getServerInfo: () => ipcRenderer.invoke(IPCHandler.GetServerInfo),
  getVersion: () => ipcRenderer.invoke(IPCHandler.GetVersion),
  getStorageValue: (key: string) =>
    ipcRenderer.invoke(IPCHandler.GetStorageValue, key),
  setStorageValue: (key: string, value: unknown) =>
    ipcRenderer.invoke(IPCHandler.SetStorageValue, key, value),
  isDevMode: () => ipcRenderer.invoke(IPCHandler.IsDevMode),
  getLogs: () => ipcRenderer.invoke(IPCHandler.GetLogs),
  clearLogs: () => ipcRenderer.invoke(IPCHandler.ClearLogs),
  downloadLogs: () => ipcRenderer.invoke(IPCHandler.DownloadLogs),
  openDevTools: () => ipcRenderer.invoke(IPCHandler.OpenDevTools),
  checkUpdate: () => ipcRenderer.invoke(IPCHandler.CheckUpdate),
  getHandlers: () => ipcRenderer.invoke(IPCHandler.GetHandlers),
  getKeys: () => ipcRenderer.invoke(IPCHandler.GetKeys),
  createKey: (name: string) =>
    ipcRenderer.invoke(IPCHandler.CreateKey, name),
  deleteKey: (hash: string) =>
    ipcRenderer.invoke(IPCHandler.DeleteKey, hash),
  findOpenPort: () => ipcRenderer.invoke(IPCHandler.FindOpenPort),
  isPortOpen: port => ipcRenderer.invoke(IPCHandler.IsPortOpen, port)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-expect-error (define in dts)
  window.api = api
}
