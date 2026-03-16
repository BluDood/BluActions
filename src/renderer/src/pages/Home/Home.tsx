import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import icon from '@/assets/icon.png'

import styles from './Home.module.css'
import Switch from '@/components/Switch/Switch.js'

interface Handler {
  id: string
  metadata: {
    name: string
    description: string
    icon: string
  }
}

interface ServerInfo {
  running: boolean
  port: number | null
}

const Home: React.FC = () => {
  const navigate = useNavigate()

  const [updateInfo, setUpdateInfo] = useState<{
    currentVersion: string
    latestVersion: string
    downloadUrl: string
  } | null>(null)

  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null)
  const [handlers, setHandlers] = useState<Handler[]>([])
  const [enabledHandlers, setEnabledHandlers] = useState<string[]>([])

  const saveEnabledHandlers = (handlers: string[]) =>
    window.api.setStorageValue('enabledHandlers', handlers.join(','))

  useEffect(() => {
    window.api.getStorageValue('setupComplete').then(setupComplete => {
      if (!setupComplete) navigate('/setup')
    })

    const removeListener = window.api.on('serverStatus', up =>
      setServerInfo(up as ServerInfo)
    )

    window.api.getServerInfo().then(setServerInfo)

    window.api.checkUpdate().then(setUpdateInfo)

    window.api.getStorageValue('enabledHandlers').then(v => {
      const value = v as string | null
      if (value) {
        const handlers = value.split(',')

        setEnabledHandlers(handlers)
      }

      window.api.getHandlers().then(setHandlers)
    })

    const checkUpdateInterval = setInterval(
      () => window.api.checkUpdate().then(setUpdateInfo),
      1000 * 60 * 30
    )

    return () => {
      clearInterval(checkUpdateInterval)
      removeListener()
    }
  }, [])

  return (
    <div className={styles.home}>
      <div className={styles.title}>
        <img src={icon} alt="" />
        <div className={styles.text}>
          <p>BluActions</p>
          {serverInfo ? (
            <div className={styles.status}>
              <div
                className={styles.dot}
                data-color={serverInfo.running ? 'green' : 'red'}
              ></div>
              {serverInfo.running
                ? `Server is running on port ${serverInfo.port}`
                : 'Server is stopped'}
            </div>
          ) : null}
        </div>
      </div>
      <div className={styles.actions}>
        <h2>Actions</h2>
        <div className={styles.list}>
          {handlers.map(handler => (
            <div className={styles.action} key={handler.id}>
              <div className={styles.name}>
                <span className="material-icons">
                  {handler.metadata.icon}
                </span>
                {handler.metadata.name}
              </div>
              <p className={styles.description}>
                {handler.metadata.description}
              </p>
              <div className={styles.toggle}>
                <Switch
                  defaultValue={enabledHandlers.includes(handler.id)}
                  onChange={v => {
                    setEnabledHandlers(prev => {
                      const newEnabled = v
                        ? [...prev, handler.id]
                        : prev.filter(id => id !== handler.id)
                      saveEnabledHandlers(newEnabled)
                      return newEnabled
                    })
                  }}
                />
              </div>
              <div
                className={styles.id}
                data-shown={enabledHandlers.includes(handler.id)}
              >
                {handler.id}
              </div>
            </div>
          ))}
        </div>
      </div>
      {updateInfo &&
      updateInfo.latestVersion !== updateInfo.currentVersion ? (
        <div className={styles.update}>
          <div className={styles.title}>
            <span className="material-icons">download</span>A new
            BluActions update is available!
          </div>
          <div className={styles.content}>
            <p className={styles.version}>
              {updateInfo.currentVersion}{' '}
              <span className="material-icons">arrow_forward</span>{' '}
              {updateInfo.latestVersion}
            </p>
            <button onClick={() => window.open(updateInfo.downloadUrl)}>
              Download <span className="material-icons">open_in_new</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default Home
