import * as React from 'react'
import { useState } from 'react'
import { chatLabel } from '../../common/labels'
import InputMethodContainer from './InputMethodContainer'
import { useInputMethodProps } from './InputMethodContext'
import { checkDateConstraints } from './FormWidgets/DateTimeWidget'
import 'react-datepicker/dist/react-datepicker.css'
import DatePicker2 from 'react-datepicker'
import { registerLocale } from 'react-datepicker'
import './Datepicker.scss'
import nl from 'date-fns/locale/nl'
import de from 'date-fns/locale/de'
import fr from 'date-fns/locale/fr'
import es from 'date-fns/locale/es'
import da from 'date-fns/locale/da'
import fi from 'date-fns/locale/fi'
import ar from 'date-fns/locale/ar'
registerLocale('nl', nl)
registerLocale('de', de)
registerLocale('fr', fr)
registerLocale('es', es)
registerLocale('da', da)
registerLocale('fi', fi)
registerLocale('ar', ar)
import format from 'date-fns/format'

interface Props {
  settings: Record<string, any>
}

const DatePicker: React.FC<Props> = ({ settings }) => {
  const { config, inputModal, localePrefs } = useInputMethodProps()
  const [label, setLabel] = useState<string>('')
  const [value, setValue] = useState<string>('')

  const submit = (value: string, label: string) =>
    inputModal?.finish('message', { type: 'date_picker', text: label, data: value }, config)
  const { confirm, button_label, constraints } = config

  return (
    <>
      <InputMethodContainer
        className={`date-picker single ${confirm ? 'confirm' : ''} `}
        below={
          confirm ? (
            <button onClick={() => submit(value, label)} disabled={value === ''}>
              {button_label || chatLabel(settings as { ui_labels: any }, localePrefs, 'form_submit_button')}
            </button>
          ) : null
        }
      >
        <DatePicker2
          selected={value ? new Date(value) : new Date()}
          onChange={date => {
            const value = format(date || new Date(), 'yyyy-mm-dd')
            const label = format(date || new Date(), 'd-m-y')

            if (confirm) {
              setValue(value)
              setLabel(label)
            } else {
              submit(value, label)
            }
          }}
          inline
          locale={localePrefs[0]}
          filterDate={value => checkDateConstraints(value, (constraints || []) as string[])}
        />
      </InputMethodContainer>
    </>
  )
}

export default DatePicker
