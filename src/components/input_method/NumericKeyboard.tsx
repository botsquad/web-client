import React, { useState } from 'react'
import InputMethodContainer from './InputMethodContainer'
import { ArrowBack } from '../icons'
import { chatLabel } from '../../common/labels'
import { useInputMethodProps } from './InputMethodContext'
import { InputMethodNumeric } from 'show_types'

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['*', '0', '#'],
]

interface NumericKeyboardProps {
  settings: Record<string, any>
}

const NumericKeyboard: React.FC<NumericKeyboardProps> = ({ settings }) => {
  const { config, inputModal, localePrefs } = useInputMethodProps<InputMethodNumeric>()

  const [value, setValue] = useState('')

  const finish = (overrideValue?: string) => {
    if (inputModal) {
      const payload = {
        type: 'numeric',
        text: overrideValue || value,
        data: overrideValue || value,
        ...(config.input_type ? { input_type: config.input_type } : {}),
      }

      inputModal.finish('user_message', payload, null)
    }
  }

  const button = () => {
    if (config.finish_on_key || config.num_digits === 1) {
      return null
    }
    if (settings) {
      return (
        <button disabled={!value.length} onClick={() => finish()}>
          {chatLabel(settings as { ui_labels: any }, localePrefs, 'form_submit_button')}
        </button>
      )
    }
    return null
  }

  const add = (key: string) => {
    if (config.num_digits === 1 && !value.length) {
      finish(key)
      return
    }

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
      setValue(value.substring(0, value.length - 1))
    }
  }

  return (
    <InputMethodContainer className="numeric" below={button()}>
      {(config.num_digits || 1) > 1 ? (
        <div className="display">
          <span>{value}</span>
          <button onClick={backspace}>{ArrowBack}</button>
        </div>
      ) : null}
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
