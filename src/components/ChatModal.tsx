import React, { useRef } from 'react'

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
  settings: Record<string, any>
  localePrefs: string[]
}

const ChatModal: React.FC<ChatModalProps> = props => {
  const div = useRef<HTMLDivElement>(null)
  
  // Store the callback in a ref so it doesn't "access" the div ref during render
  const toggleModalPreferHeightRef = useRef((condition: boolean) => {
    setTimeout(() => {
      if (div.current) {
        div.current.classList.toggle('prefer-height', condition)
      }
    }, 0)
  })

  const renderMessage = (message: Message<Payload>, modalParams: any) => {
    const cls = `content ${message.self ? 'self' : 'bot'} ` + message.type

    const attrs = {
      ...props,
      message,
      className: cls + (message.payload.class ? ' ' + message.payload.class : ''),
      modalParams,
      toggleModalPreferHeight: toggleModalPreferHeightRef.current,
      settings: props.settings,
      localePrefs: props.localePrefs,
    }

    return elementFactory(message, attrs)
  }

  const hide = () => {
    if (props.hiding) return
    props.handler.component.hideModal()
    props.handler.send('user_event', { name: '$modal_close', payload: {} })
  }

  const { message, hiding, modalParams } = props
  return (
    <div
      className={`chat-modal ${hiding ? 'hiding' : ''} ${message.payload.class || ''}`}
      onTouchMove={e => e.preventDefault()}
    >
      <div className="overlay" onClick={hide} />
      <div className={`modal ${message.type}`} ref={div}>
        {/* eslint-disable-next-line react-hooks/refs */}
        {renderMessage(message, modalParams)}
      </div>
      <div className="close">{Close}</div>
    </div>
  )
}
export default ChatModal
