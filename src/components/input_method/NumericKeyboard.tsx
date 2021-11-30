import React, { useState } from 'react'
import InputMethodContainer from './InputMethodContainer'
import { ArrowBack } from '../icons'
import { chatLabel } from '../../common/labels'

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['*', '0', '#'],
]

interface NumericKeyboardProps {
  config: { finish_on_key: string; num_digits: number; required: boolean; caption: string }
  inputModal: any
  settings: any
  localePrefs: string[]
}

const NumericKeyboard: React.FC<NumericKeyboardProps> = props => {
  const { config, inputModal } = props

  const [value, setValue] = useState('')

  const finish = () => {
    inputModal.finish('message', { type: 'numeric', text: value, data: value })
  }

  const button = () => {
    if (config.finish_on_key) {
      return null
    }
    if (props.settings) {
      return (
        <button disabled={!value.length} onClick={finish}>
          {chatLabel(props.settings, props.localePrefs, 'form_submit_button')}
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
    <InputMethodContainer {...props} className="numeric" below={button()}>
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
