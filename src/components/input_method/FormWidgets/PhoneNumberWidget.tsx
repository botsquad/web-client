import React from 'react'
import PhoneInput, { Country } from 'react-phone-number-input'

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

export default PhoneNumberWidget
