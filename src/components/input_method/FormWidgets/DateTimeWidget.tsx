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
import 'react-datetime/css/react-datetime.css'
import { WidgetProps } from 'react-jsonschema-form'
import 'react-phone-number-input/style.css'
import { usePopper } from 'react-popper'
import { chatLabel } from '../../../common/labels'

const DateTimeWidget: React.FC<WidgetProps> = ({ value, onChange, options, formContext }) => {
  const [visible, setVisibility] = useState(false)

  const [referenceRef, setReferenceRef] = useState<any>(null)
  const [popperRef, setPopperRef] = useState<any>(null)

  const validate = (currentDate: string) => {
    if (options.range === 'only_past') {
      return moment(currentDate).isBefore(moment())
    } else {
      return moment(currentDate).isAfter(moment())
    }
  }

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
  const selectDateText = value || chatLabel({ ui_labels: [] }, formContext.localePrefs, 'select_date')
  const inputMethodContainer: any = document.querySelector('.botsi-web-client')
  console.log(formContext.localePrefs)

  if (inputMethodContainer)
    return (
      <>
        <div className="below">
          <button
            ref={setReferenceRef}
            onClick={handleDropdownClick}
            style={{ borderRadius: 'var(--botsquad-bubble-radius)', border: '1px solid var(--botsquad-ui-color)' }}
          >
            {selectDateText}
          </button>
        </div>
        <input style={{ display: 'none' }} value={value || moment().format('DD-MM-YYYY')} readOnly type="text"></input>
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
              value={moment(value, 'DD-MM-YYYY') || moment()}
              onChange={value => {
                onChange((value as Moment).format('DD-MM-YYYY'))
                setVisibility(false)
              }}
              locale={formContext.localePrefs[0]}
              isValidDate={validate}
              timeFormat={false}
            />
          </div>,
          inputMethodContainer,
        )}
      </>
    )
  else return null
}

export default DateTimeWidget
