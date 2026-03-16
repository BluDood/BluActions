import React, { useEffect, useState } from 'react'

import Switch from '@/components/Switch/Switch.js'

import styles from './Actions.module.css'

interface ActionsProps {
  onStepComplete: () => void
}

interface Handler {
  id: string
  metadata: {
    name: string
    description: string
    icon: string
  }
}

const Actions: React.FC<ActionsProps> = ({ onStepComplete }) => {
  const [handlers, setHandlers] = useState<Handler[]>([])
  const [enabledHandlers, setEnabledHandlers] = useState<string[]>([])

  const saveEnabledHandlers = (handlers: string[]) =>
    window.api.setStorageValue('enabledHandlers', handlers.join(','))

  useEffect(() => {
    window.api.getStorageValue('enabledHandlers').then(v => {
      const value = v as string | null
      if (value) {
        const handlers = value.split(',')

        setEnabledHandlers(handlers)
      } else {
        const defaultHandlers = ['lock', 'ping']
        setEnabledHandlers(defaultHandlers)
        saveEnabledHandlers(defaultHandlers)
      }

      window.api.getHandlers().then(setHandlers)
    })
  }, [])

  return (
    <div className={styles.actions}>
      <p className={styles.step}>Step 2</p>
      <h1>Configure Actions</h1>
      <p>
        Actions are the way of controlling your computer through the API.
        Here you can adjust which actions are enabled and disabled. We have
        enabled a few actions to get you started, but you can disable these
        at any time.
      </p>
      <div className={styles.actions}>
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
            </div>
          ))}
        </div>
      </div>
      <div className={styles.buttons}>
        <button onClick={onStepComplete}>Continue</button>
      </div>
    </div>
  )
}

export default Actions
