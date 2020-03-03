import React from 'react'
import Quagga from 'quagga'

import { scannerSound } from '../elements/util'
import InputMethodContainer from './InputMethodContainer'
import { chatLabel } from '../../common/labels'

export default class extends React.Component {

  state = {
    hasSubmitted: false,
    code: null
  }

  componentDidMount() {
    this.sound = scannerSound()
    const { readers } = this.props.config

    Quagga.init({
      inputStream: {
        type : "LiveStream",
        constraints: {
          width: 640,
          height: 480,
          facingMode: "environment" // or user
        }
      },
      locator: {
        patchSize: "medium",
        halfSample: false
      },
      numOfWorkers: 2,
      decoder: {
        readers : readers.map(x => x + "_reader")
      },
      locate: true
    }, (err) => {
      if (err) {
        return console.log(err);
      }
      Quagga.start()
      this.props.inputModal.scrollToBottom()
    });
    Quagga.onDetected(this._onDetected);
  }

  componentWillUnmount() {
    Quagga.offDetected(this._onDetected);
    Quagga.stop()
  }


  cancel = () => {
    this.props.inputModal.cancel()
  }

  submit = () => {
    this.setState({ hasSubmitted: true })
    this.props.inputModal.finish('message', { type: 'barcode', text: this.state.code, data: this.state.code })
  }

  _onDetected = (result) => {
    console.log(result)
    const { code } = result.codeResult

    if (!code || code === this.state.code) return
    this.setState({ code })
    this.sound.play()

    if (!this.hasConfirm() && !this._submitting) {
      this._submitting = true
      setTimeout(() => this.submit(), 400)
    }
  }

  hasConfirm() {
    return !!this.props.config.confirm
  }

  render() {
    const { button_label } = this.props.config

    return (
      <InputMethodContainer {...this.props}
        className={`barcode`}
        below={this.hasConfirm() ? <button disabled={!this.state.code || this.state.hasSubmitted} onClick={this.submit}>{button_label || chatLabel(this, 'form_submit_button')}</button> : null}
        onCancel={this.cancel}
      >
        <div id="interactive" className="viewport" />
        {this.state.code
         ? <div className="code">
           <span>{this.state.code}</span>
         </div>
         : null}
      </InputMethodContainer>
    )
  }

}
