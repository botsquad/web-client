import moment, { Moment } from 'moment'
import React, { useEffect, useState } from 'react'
import Datetime from 'react-datetime'
import 'react-datetime/css/react-datetime.css'
import { Widget, WidgetProps } from 'react-jsonschema-form'
import PhoneInput, { Country } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

function defaultCountry(localePrefs: string[]): Country {
  const lang = (localePrefs[0] || 'en').substr(0, 2)
  switch (lang) {
    case 'en':
      return 'GB'
    case 'da':
      return 'DK'
  }
  return lang.toUpperCase() as Country
}

interface MakeInputComponentProps {
  disabled: boolean
  autofocus: boolean
  placeholder: string
}

function makeInputComponent({ disabled, autofocus, placeholder }: MakeInputComponentProps) {
  return React.forwardRef(function CustomInput(props: any, ref) {
    return (
      <input
        ref={ref}
        {...props}
        className="form-control"
        disabled={disabled}
        autoFocus={autofocus}
        placeholder={placeholder || '012-3456789'}
      />
    )
  })
}

interface PhoneNumberWidgetProps {
  value: string
  onChange: (value: string) => void
  formContext: { localePrefs: string[] }
  disabled: boolean
  autofocus: boolean
  placeholder: string
}

class PhoneNumberWidget extends React.Component<PhoneNumberWidgetProps> {
  inputComponent: any
  constructor(props: PhoneNumberWidgetProps) {
    super(props)
    this.inputComponent = makeInputComponent(this.props)
  }

  render() {
    const { value, onChange } = this.props
    return (
      <PhoneInput
        value={value}
        onChange={onChange}
        defaultCountry={defaultCountry(this.props.formContext.localePrefs)}
        inputComponent={this.inputComponent}
      />
    )
  }
}

const DateTimeWidget: React.FC<WidgetProps> = ({ value, onChange, options }) => {
  const [open, setOpen] = useState(false)

  const validate = (currentDate: string) => {
    if (options.range === 'only_past') {
      return moment(currentDate).isBefore(moment())
    } else {
      return moment(currentDate).isAfter(moment())
    }
  }

  const renderInput = (_: any, openCalendar: any, closeCalendar: any) => {
    return (
      <div className="below">
        <button
          style={{ border: '1px solid black', borderRadius: '25px' }}
          onClick={() => {
            open ? closeCalendar() : openCalendar()
            setOpen(open => !open)
          }}
          className="label"
        >
          {open ? 'Close Calendar' : 'Open Calendar'}
        </button>
      </div>
    )
  }

  return (
    <div style={{ height: 200 }}>
      <input style={{ display: 'none' }} value={value || moment().format('DD.MM.YYYY')} readOnly type="text"></input>
      <Datetime
        initialValue={moment()}
        value={moment(value, 'DD.MM.YYYY') || moment()}
        onChange={value => {
          onChange((value as Moment).format('DD.MM.YYYY'))
        }}
        renderInput={renderInput}
        isValidDate={validate}
        timeFormat={false}
      />
    </div>
  )
}

export default {
  phone_number: PhoneNumberWidget as unknown as Widget,
  date_picker: DateTimeWidget as unknown as Widget,
}
