import React, { createRef, useRef } from 'react'
import ReactGesture from 'react-gesture'

import { Close } from './icons'
import elementFactory from './elements'
import Message, { Payload } from './elements/types'
import { ChatHandler } from 'components'

interface ChatModalProps {
  message: Message<Payload>
  hiding: boolean
  handler: ChatHandler
  modalParams: any
  onLoad: (() => void) | null
}

const ChatModal: React.FC<ChatModalProps> = props => {
  let div = createRef<HTMLDivElement>()
  const renderMessage = (message: Message<Payload>, modalParams: any) => {
    const cls = `content ${message.self ? 'self' : 'bot'} ` + message.type

    const attrs = {
      ...props,
      message,
      className: cls + (message.payload.class ? ' ' + message.payload.class : ''),
      modalParams,
      toggleModalPreferHeight,
    }

    return elementFactory(message, attrs)
  }

  const hide = () => {
    if (props.hiding) return
    props.handler.component.hideModal()
    props.handler.send('event', { name: '$modal_close', payload: {} })
  }

  const toggleModalPreferHeight = (condition: boolean) => {
    if (div && div.current) {
      div.current.classList.toggle('prefer-height', condition)
    }
  }

  const { message, hiding, modalParams } = props
  return (
    <div
      className={`chat-modal ${hiding ? 'hiding' : ''} ${message.payload.class || ''}`}
      onTouchMove={e => e.preventDefault()}
    >
      <ReactGesture onSwipeUp={hide} onClick={hide} onTap={hide}>
        <div className="overlay" />
      </ReactGesture>
      <div className={`modal ${message.type}`} ref={div}>
        {renderMessage(message, modalParams)}
      </div>
      <div className="close">{Close}</div>
    </div>
  )
}
export default ChatModal
