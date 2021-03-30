import React from 'react'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

function makeInputComponent({ disabled, autofocus, placeholder }) {
  return React.forwardRef(function CustomInput(props, ref) {
    return (
      <input
        ref={ref}
        {...props}
        disabled={disabled}
        autoFocus={autofocus}
        placeholder={placeholder || 'Enter phone number'}
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
    return <PhoneInput value={value} onChange={onChange} defaultCountry="NL" inputComponent={this.inputComponent} />
  }
}

export default { phone_number: PhoneNumberWidget }
