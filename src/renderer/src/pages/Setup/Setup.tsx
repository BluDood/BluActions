import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import Welcome from './Steps/Welcome/Welcome.js'
import Configuration from './Steps/Configuration/Configuration.js'
import Actions from './Steps/Actions/Actions.js'
import StartServer from './Steps/StartServer/StartServer.js'
import Done from './Steps/Done/Done.js'

import styles from './Setup.module.css'

enum Steps {
  Welcome,
  Configuration,
  Actions,
  StartServer,
  Complete
}

const Setup: React.FC = () => {
  const [params] = useSearchParams()
  const [step, setStep] = useState<Steps>(0)
  const [hasStep, setHasStep] = useState(false)

  useEffect(() => {
    const stepParam = params.get('step')
    if (stepParam) {
      setStep(parseInt(stepParam))
      setHasStep(true)
    }
  }, [])

  function changeStep(newStep: Steps) {
    if (hasStep) setStep(Steps.Complete)
    setStep(newStep)
  }

  return (
    <div className={styles.setup}>
      {step === Steps.Welcome ? (
        <Welcome onStepComplete={() => changeStep(Steps.Configuration)} />
      ) : step === Steps.Configuration ? (
        <Configuration onStepComplete={() => changeStep(Steps.Actions)} />
      ) : step === Steps.Actions ? (
        <Actions onStepComplete={() => changeStep(Steps.StartServer)} />
      ) : step === Steps.StartServer ? (
        <StartServer onStepComplete={() => changeStep(Steps.Complete)} />
      ) : step === Steps.Complete ? (
        <Done />
      ) : null}
    </div>
  )
}

export default Setup
