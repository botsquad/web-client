import React from 'react'
import QrReader from 'react-qr-reader'

import { scannerSound } from '../elements/util'
import InputMethodContainer from './InputMethodContainer'
import { chatLabel } from '../../common/labels'

export default class extends React.Component {

  state = {
    hasSubmitted: false,
    code: null,
    permissionRequest: false
  }

  componentDidMount() {
    this.sound = scannerSound()
  }

  cancel = () => {
    this.props.inputModal.cancel()
  }

  submit = () => {
    this.setState({ hasSubmitted: true })
    this.props.inputModal.finish('message', { type: 'qr', text: this.state.code, data: this.state.code }, this.props.config)
  }

  handleScan = (code) => {
    if (!code || code === this.state.code) return
    this.setState({ code })
    this.sound.play()

    if (!this.hasConfirm()) {
      setTimeout(() => this.submit(), 400)
    }
  }

  handleError = (err) => {
    console.error(err)
    if (err.name === 'NotReadableError' && cordova) {
      this.setState({ permissionRequest: true })
      cordova.plugins.permissions.requestPermission(cordova.plugins.permissions.CAMERA, () => this.setState({ permissionRequest: false }), e => console.log(e))
    }
  }

  hasConfirm() {
    return !!this.props.config.confirm
  }

  render() {
    if (this.state.permissionRequest) {
      return <p>Requesting permission…</p>
    }
    const { button_label } = this.props.config

    return (
      <InputMethodContainer {...this.props}
        className={`qr`}
        below={this.hasConfirm() ? <button disabled={!this.state.code || this.state.hasSubmitted} onClick={this.submit}>{button_label || chatLabel(this, 'form_submit_button')}</button> : null}
        onCancel={this.cancel}
      >
        <QrReader
          delay={300}
          facingMode='environment'
          showViewFinder
          onError={this.handleError}
          onScan={this.handleScan}
          style={{ width: '100%', height: '100%' }}
        />
        {this.state.code
         ? <div className="code">
           <span>{this.state.code}</span>
         </div>
         : null}
      </InputMethodContainer>
    )
  }
}
