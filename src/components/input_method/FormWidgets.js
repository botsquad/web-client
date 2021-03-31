import React from 'react'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

function defaultCountry(localePrefs) {
  const lang = (localePrefs[0] || 'en').substr(0, 2)
  switch (lang) {
    case 'en':
      return 'GB'
    case 'da':
      return 'DK'
  }
  return lang.toUpperCase()
}

function makeInputComponent({ disabled, autofocus, placeholder }) {
  return React.forwardRef(function CustomInput(props, ref) {
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

class PhoneNumberWidget extends React.Component {
  constructor(props) {
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

export default { phone_number: PhoneNumberWidget }
