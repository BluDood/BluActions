import React, { useEffect, useRef, useState } from 'react'

import styles from './Configuration.module.css'
import Switch from '@/components/Switch/Switch.js'

interface ConfigurationProps {
  onStepComplete: () => void
}

const Configuration: React.FC<ConfigurationProps> = ({
  onStepComplete
}) => {
  const [loaded, setLoaded] = useState(false)
  const [port, setPort] = useState<number | null>(null)

  const portInputRef = useRef<HTMLInputElement>(null)
  const keyNameInputRef = useRef<HTMLInputElement>(null)

  const [hasKeys, setHasKeys] = useState<boolean>(false)
  const [createdKey, setCreatedKey] = useState<string | null>(null)

  const [error, setError] = useState<string | null>(null)

  const [startupLaunch, setStartupLaunch] = useState(false)
  const [startMinimized, setStartMinimized] = useState(false)

  useEffect(() => {
    async function getPort() {
      const savedPort = await window.api.getStorageValue('port')
      if (savedPort) return setPort(savedPort as number)

      const randomPort = await window.api.findOpenPort()
      setPort(randomPort)
    }

    window.api.getKeys().then(k => setHasKeys(k.length > 0))

    window.api
      .getStorageValue('launchMinimized')
      .then(v => v && setStartMinimized(v as boolean))
    window.api
      .getStorageValue('launchOnStartup')
      .then(v => v && setStartupLaunch(v as boolean))

    getPort().then(() => setLoaded(true))
  }, [])

  async function createKey() {
    const value = keyNameInputRef.current?.value
    if (!value) return

    const key = await window.api.createKey(value)
    await navigator.clipboard.writeText(key)
    setCreatedKey(key)
  }

  async function complete() {
    const port = parseInt(portInputRef.current!.value)
    if (isNaN(port) || port < 1024 || port > 65535)
      return setError('Please enter a valid port between 1024 and 65535')

    if (!(await window.api.isPortOpen(port)))
      return setError('The port is unavailable, choose another one')

    await window.api.setStorageValue('port', port)
    onStepComplete()
  }

  return (
    <div className={styles.connect}>
      <p className={styles.step}>Step 1</p>
      <h1>Configure the server</h1>
      <p>
        Here you can set which port the server is running on, and generate
        a key to authenticate actions.
      </p>
      {loaded ? (
        <>
          <div className={styles.input}>
            <div className={styles.title}>
              <p>Server Port</p>
              <p className={styles.description}>
                Used for accessing the server and running actions.
              </p>
            </div>
            <div className={styles.form}>
              <input
                className={styles.input}
                type="text"
                placeholder="1337"
                ref={portInputRef}
                defaultValue={port!.toString()}
                onKeyDown={e => {
                  const controlKeys = [
                    'Backspace',
                    'ArrowUp',
                    'ArrowDown',
                    'ArrowLeft',
                    'ArrowRight',
                    'Delete'
                  ]

                  if (!/[\d]/.test(e.key) && !controlKeys.includes(e.key))
                    e.preventDefault()
                }}
              />
            </div>
          </div>
          <div className={styles.input}>
            <div className={styles.title}>
              <p>Launch on startup</p>
              <p className={styles.description}>
                Starts the app when you log in. This will also start the
                server.
              </p>
            </div>
            <div className={styles.form}>
              <Switch
                defaultValue={startupLaunch}
                onChange={v =>
                  window.api.setStorageValue('launchOnStartup', v)
                }
              />
            </div>
          </div>
          <div className={styles.input}>
            <div className={styles.title}>
              <p>Launch minimized</p>
              <p className={styles.description}>
                Starts the app minimized in the system tray.
              </p>
            </div>
            <div className={styles.form}>
              <Switch
                defaultValue={startMinimized}
                onChange={v =>
                  window.api.setStorageValue('launchMinimized', v)
                }
              />
            </div>
          </div>
          {error ? (
            <div className={styles.notice} data-color="red">
              <p>
                <span className="material-icons">error</span>
                {error}
              </p>
            </div>
          ) : null}
          {hasKeys ? (
            <div className={styles.notice} key="hasKeys">
              <p>You have already set up an authentication key.</p>
              <button onClick={() => setHasKeys(false)}>
                Create another?
              </button>
            </div>
          ) : createdKey ? (
            <div
              className={styles.notice}
              key="success"
              data-color="green"
            >
              <p>
                <span className="material-icons">check_circle</span>
                Successfully generated and copied key!
              </p>
              <button
                onClick={() => navigator.clipboard.writeText(createdKey)}
              >
                Copy again
              </button>
            </div>
          ) : (
            <div className={styles.input} key="input" data-animate="true">
              <div className={styles.title}>
                <p>Generate Key</p>
                <p className={styles.description}>
                  Used for authenticating requests.
                </p>
              </div>
              <div className={styles.form}>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Key Name"
                  ref={keyNameInputRef}
                  onKeyDown={e => {
                    const controlKeys = [
                      'Backspace',
                      'ArrowUp',
                      'ArrowDown',
                      'ArrowLeft',
                      'ArrowRight',
                      'Delete'
                    ]

                    if (
                      !/[^,:]/.test(e.key) &&
                      !controlKeys.includes(e.key)
                    )
                      e.preventDefault()
                  }}
                />
              </div>
              <button onClick={createKey}>Create</button>
            </div>
          )}
          <div className={styles.buttons}>
            <button disabled={!createdKey && !hasKeys} onClick={complete}>
              Continue
            </button>
          </div>
        </>
      ) : null}
    </div>
  )
}

export default Configuration
