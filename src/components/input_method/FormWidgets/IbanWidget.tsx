import { chatLabel } from '../../../common/labels'
import { electronicFormat, isValid, printFormat } from 'iban'
import React, { useEffect, useState } from 'react'
import { WidgetProps } from '@rjsf/utils'

const IbanWidget: React.FC<WidgetProps> = ({ value, onChange, disabled, autofocus, formContext, id, required }) => {
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

export default IbanWidget
