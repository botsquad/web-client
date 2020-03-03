import React from 'react'
import ReactGesture from 'react-gesture'

import { Close } from './icons'
import elementFactory from './elements'

export default class ChatModal extends React.Component {

  renderMessage(message, modalParams) {
    const cls = `content ${message.self ? 'self' : 'bot'} ` + message.type

    const attrs = {
      ...this.props,
      message,
      className: cls + (message.payload.class ? ' ' + message.payload.class : ''),
      modalParams,
      modal: this,
    }

    return elementFactory(message, attrs)
  }

  hide = () => {
    if (this.props.hiding) return
    this.props.handler.component.hideModal()
    this.props.handler.send('event', { name: '$modal_close', payload: { } })
  }

  componentDidMount() {
    // prevent scrolling of the body behind the modal, while the modal is opened
    this.refs.modalElement.addEventListener('touchmove', e => e.preventDefault(), false)
  }

  render() {
    const { message, hiding, modalParams } = this.props
    return (
      <div className={`chat-modal ${hiding ? 'hiding' : ''} ${message.payload.class || ''}`} ref="modalElement">
        <ReactGesture onSwipeUp={this.hide} onClick={this.hide} onTap={this.hide}>
          <div className="overlay" />
        </ReactGesture>
        <div className={`modal ${message.type}`} ref={(div) => { this.div = div }}>
          {this.renderMessage(message, modalParams)}
        </div>
        <div className="close">{Close}</div>
      </div>
    )
  }
}
