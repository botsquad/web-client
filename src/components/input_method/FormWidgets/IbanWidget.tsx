import { chatLabel } from '../../../common/labels'
import { electronicFormat, isValid, printFormat } from 'iban'
import React, { useEffect, useMemo } from 'react'
import { WidgetProps } from '@rjsf/utils'

const IbanWidget: React.FC<WidgetProps> = ({ value, onChange, disabled, autofocus, formContext = {}, id, required }) => {
  const error = useMemo(() => {
    // if the value is not a valid iban and the value is not empty then there is an error
    // if the value is required and the value is empty then there is an error
    if ((!isValid(value) && value !== '' && value) || (required && value === '' && !value)) {
      return true
    }
    return false
  }, [value, required])

  const onIBANChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = electronicFormat(e.target.value)
    onChange(value)
  }

  useEffect(() => {
    if ((formContext as any)?.setWidgetError) {
      setTimeout(() => (formContext as any).setWidgetError(id, error), 0)
    }
  }, [error, formContext, id])

  const localePrefs = (formContext as any)?.localePrefs || ['en']

  const validate = () => {
    if (error && value !== '' && value) {
      return <div style={{ color: 'red' }}>{chatLabel({ ui_labels: [] }, localePrefs, 'invalid_iban')}</div>
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

export default IbanWidget
