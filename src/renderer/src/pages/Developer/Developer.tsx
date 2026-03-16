import React, { useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { DevModeContext } from '@/contexts/DevModeContext.js'
import { ModalContext } from '@/contexts/ModalContext.js'

import styles from './Developer.module.css'

interface ServerInfo {
  running: boolean
  port: number | null
}

const Developer: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { openModals, setModalOpen } = useContext(ModalContext)
  const { devMode } = useContext(DevModeContext)

  function onClickBackground(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) setModalOpen('developer', false)
  }

  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null)

  useEffect(() => {
    const removeListener = window.api.on('serverStatus', up =>
      setServerInfo(up as ServerInfo)
    )

    window.api.getServerInfo().then(setServerInfo)

    return () => removeListener()
  }, [])

  useEffect(() => {
    if (!devMode) setModalOpen('developer', false)
  }, [devMode])

  return (
    <div
      className={styles.developer}
      data-open={openModals.includes('developer')}
      onClick={onClickBackground}
    >
      <div className={styles.box}>
        <div className={styles.header}>
          <h2>Developer Menu</h2>
          <button
            className={styles.close}
            onClick={() => setModalOpen('developer', false)}
          >
            <span className="material-icons">close</span>
          </button>
        </div>
        {serverInfo ? (
          <div className={styles.section}>
            <div className={styles.status}>
              <div
                className={styles.dot}
                data-color={serverInfo.running === true ? 'green' : 'red'}
              ></div>
              {serverInfo.running === true
                ? `Server is running on port ${serverInfo.port}`
                : 'Server is stopped'}
            </div>
            <div className={styles.actions}>
              <button
                onClick={() => window.api.startServer()}
                disabled={serverInfo.running === true}
              >
                <span className="material-icons">play_arrow</span>
                Start
              </button>
              <button
                data-color="red"
                onClick={() => window.api.stopServer()}
                disabled={serverInfo.running === false}
              >
                <span className="material-icons">block</span>
                Stop
              </button>
            </div>
          </div>
        ) : null}
        <div className={styles.bottomActions}>
          {location.pathname === '/setup' ? (
            <button onClick={() => navigate('/')}>
              <span className="material-icons">logout</span>
              Leave Setup
            </button>
          ) : (
            <button onClick={() => navigate('/setup')}>
              <span className="material-icons">tune</span>
              Enter Setup
            </button>
          )}
          <button onClick={() => window.api.openDevTools()}>
            <span className="material-icons">build</span>
            Open DevTools
          </button>
        </div>
      </div>
    </div>
  )
}

export default Developer
