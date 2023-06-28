import moment from 'moment'
import * as React from 'react'
import { useState } from 'react'
import { chatLabel } from '../../common/labels'
import InputMethodContainer from './InputMethodContainer'
import { useInputMethodProps } from './InputMethodContext'
import Datetime from 'react-datetime'
import { checkDateConstraints } from './FormWidgets/DateTimeWidget'
import { InputMethodDatePicker } from 'show_types'

interface Props {
  settings: Record<string, any>
}

const DatePicker: React.FC<Props> = ({ settings }) => {
  const { config, inputModal, localePrefs } = useInputMethodProps<InputMethodDatePicker>()
  const [label, setLabel] = useState<string>('')
  const [value, setValue] = useState<string>('')

  const submit = (value: string, label: string) =>
    inputModal?.finish('user_message', { type: 'date_picker', text: label, data: value }, config)
  const { confirm, button_label, default_value, constraints } = config

  return (
    <InputMethodContainer
      className={`date-picker single ${confirm ? 'confirm' : ''}`}
      below={
        confirm ? (
          <button onClick={() => submit(value, label)} disabled={value === ''}>
            {button_label || chatLabel(settings as { ui_labels: any }, localePrefs, 'form_submit_button')}
          </button>
        ) : null
      }
    >
      <Datetime
        initialValue={moment(default_value || '')}
        input={false}
        value={moment(value) || moment()}
        onChange={date => {
          const value = moment(date).format('YYYY-MM-DD')
          const label = moment(date).format('D-M-Y')

          if (confirm) {
            setValue(value)
            setLabel(label)
          } else {
            submit(value, label)
          }
        }}
        locale={localePrefs[0]}
        isValidDate={value => checkDateConstraints(value, (constraints || []) as string[])}
        timeFormat={false}
        dateFormat={'D-M-Y'}
      />
    </InputMethodContainer>
  )
}

export default DatePicker
