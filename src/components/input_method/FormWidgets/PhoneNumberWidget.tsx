import { useMemo, forwardRef } from 'react'
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
  return forwardRef<HTMLInputElement, any>(function CustomInput(props, ref) {
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
  onChange: (value: string | undefined) => void
  formContext: { localePrefs: string[] }
  disabled: boolean
  autofocus: boolean
  placeholder: string
}

function PhoneNumberWidget(props: PhoneNumberWidgetProps) {
  const { value, onChange, formContext, disabled, autofocus, placeholder } = props

  const inputComponent = useMemo(
    () => makeInputComponent({ disabled, autofocus, placeholder }),
    [disabled, autofocus, placeholder],
  )

  return (
    <PhoneInput
      value={value}
      onChange={onChange}
      defaultCountry={defaultCountry(formContext.localePrefs)}
      inputComponent={inputComponent}
    />
  )
}

export default PhoneNumberWidget
