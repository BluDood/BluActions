import '@electron-toolkit/preload'

interface Handler {
  id: string
  metadata: {
    name: string
    description: string
    icon: string
  }
}

interface Key {
  name: string
  hash: string
}

declare global {
  interface Window {
    api: {
      on: (
        channel: string,
        listener: (...args: unknown[]) => void
      ) => () => void
      startServer: () => Promise<void>
      stopServer: () => Promise<void>
      getServerInfo: () => Promise<{
        running: boolean
        port: number | null
      }>
      getVersion: () => Promise<string>
      getStorageValue: (key: string) => Promise<unknown>
      setStorageValue: (key: string, value: unknown) => Promise<void>
      isDevMode: () => Promise<boolean>
      getLogs: () => Promise<string[]>
      clearLogs: () => Promise<void>
      downloadLogs: () => Promise<void>
      openDevTools: () => void
      checkUpdate: () => Promise<{
        currentVersion: string
        latestVersion: string
        downloadUrl: string
      } | null>
      getHandlers: () => Promise<Handler[]>
      getKeys: () => Promise<Key[]>
      createKey: (name: string) => Promise<string>
      deleteKey: (hash: string) => Promise<void>
      findOpenPort: () => Promise<number>
      isPortOpen: (port: number) => Promise<boolean>
    }
  }
}
