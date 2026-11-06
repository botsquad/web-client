import { useMemo, forwardRef } from 'react'
import { WidgetProps } from '@rjsf/utils'
import PhoneInput, { Country, isSupportedCountry } from 'react-phone-number-input'

import { getFormContext } from './formContext'

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

// An explicit `ui:options.default_country` (ISO 3166-1 alpha-2, e.g. "NL") wins
// over the locale-derived default. Unsupported values are ignored.
function explicitCountry(value: unknown): Country | undefined {
  if (typeof value !== 'string') return undefined
  const code = value.trim().toUpperCase()
  return isSupportedCountry(code) ? (code as Country) : undefined
}

interface MakeInputComponentProps {
  disabled: boolean
  autofocus: boolean
  placeholder: string
  id: string
}

function makeInputComponent({ disabled, autofocus, placeholder, id }: MakeInputComponentProps) {
  return forwardRef<HTMLInputElement, any>(function CustomInput(props, ref) {
    return (
      <input
        ref={ref}
        {...props}
        id={id}
        className="form-control"
        disabled={disabled}
        autoFocus={autofocus}
        placeholder={placeholder || '012-3456789'}
      />
    )
  })
}

function PhoneNumberWidget(props: WidgetProps) {
  const { value, onChange, registry, options, disabled, autofocus, placeholder, id } = props

  const inputComponent = useMemo(
    () => makeInputComponent({ disabled: !!disabled, autofocus: !!autofocus, placeholder: placeholder ?? '', id }),
    [disabled, autofocus, placeholder, id],
  )

  const { localePrefs } = getFormContext(registry)

  return (
    <PhoneInput
      value={value}
      onChange={onChange}
      defaultCountry={explicitCountry(options.default_country) || defaultCountry(localePrefs)}
      inputComponent={inputComponent}
    />
  )
}

export default PhoneNumberWidget
