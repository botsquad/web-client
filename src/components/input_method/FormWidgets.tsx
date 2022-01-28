import 'react-datetime/css/react-datetime.css'
import { chatLabel } from '../../common/labels'
import { electronicFormat, isValid, printFormat } from 'iban'
import React, { useEffect, useState } from 'react'
import { Widget, WidgetProps } from 'react-jsonschema-form'
import PhoneInput, { Country } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import DateTimeWidget from './FormWidgets/DateTimeWidget'

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

const IbanFormWidget: React.FC<WidgetProps> = ({ value, onChange, disabled, autofocus, formContext, id, required }) => {
  const [error, setError] = useState(false)
  const onIBANChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = electronicFormat(e.target.value)
    onChange(value)
  }

  useEffect(() => {
    setTimeout(() => formContext.setWidgetError(id, error), 0)
  }, [error])

  useEffect(() => {
    // if the value is not a valid iban and the value is not empty then there is an error
    // if the value is required and the value is empty then there is an error
    if ((!isValid(value) && value !== '' && value) || (required && value === '' && !value)) {
      setError(true)
    } else {
      setError(false)
    }
  }, [value])

  const validate = () => {
    if (error && value !== '' && value) {
      return <div style={{ color: 'red' }}>{chatLabel({ ui_labels: [] }, formContext.localePrefs, 'invalid_iban')}</div>
    }
    return null
  }

  return (
    <div key={id}>
      <input
        type="text"
        className="form-control"
        onChange={onIBANChange}
        value={printFormat(value || '')}
        disabled={disabled}
        autoFocus={autofocus}
      ></input>
      {validate()}
    </div>
  )
}
export default {
  phone_number: PhoneNumberWidget as unknown as Widget,
  iban_number: IbanFormWidget as unknown as Widget,
  date_picker: DateTimeWidget as unknown as Widget,
}
