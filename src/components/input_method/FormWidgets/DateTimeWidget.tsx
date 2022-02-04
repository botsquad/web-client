import { registerLocale } from 'react-datepicker'
import isWeekend from 'date-fns/isWeekend'
import isAfter from 'date-fns/isAfter'

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

import { format } from 'date-fns'

import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { WidgetProps } from 'react-jsonschema-form'
import { usePopper } from 'react-popper'
import { chatLabel } from '../../../common/labels'
import 'react-datepicker/dist/react-datepicker.css'

import DatePicker from 'react-datepicker'

export const checkDateConstraints = (currentDate: Date, constraints: string[] | string) => {
  if (typeof constraints === 'string') constraints = [constraints]

  const now = new Date()
  const value = new Date(currentDate)
  // console.log(currentDate, constraints)
  for (const constraint of constraints) {
    if (constraint === 'only_past') {
      if (!isAfter(value, now)) return false
    }
    if (constraint === 'only_future') {
      if (isAfter(value, now)) return false
    }
    if (constraint === 'workdays') {
      // 1 = monday, 7 = sunday
      if (!isWeekend(value)) return false
    }
    if (constraint === 'weekends') {
      // 1 = monday, 7 = sunday
      if (isWeekend(value)) return false
    }
  }
  return true
}

const DateTimeWidget: React.FC<WidgetProps> = ({ value, onChange, options, formContext }) => {
  const [visible, setVisibility] = useState(false)

  const [referenceRef, setReferenceRef] = useState<any>(null)
  const [popperRef, setPopperRef] = useState<any>(null)

  const { styles, attributes } = usePopper(referenceRef, popperRef, {
    placement: 'top',
    modifiers: [
      {
        name: 'offset',
        enabled: true,
        options: {
          offset: [-125, 10],
        },
      },
    ],
  })

  function handleDropdownClick() {
    setVisibility(!visible)
  }
  console.log(value)
  const selectDateText = value?.length ? value : chatLabel({ ui_labels: [] }, formContext.localePrefs, 'select_date')

  const inputMethodContainer: any = document.querySelector('.botsi-web-client')
  console.log(options)
  if (inputMethodContainer)
    return (
      <>
        <div className="below">
          <button
            data-date-value={value}
            ref={setReferenceRef}
            onClick={handleDropdownClick}
            style={{ borderRadius: 'var(--botsquad-bubble-radius)', border: '1px solid var(--botsquad-ui-color)' }}
          >
            {selectDateText}
          </button>
        </div>
        {ReactDOM.createPortal(
          <div
            ref={setPopperRef}
            style={{
              ...styles.popper,
              display: visible ? 'initial' : 'none',
            }}
            {...attributes.popper}
          >
            <DatePicker
              selected={value ? new Date(value) : new Date()}
              onChange={value => {
                onChange(format(value || new Date(), 'yyyy-MM-dd'))
              }}
              inline
              locale={formContext.localePrefs[0]}
              filterDate={value => checkDateConstraints(value, (options.range || []) as string[])}
            />
          </div>,
          inputMethodContainer,
        )}
      </>
    )
  else return null
}

export default DateTimeWidget
