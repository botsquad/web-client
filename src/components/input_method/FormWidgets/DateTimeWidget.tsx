import moment, { Moment } from 'moment'
import 'moment/locale/nl'
import 'moment/locale/de'
import 'moment/locale/fr'
import 'moment/locale/es'
import 'moment/locale/da'
import 'moment/locale/fi'
import 'moment/locale/ar'

import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import Datetime from 'react-datetime'
import { WidgetProps } from 'react-jsonschema-form'
import { usePopper } from 'react-popper'
import { chatLabel } from '../../../common/labels'

import 'react-datetime/css/react-datetime.css'

export const checkDateConstraints = (currentDate: string, constraints: string[] | string) => {
  if (typeof constraints === 'string') constraints = [constraints]

  const now = moment()
  const value = moment(currentDate)

  for (let constraint of constraints) {
    if (constraint === 'only_past') {
      if (!value.isBefore(now)) return false
    }
    if (constraint === 'only_future') {
      if (!value.isAfter(now)) return false
    }
    if (constraint === 'workdays') {
      // 1 = monday, 7 = sunday
      if (value.isoWeekday() > 5) return false
    }
    if (constraint === 'weekends') {
      // 1 = monday, 7 = sunday
      if (value.isoWeekday() <= 5) return false
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

  const selectDateText = value?.length
    ? moment(value).locale('en').format('D-M-Y')
    : chatLabel({ ui_labels: [] }, formContext.localePrefs, 'select_date')

  const inputMethodContainer: any = document.querySelector('.botsi-web-client')

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
              boxShadow: '0 0 4px 1px black',
            }}
            {...attributes.popper}
          >
            <Datetime
              initialValue={moment()}
              input={false}
              value={moment(value) || moment()}
              onChange={value => {
                onChange((value as Moment).format('YYYY-MM-DD'))
                setVisibility(false)
              }}
              locale={formContext.localePrefs[0]}
              isValidDate={value => checkDateConstraints(value, (options.constraints || []) as string[])}
              timeFormat={false}
              dateFormat={'D-M-Y'}
            />
          </div>,
          inputMethodContainer,
        )}
      </>
    )
  else return null
}

export default DateTimeWidget
