import React from 'react'
import ReactGesture from 'react-gesture'

import { Close } from './icons'
import elementFactory from './elements'
import Message, { Payload } from './elements/types'

interface ChatModalProps {
  message: Message<Payload>
  hiding: boolean
  handler: any
  modalParams: any
  onLoad: () => void
  rest: any
}

export default class ChatModal extends React.Component<ChatModalProps> {
  div: HTMLDivElement
  renderMessage(message: Message<Payload>, modalParams: any) {
    const cls = `content ${message.self ? 'self' : 'bot'} ` + message.type

    const attrs = {
      ...this.props,
      message,
      className: cls + (message.payload.class ? ' ' + message.payload.class : ''),
      modalParams,
      modal: this,
      setModalDiv: this.setModalDiv,
      getModalDiv: this.getModalDiv,
    }

    return elementFactory(message, attrs)
  }

  hide = () => {
    if (this.props.hiding) return
    this.props.handler.component.hideModal()
    this.props.handler.send('event', { name: '$modal_close', payload: {} })
  }

  setModalDiv = (div: HTMLDivElement) => {
    this.div = div
  }

  getModalDiv = () => this.div

  render() {
    const { message, hiding, modalParams } = this.props
    return (
      <div
        className={`chat-modal ${hiding ? 'hiding' : ''} ${message.payload.class || ''}`}
        onTouchMove={e => e.preventDefault()}
      >
        <ReactGesture onSwipeUp={this.hide} onClick={this.hide} onTap={this.hide}>
          <div className="overlay" />
        </ReactGesture>
        <div
          className={`modal ${message.type}`}
          ref={div => {
            this.div = div
          }}
        >
          {this.renderMessage(message, modalParams)}
        </div>
        <div className="close">{Close}</div>
      </div>
    )
  }
}
