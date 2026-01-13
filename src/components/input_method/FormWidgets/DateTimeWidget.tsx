import moment, { Moment } from 'moment'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Datetime from 'react-datetime'
import { WidgetProps } from '@rjsf/utils'
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/react'
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

const DateTimeWidget: React.FC<WidgetProps> = ({ value, onChange, options, formContext = {} }) => {
  const [visible, setVisibility] = useState(false)

  const { refs, floatingStyles, update } = useFloating({
    placement: 'top',
    middleware: [offset(8), flip(), shift()],
    open: visible,
    whileElementsMounted: autoUpdate,
    strategy: 'fixed',
  })

  // Force update when visibility changes to ensure correct positioning
  useEffect(() => {
    if (visible && update) {
      update()
    }
  }, [visible, update])

  function handleDropdownClick() {
    setVisibility(!visible)
  }

  const localePrefs = (formContext as any)?.localePrefs || ['en']
  const selectDateText = value?.length
    ? moment(value).format('D-M-Y')
    : chatLabel({ ui_labels: [] }, localePrefs, 'select_date')

  const inputMethodContainer: any = document.querySelector('.botsi-web-client')

  if (inputMethodContainer)
    return (
      <>
        <div className="below">
          <button
            data-date-value={value}
            ref={refs.setReference}
            onClick={handleDropdownClick}
            style={{
              borderRadius: 'var(--botsquad-bubble-radius)',
              border: '1px solid var(--botsquad-ui-color)',
              minHeight: '48px',
              fontSize: '16px',
              padding: '12px 16px',
              touchAction: 'manipulation',
            }}
          >
            {selectDateText}
          </button>
        </div>
        {createPortal(
          <div
            /* eslint-disable-next-line react-hooks/refs */
            ref={refs.setFloating}
            style={{
              ...floatingStyles,
              display: visible ? 'initial' : 'none',
              boxShadow: '0 0 4px 1px black',
            }}
            className="datetime-widget-popup"
          >
            <style>{`
              .datetime-widget-popup .rdtPicker td,
              .datetime-widget-popup .rdtPicker th {
                min-width: 44px;
                height: 44px !important;
                padding: 8px;
                font-size: 16px;
              }
            `}</style>
            <Datetime
              initialValue={moment()}
              input={false}
              value={moment(value) || moment()}
              onChange={value => {
                onChange((value as Moment).format('YYYY-MM-DD'))
                setVisibility(false)
              }}
              locale={localePrefs[0]}
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
