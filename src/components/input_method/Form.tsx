import React, { ReactNode, useState } from 'react'
import Form, { FormProps } from '@rjsf/core'
import validator from '@rjsf/validator-ajv8'
import debounce from 'lodash/debounce'
import moment from 'moment'

import { chatLabel } from '../../common/labels'
import { Edit } from '../icons'
import InputMethodContainer from './InputMethodContainer'
import Widgets from './FormWidgets'
import Templates from './FormTemplates'
import { useInputMethodProps } from './InputMethodContext'
import Message, { Payload } from 'components/elements/types'
import { InputMethodForm } from 'show_types'

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
    return moment(e.value).format('D/M/YYYY')
  }
  return e.value.trim()
}

function elementLabel(e: any) {
  if ('labels' in e) {
    return [...e.labels].map(label => label.textContent.replace(/[*]$/, '')).join(', ') + ': '
  }

  return ''
}

function removeEmpty(obj: any) {
  if (obj === null) {
    return null
  }
  if (typeof obj === 'object') {
    Object.keys(obj).forEach(function (key) {
      if (obj[key] && typeof obj[key] === 'object') {
        removeEmpty(obj[key])
      } else if (obj[key] === null) {
        delete obj[key]
      }
    })
  }
  return obj
}

interface ClientFormProps {
  message?: Message<Payload> | null
  settings: Record<string, any>
}

const ClientForm: React.FC<ClientFormProps> = ({ message, settings }) => {
  const { config, inputModal, localePrefs } = useInputMethodProps<InputMethodForm>()

  // Initialize form data from config or message  
  const getInitialFormData = () => {
    const { default_value } = config
    const { read_only_data } = message || {}

    if (read_only_data) {
      return read_only_data
    }
    if (typeof default_value !== 'undefined') {
      return removeEmpty(default_value)
    }
    return undefined
  }

  const getInitialDisabled = () => {
    const { read_only_data } = message || {}
    return !!read_only_data
  }

  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [formData, setFormData] = useState(getInitialFormData)
  const [hasError, setHasError] = useState(false)
  const [widgetErrors, setWidgetErrors] = useState<Map<string, boolean>>(new Map<string, boolean>())
  const [disabled, setDisabled] = useState(getInitialDisabled)
  const [error] = useState<any>(null)
  const [form, setForm] = useState<any>()

  const submit = () => {
    setHasSubmitted(true)
    setDisabled(true)
    // create a readable text for the form submit
    let text = [
      ...form.querySelectorAll(
        'input[type=text],input[type=email],input[type=number],input[type=range],input[type=date],input[type=tel],textarea,select,input[type=checkbox],button[data-date-value]',
      ),
    ]
      .map(e => elementLabel(e) + elementValue(e))
      .filter(f => f.length > 0)
      .slice(0, 3)
      .join(', ')
    if (!text.length) {
      text = '…'
    }
    const data = formData
    if (inputModal) inputModal.finish('user_message', { type: 'form', text, data }, config)
  }

  type OnChange = Exclude<FormProps['onChange'], undefined>

  const onChange = React.useCallback<OnChange>(data => {
    setFormData(data.formData)
  }, [])

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
          validator={validator}
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
          templates={Templates}
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
