import React from 'react'
import Form from 'react-jsonschema-form'
import debounce from 'lodash/debounce'
import moment from 'dayjs'

import { chatLabel } from '../../common/labels'
import { Edit } from '../icons'
import InputMethodContainer from './InputMethodContainer'
import Widgets from './FormWidgets'

function elementValue(e) {
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

function removeEmpty(obj) {
  Object.keys(obj).forEach(function (key) {
    ;(obj[key] && typeof obj[key] === 'object' && removeEmpty(obj[key])) || (obj[key] === null && delete obj[key])
  })
  return obj
}

export default class extends React.Component {
  state = {
    hasSubmitted: false,
    formData: {},
    hasError: false,
    disabled: false,
  }

  componentWillMount() {
    const { default_value } = this.props.config
    if (default_value) {
      this.setState({ formData: removeEmpty(default_value) })
    }

    const { read_only_data } = this.props.message || {}
    if (read_only_data) {
      this.setState({ formData: read_only_data, disabled: true })
    }
  }

  submit = () => {
    this.setState({ hasSubmitted: true, disabled: true })
    // create a readable text for the form submit
    let text = [
      ...this._form.querySelectorAll(
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
    const data = this.state.formData
    this.props.inputModal.finish('message', { type: 'form', text, data }, this.props.config)
  }

  onChange = ({ formData }) => {
    this.setState({ formData })
  }

  setHasError = debounce(hasError => {
    this.setState({ hasError })
  }, 400)

  validate = errors => {
    this.setHasError(errors.length > 0)
    return errors.map(e => ({ property: e.property }))
  }

  getUiSchema() {
    return this.props.config.ui_schema || {}
  }

  render() {
    const { formData, disabled } = this.state
    const { config } = this.props

    let headerControl = null
    if (disabled) {
      headerControl = <span onClick={() => this.setState({ disabled: false, hasSubmitted: false })}>{Edit}</span>
    }

    if (!config || !config.schema) {
      return <span>Missing &#39;config.schema&#39; in form</span>
    }
    const formContext = { localePrefs: this.props.localePrefs }

    return (
      <InputMethodContainer
        {...this.props}
        className="form"
        headerControl={headerControl}
        below={
          !disabled && (
            <button disabled={this.state.hasError || this.state.hasSubmitted} onClick={this.submit}>
              {config.button_label || chatLabel(this, 'form_submit_button')}
            </button>
          )
        }
      >
        {this.state.error ? (
          <div>{this.state.error.message}</div>
        ) : (
          <Form
            liveValidate
            noHtml5Validate
            idPrefix={'bsqd-form'}
            formContext={formContext}
            showErrorList={false}
            schema={config.schema}
            uiSchema={this.getUiSchema()}
            formData={formData}
            disabled={disabled}
            onChange={this.onChange}
            transformErrors={this.validate}
            widgets={Widgets}
          >
            <span
              ref={r => {
                this._form = r ? r.parentNode : null
              }}
            />
          </Form>
        )}
      </InputMethodContainer>
    )
  }
}
