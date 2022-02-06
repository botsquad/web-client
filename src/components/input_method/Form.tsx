import format from 'date-fns/format'
import React, { ReactNode, useEffect, useState } from 'react'
import Form from 'react-jsonschema-form'
import debounce from 'lodash/debounce'

import { chatLabel } from '../../common/labels'
import { Edit } from '../icons'
import InputMethodContainer from './InputMethodContainer'
import Widgets from './FormWidgets'
import { useInputMethodProps } from './InputMethodContext'
import Message, { Payload } from 'components/elements/types'

function elementValue(e: any) {
  if (e.classList.contains('PhoneInputCountrySelect')) {
    return ''
  }
  if (e.tagName === 'BUTTON') {
    return e.innerText
  }
  if (e.type === 'checkbox') {
    return e.checked ? '✓' : ''
  }
  if (e.type === 'date') {
    return format(new Date(e.value), 'd/m/yyyy')
  }
  return e.value.trim()
}

function removeEmpty(obj: object) {
  Object.keys(obj).forEach(function (key) {
    ;(obj[key] && typeof obj[key] === 'object' && removeEmpty(obj[key])) || (obj[key] === null && delete obj[key])
  })
  return obj
}

interface ClientFormProps {
  message?: Message<Payload> | null
  settings: Record<string, any>
}

const ClientForm: React.FC<ClientFormProps> = ({ message, settings }) => {
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [formData, setFormData] = useState({})
  const [hasError, setHasError] = useState(false)
  const [widgetErrors, setWidgetErrors] = useState<Map<string, boolean>>(new Map<string, boolean>())
  const [disabled, setDisabled] = useState(false)
  const [error] = useState<any>(null)
  const [form, setForm] = useState<any>()

  const { config, inputModal, localePrefs } = useInputMethodProps()

  useEffect(() => {
    const { default_value } = config
    if (default_value) {
      setFormData(removeEmpty(default_value))
    }

    const { read_only_data } = message || {}
    if (read_only_data) {
      setFormData(read_only_data)
      setDisabled(true)
    }
  }, [])

  const submit = () => {
    setHasSubmitted(true)
    setDisabled(true)
    // create a readable text for the form submit
    let text = [
      ...form.querySelectorAll(
        'input[type=text],input[type=email],input[type=number],input[type=range],input[type=date],input[type=tel],textarea,select,input[type=checkbox],button[data-date-value]',
      ),
    ]
      .map(elementValue)
      .filter(f => f.length > 0)
      .slice(0, 3)
      .join(', ')
    if (!text.length) {
      text = '…'
    }
    const data = formData
    if (inputModal) inputModal.finish('message', { type: 'form', text, data }, config)
  }

  const onChange = ({ formData }: { formData: any }) => {
    setFormData(formData)
  }

  const setHasErrorDebounced = debounce(hasError => {
    setHasError(hasError)
  }, 400)

  const validate = (errors: any) => {
    setHasErrorDebounced(errors.length > 0 || widgetErrors.size > 0)
    return errors.map((e: any) => ({ property: e.property }))
  }

  const getUiSchema = () => {
    return config.ui_schema || {}
  }

  const setWidgetError = (id: string, error: boolean) => {
    if (error) {
      setWidgetErrors(new Map(widgetErrors?.set(id, error)))
    } else {
      widgetErrors.delete(id)
      setWidgetErrors(new Map(widgetErrors))
    }
  }

  let headerControl: ReactNode = null
  if (disabled) {
    headerControl = (
      <span
        onClick={() => {
          setDisabled(false)
          setHasSubmitted(false)
        }}
      >
        {Edit}
      </span>
    )
  }

  if (!config || !config.schema) {
    return <span>Missing &#39;config.schema&#39; in form</span>
  }
  const formContext = { localePrefs, setWidgetError }

  return (
    <InputMethodContainer
      className="form"
      headerControl={headerControl}
      below={
        !disabled && (
          <button disabled={hasError || hasSubmitted} onClick={submit}>
            {config.button_label || chatLabel(settings as { ui_labels: any }, localePrefs, 'form_submit_button')}
          </button>
        )
      }
    >
      {error ? (
        <div>{error.message}</div>
      ) : (
        <Form
          liveValidate
          noHtml5Validate
          idPrefix={'bsqd-form'}
          formContext={formContext}
          showErrorList={false}
          schema={config.schema}
          uiSchema={getUiSchema()}
          formData={formData}
          disabled={disabled}
          onChange={onChange}
          transformErrors={validate}
          widgets={Widgets}
        >
          <span
            ref={r => {
              setForm(r ? r.parentNode : null)
            }}
          />
        </Form>
      )}
    </InputMethodContainer>
  )
}

export default ClientForm
