import React, { useEffect, useState } from 'react'

import Loader from '@/components/Loader/Loader.js'

import styles from './StartServer.module.css'

interface StartServerProps {
  onStepComplete: () => void
}

enum State {
  Pending,
  Starting,
  Started
}

const StartServer: React.FC<StartServerProps> = ({ onStepComplete }) => {
  const [state, setState] = useState<State>(0)

  async function install() {
    setState(State.Starting)
    await window.api.startServer()
    setState(State.Started)
  }

  useEffect(() => {
    window.api.getServerInfo().then(info => {
      if (info.running) setState(State.Started)
    })
  }, [])

  return (
    <div className={styles.connect}>
      <p className={styles.step}>Step 3</p>
      <h1>Start the server</h1>
      <p>
        You can now start the server and begin using BluActions. The server
        will start automatically when the app is opened from now on!
      </p>
      {state === State.Starting ? (
        <div className={styles.state} key={'installing'}>
          <Loader />
          <p>Starting...</p>
        </div>
      ) : state === State.Started ? (
        <div className={styles.state} key={'complete'}>
          <span className="material-icons">check_circle</span>
          <p>Started!</p>
        </div>
      ) : null}
      <div className={styles.buttons}>
        {state === State.Pending ? (
          <button onClick={install}>Start</button>
        ) : state === State.Started ? (
          <button onClick={onStepComplete}>Continue</button>
        ) : null}
      </div>
    </div>
  )
}

export default StartServer
