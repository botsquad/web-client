import React, { ReactNode, useEffect, useState } from 'react'
import Form from 'react-jsonschema-form'
import debounce from 'lodash/debounce'
import moment from 'dayjs'

import { chatLabel } from '../../common/labels'
import { Edit } from '../icons'
import InputMethodContainer from './InputMethodContainer'
import Widgets from './FormWidgets'

function elementValue(e: any) {
  if (e.classList.contains('PhoneInputCountrySelect')) {
    return ''
  }
  if (e.type === 'checkbox') {
    return e.checked ? '✓' : ''
  }
  if (e.type === 'date') {
    return moment(e.value).format('D/M/YYYY')
  }
  return e.value.trim()
}

function removeEmpty(obj: object) {
  Object.keys(obj).forEach(function (key) {
    ;(obj[key] && typeof obj[key] === 'object' && removeEmpty(obj[key])) || (obj[key] === null && delete obj[key])
  })
  return obj
}

interface FormProps {
  config: any
  message: any
  inputModal: any
  localePrefs: any
  settings: any
}

const ClientForm: React.FC<FormProps> = props => {
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [formData, setFormData] = useState({})
  const [hasError, setHasError] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [error, _] = useState<any>(null)
  const [form, setForm] = useState<any>()
  useEffect(() => {
    const { default_value } = props.config
    if (default_value) {
      setFormData(removeEmpty(default_value))
    }

    const { read_only_data } = props.message || {}
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
        'input[type=text],input[type=email],input[type=number],input[type=range],input[type=date],input[type=tel],textarea,select,input[type=checkbox]',
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
    props.inputModal.finish('message', { type: 'form', text, data }, props.config)
  }

  const onChange = ({ formData }) => {
    setFormData(formData)
  }

  const setHasErrorDebounced = debounce(hasError => {
    setHasError(hasError)
  }, 400)

  const validate = errors => {
    setHasErrorDebounced(errors.length > 0)
    return errors.map(e => ({ property: e.property }))
  }

  const getUiSchema = () => {
    return props.config.ui_schema || {}
  }

  const { config } = props

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
  const formContext = { localePrefs: props.localePrefs }

  return (
    <InputMethodContainer
      {...props}
      className="form"
      headerControl={headerControl}
      below={
        !disabled && (
          <button disabled={hasError || hasSubmitted} onClick={submit}>
            {config.button_label || chatLabel(props.settings, props.localePrefs, 'form_submit_button')}
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
