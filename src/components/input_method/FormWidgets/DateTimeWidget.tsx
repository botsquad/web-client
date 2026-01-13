import moment, { Moment } from 'moment'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import Datetime from 'react-datetime'
import { WidgetProps } from '@rjsf/utils'
import { useFloating, offset, flip, shift } from '@floating-ui/react'
import { chatLabel } from '../../../common/labels'

export const checkDateConstraints = (currentDate: string, constraints: string[] | string) => {
  if (typeof constraints === 'string') constraints = [constraints]

  const now = moment()
  const value = moment(currentDate)

  for (const constraint of constraints) {
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

  const { refs, floatingStyles } = useFloating({
    placement: 'top',
    middleware: [
      offset({ mainAxis: 10, crossAxis: -125 }),
      flip(),
      shift(),
    ],
  })

  function handleDropdownClick() {
    setVisibility(!visible)
  }

  const selectDateText = value?.length
    ? moment(value).format('D-M-Y')
    : chatLabel({ ui_labels: [] }, formContext.localePrefs, 'select_date')

  const inputMethodContainer: any = document.querySelector('.botsi-web-client')

  if (inputMethodContainer)
    return (
      <>
        <div className="below">
          <button
            data-date-value={value}
            ref={refs.setReference}
            onClick={handleDropdownClick}
            style={{ borderRadius: 'var(--botsquad-bubble-radius)', border: '1px solid var(--botsquad-ui-color)' }}
          >
            {selectDateText}
          </button>
        </div>
        {createPortal(
          <div
            ref={refs.setFloating}
            style={{
              ...floatingStyles,
              display: visible ? 'initial' : 'none',
              boxShadow: '0 0 4px 1px black',
            }}
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
