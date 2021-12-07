import React, { useState } from 'react'
import InputMethodContainer from './InputMethodContainer'
import { ArrowBack } from '../icons'
import { chatLabel } from '../../common/labels'
import { useInputMethodProps } from './InputMethodContext'

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['*', '0', '#'],
]

interface NumericKeyboardProps {
  settings: any
}

const NumericKeyboard: React.FC<NumericKeyboardProps> = ({ settings }) => {
  const { config, inputModal, localePrefs } = useInputMethodProps()

  const [value, setValue] = useState('')

  const finish = () => {
    inputModal!.finish('message', { type: 'numeric', text: value, data: value }, null)
  }

  const button = () => {
    if (config.finish_on_key) {
      return null
    }
    if (settings) {
      return (
        <button disabled={!value.length} onClick={finish}>
          {chatLabel(settings, localePrefs, 'form_submit_button')}
        </button>
      )
    }
    return null
  }

  const add = (key: string) => {
    if (config.finish_on_key === key) {
      finish()
      return
    }
    if (value.length === config.num_digits) {
      return
    }

    setValue(value + key)
  }

  const backspace = () => {
    if (value.length > 0) {
      setValue(value.substr(0, value.length - 1))
    }
  }

  return (
    <InputMethodContainer className="numeric" below={button()}>
      <div className="display">
        <span>{value}</span>
        <button onClick={backspace}>{ArrowBack}</button>
      </div>
      <div className="keys">
        {KEYS.flat().map(k => (
          <button key={k} onClick={() => add(k)} className="key">
            {k}
          </button>
        ))}
      </div>
    </InputMethodContainer>
  )
}

export default NumericKeyboard
