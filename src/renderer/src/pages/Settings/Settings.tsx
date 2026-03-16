import React, { useContext, useEffect, useRef, useState } from 'react'

import { DevModeContext } from '@/contexts/DevModeContext.js'
import { ModalContext } from '@/contexts/ModalContext.js'

import Switch from '@/components/Switch/Switch.js'

import styles from './Settings.module.css'

import icon from '@/assets/icon.png'

enum Tab {
  Server,
  Keys,
  Startup,
  Advanced,
  Logs,
  About
}

const Settings: React.FC = () => {
  const { openModals, setModalOpen } = useContext(ModalContext)
  const { devMode } = useContext(DevModeContext)

  const [currentTab, setCurrentTab] = useState<Tab>(Tab.Server)

  function onClickBackground(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) setModalOpen('settings', false)
  }

  useEffect(() => {
    if (!openModals.includes('settings') && currentTab !== Tab.Server) {
      setTimeout(() => setCurrentTab(Tab.Server), 200)
    }
  }, [openModals.includes('settings'), currentTab])

  useEffect(() => {
    if (!devMode && currentTab === Tab.Advanced) setCurrentTab(Tab.Server)
  })

  return (
    <div
      className={styles.settings}
      data-open={openModals.includes('settings')}
      onClick={onClickBackground}
    >
      <div className={styles.box}>
        <h2>
          Settings
          <button onClick={() => setModalOpen('settings', false)}>
            <span className="material-icons">close</span>
          </button>
        </h2>
        <div className={styles.content}>
          <div className={styles.tabs}>
            <button
              onClick={() => setCurrentTab(Tab.Server)}
              data-active={currentTab === Tab.Server}
            >
              <span className="material-icons">settings</span>
              Server
            </button>
            <button
              onClick={() => setCurrentTab(Tab.Keys)}
              data-active={currentTab === Tab.Keys}
            >
              <span className="material-icons">key</span>
              Keys
            </button>
            <button
              onClick={() => setCurrentTab(Tab.Startup)}
              data-active={currentTab === Tab.Startup}
            >
              <span className="material-icons">security</span>
              Startup
            </button>
            {devMode ? (
              <>
                <button
                  onClick={() => setCurrentTab(Tab.Advanced)}
                  data-active={currentTab === Tab.Advanced}
                >
                  <span className="material-icons">code</span>
                  Advanced
                </button>
                <button
                  onClick={() => setCurrentTab(Tab.Logs)}
                  data-active={currentTab === Tab.Logs}
                >
                  <span className="material-icons">description</span>
                  Logs
                </button>
              </>
            ) : null}
            <button
              onClick={() => setCurrentTab(Tab.About)}
              data-active={currentTab === Tab.About}
            >
              <span className="material-icons">info</span>
              About
            </button>
          </div>
          <div className={styles.tab}>
            {currentTab === Tab.Server ? (
              <ServerTab />
            ) : currentTab === Tab.Keys ? (
              <KeysTab />
            ) : currentTab === Tab.Startup ? (
              <StartupTab />
            ) : currentTab === Tab.Advanced ? (
              <AdvancedTab />
            ) : currentTab === Tab.Logs ? (
              <LogsTab />
            ) : currentTab === Tab.About ? (
              <AboutTab />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

const ToggleSetting: React.FC<{
  label: string
  description?: string
  defaultValue?: boolean
  badges?: ['red', string][]
  value?: boolean
  onChange: (value: boolean) => void
}> = ({ label, description, defaultValue, badges, value, onChange }) => {
  return (
    <div className={styles.toggleSetting}>
      <div className={styles.text}>
        <div className={styles.label}>
          {label}
          {badges ? (
            <div className={styles.badges}>
              {badges.map(([color, text], i) => (
                <div key={i} className={styles.badge} data-color={color}>
                  {text}
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <p className={styles.description}>{description}</p>
      </div>
      <Switch
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}

const SelectSetting: React.FC<{
  label: string
  description?: string
  defaultValue?: string | number
  value?: string | number
  options: { value: string | number; label: string }[]
  onChange: (value: string | number) => void
}> = ({ label, description, defaultValue, value, options, onChange }) => {
  return (
    <div className={styles.selectSetting}>
      <div className={styles.text}>
        <p className={styles.label}>{label}</p>
        <p className={styles.description}>{description}</p>
      </div>
      <select
        defaultValue={defaultValue}
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

const InputSubmitSetting: React.FC<{
  label: string
  description?: string
  disabled?: boolean
  defaultValue?: string
  placeholder?: string
  regex?: RegExp
  onSubmit: (value: string) => void
  clearOnSubmit?: boolean
  submitLabel: string
}> = ({
  label,
  description,
  disabled,
  defaultValue,
  placeholder,
  regex,
  onSubmit,
  clearOnSubmit,
  submitLabel
}) => {
  const [value, setValue] = useState(defaultValue ?? '')

  function submit() {
    if (disabled) return
    onSubmit(value.trim())
    if (clearOnSubmit) setValue('')
  }

  return (
    <div className={styles.inputWithSubmitSetting}>
      <div className={styles.title}>
        <p>{label}</p>
        <p className={styles.description}>{description}</p>
      </div>
      <div className={styles.form}>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          disabled={disabled}
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
              regex &&
              !regex.test(e.key) &&
              !controlKeys.includes(e.key)
            )
              e.preventDefault()
            else if (e.key === 'Enter') submit()
          }}
          onChange={e => setValue(e.target.value)}
        />
        <button disabled={disabled} onClick={submit}>
          {submitLabel}
        </button>
      </div>
    </div>
  )
}

const ServerTab: React.FC = () => {
  const { openModals } = useContext(ModalContext)

  const [loaded, setLoaded] = useState(false)

  const settings = useRef<{
    port?: number
  }>({})

  async function loadSettings() {
    setLoaded(false)
    settings.current = {
      port: parseInt((await window.api.getStorageValue('port')) as string)
    }
    setLoaded(true)
  }

  useEffect(() => {
    loadSettings()
  }, [openModals])

  const [portNotice, setPortNotice] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  async function changePort(newPort: number | null) {
    if (newPort === null) newPort = await window.api.findOpenPort()

    if (newPort < 1024 || newPort > 65535)
      return setPortNotice({
        type: 'error',
        message: 'Port is not valid (must be between 1024 and 65535)'
      })

    if (!(await window.api.isPortOpen(newPort)))
      return setPortNotice({
        type: 'error',
        message: 'The port is unavailable, choose another one'
      })

    await window.api.setStorageValue('port', newPort)
    setPortNotice({
      type: 'success',
      message: 'Port changed and server restarted!'
    })
    loadSettings()
  }

  useEffect(() => {
    if (portNotice) {
      const timeout = setTimeout(() => setPortNotice(null), 5000)

      return () => clearTimeout(timeout)
    }

    return
  }, [portNotice])

  return (
    loaded && (
      <div className={styles.serverTab}>
        <InputSubmitSetting
          label="Server Port"
          description="The port the server listens on."
          defaultValue={settings.current.port?.toString()}
          placeholder="1337"
          regex={/[\d]/}
          onSubmit={async value => {
            const port = parseInt(value)
            changePort(isNaN(port) ? null : port)
          }}
          submitLabel="Change"
        />
        {portNotice && (
          <p className={styles.notice} data-type={portNotice.type}>
            <span className="material-icons">
              {portNotice.type === 'success' ? 'check_circle' : 'error'}
            </span>
            {portNotice.message}
          </p>
        )}
      </div>
    )
  )
}

interface Key {
  name: string
  hash: string
}

const KeysTab: React.FC = () => {
  const [loaded, setLoaded] = useState(false)
  const [keys, setKeys] = useState<Key[]>([])
  const [created, setCreated] = useState(false)

  useEffect(() => {
    if (created) {
      const timeout = setTimeout(() => setCreated(false), 5000)

      return () => clearTimeout(timeout)
    }

    return
  }, [created])

  async function loadKeys() {
    const k = await window.api.getKeys()

    setKeys(k)
    setLoaded(true)
  }

  async function deleteKey(hash: string) {
    await window.api.deleteKey(hash)
    loadKeys()
  }

  async function submitKey(name: string) {
    if (!name.trim()) return

    const key = await window.api.createKey(name.trim())
    await navigator.clipboard.writeText(key)

    setCreated(true)
    await loadKeys()
  }

  useEffect(() => {
    loadKeys()
  }, [])

  return (
    loaded && (
      <div className={styles.keysTab}>
        <InputSubmitSetting
          label="Generate Key"
          description="Used for authenticating requests."
          placeholder="Name"
          onSubmit={submitKey}
          regex={/[^:,]/}
          clearOnSubmit
          submitLabel="Create"
        />
        {created && (
          <p className={styles.created}>
            <span className="material-icons">check_circle</span>
            Key created and copied to clipboard!
          </p>
        )}
        <div className={styles.list}>
          {keys.map(key => (
            <div className={styles.key} key={key.hash}>
              <span className="material-icons">vpn_key</span>
              <p className={styles.name}>{key.name}</p>
              <button onClick={() => deleteKey(key.hash)}>
                <span className="material-icons">delete</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  )
}

const StartupTab: React.FC = () => {
  const [loaded, setLoaded] = useState(false)
  const settings = useRef<{
    launchOnStartup?: boolean
    launchMinimized?: boolean
    installOnStartup?: boolean
  }>({})

  useEffect(() => {
    async function loadSettings() {
      settings.current = {
        launchOnStartup:
          (await window.api.getStorageValue('launchOnStartup')) === true,
        launchMinimized:
          (await window.api.getStorageValue('launchMinimized')) === true
      }
      setLoaded(true)
    }

    loadSettings()
  }, [])

  return (
    loaded && (
      <div className={styles.settingsTab}>
        <ToggleSetting
          label="Launch on startup"
          description="Starts the app when you log in. This will also start the server."
          defaultValue={settings.current.launchOnStartup ?? false}
          onChange={value =>
            window.api.setStorageValue('launchOnStartup', value)
          }
        />
        <ToggleSetting
          label="Launch minimized"
          description="Starts the app minimized in the system tray."
          defaultValue={settings.current.launchMinimized ?? false}
          onChange={value =>
            window.api.setStorageValue('launchMinimized', value)
          }
        />
      </div>
    )
  )
}

const AdvancedTab: React.FC = () => {
  const { setDevMode } = useContext(DevModeContext)
  const [loaded, setLoaded] = useState(false)
  const settings = useRef<{
    disableAuth?: boolean
    logLevel?: number
  }>({})

  useEffect(() => {
    async function loadSettings() {
      settings.current = {
        disableAuth:
          (await window.api.getStorageValue('disableAuth')) === true,
        logLevel: ((await window.api.getStorageValue('logLevel')) ||
          1) as number
      }
      setLoaded(true)
    }

    loadSettings()
  }, [])

  return (
    loaded && (
      <div className={styles.settingsTab}>
        <ToggleSetting
          label="Developer Mode"
          description="Enables some options for development purposes."
          defaultValue={true}
          onChange={() => setDevMode(false)}
        />
        <SelectSetting
          label="Log Level"
          description="Useful for debugging purposes."
          defaultValue={settings.current.logLevel}
          options={[
            { value: 0, label: 'Debug' },
            { value: 1, label: 'Info' },
            { value: 2, label: 'Warn' },
            { value: 3, label: 'Error' }
          ]}
          onChange={value =>
            window.api.setStorageValue(
              'logLevel',
              parseInt(value as string)
            )
          }
        />
        <ToggleSetting
          label="Disable Authentication"
          description="Allows actions to be ran without authentication."
          badges={[['red', 'unsafe']]}
          defaultValue={settings.current.disableAuth ?? false}
          onChange={value =>
            window.api.setStorageValue('disableAuth', value)
          }
        />
      </div>
    )
  )
}

const LogsTab: React.FC = () => {
  const logsRef = useRef<HTMLDivElement>(null)
  const [logs, setLogs] = useState<string[]>([])

  const [loaded, setLoaded] = useState(false)
  const settings = useRef<{
    logLevel?: number
  }>({})

  useEffect(() => {
    async function loadSettings() {
      settings.current = {
        logLevel: ((await window.api.getStorageValue('logLevel')) ||
          1) as number
      }
      setLoaded(true)
    }

    loadSettings()
  }, [])

  useEffect(() => {
    const updateLogs = async () => setLogs(await window.api.getLogs())

    const interval = setInterval(() => {
      updateLogs()
    }, 500)

    updateLogs()

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scroll({
        top: logsRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [logsRef.current])

  useEffect(() => {
    if (logsRef.current) {
      const currentScroll =
        logsRef.current.scrollHeight - logsRef.current.clientHeight

      if (currentScroll <= logsRef.current.scrollTop + 200) {
        logsRef.current.scroll({
          top: logsRef.current.scrollHeight,
          behavior: 'smooth'
        })
      }
    }
  }, [logs])

  return loaded ? (
    <div className={styles.logsTab}>
      <div className={styles.logs} ref={logsRef}>
        {logs.map((log, i) => (
          <p key={i} className={styles.log}>
            {log}
          </p>
        ))}
      </div>
      <div className={styles.controls}>
        <div className={styles.level}>
          <p>Log level</p>
          <select
            defaultValue={settings.current.logLevel}
            onChange={e =>
              window.api.setStorageValue(
                'logLevel',
                parseInt(e.target.value as string)
              )
            }
          >
            <option value="0">Debug</option>
            <option value="1">Info</option>
            <option value="2">Warn</option>
            <option value="3">Error</option>
          </select>
        </div>
        <div className={styles.buttons}>
          <button
            onClick={() => window.api.clearLogs().then(() => setLogs([]))}
            className={styles.clear}
            data-type="danger"
          >
            <span className="material-icons">delete_forever</span>
          </button>
          <button
            onClick={() => window.api.downloadLogs()}
            className={styles.download}
          >
            <span className="material-icons">download</span>
          </button>
        </div>
      </div>
    </div>
  ) : null
}

const AboutTab: React.FC = () => {
  const { devMode, setDevMode } = useContext(DevModeContext)

  const [version, setVersion] = useState<string | null>(null)
  const [timesClicked, setTimesClicked] = useState(0)

  useEffect(() => {
    window.api.getVersion().then(setVersion)
  }, [])

  useEffect(() => {
    if (timesClicked <= 0) return

    if (devMode) return

    if (timesClicked >= 5) setDevMode(true)
  }, [timesClicked])

  return (
    <div className={styles.aboutTab}>
      <div className={styles.app}>
        <img src={icon} alt="" />
        <div className={styles.info}>
          <h2>BluActions</h2>
          <p
            onClick={() => setTimesClicked(t => (t += 1))}
            className={styles.version}
          >
            Version {version}
          </p>
        </div>
      </div>
      <h2>Credits</h2>
      <div className={styles.credit}>
        <img src="https://api.bludood.com/avatar?size=48" alt="" />
        <div className={styles.info}>
          <a href="https://bludood.com" target="_blank" rel="noreferrer">
            BluDood
          </a>
          <p>Developer</p>
        </div>
      </div>
    </div>
  )
}

export default Settings
