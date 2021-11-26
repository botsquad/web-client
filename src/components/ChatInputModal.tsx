import React, { forwardRef, ReactNode, useEffect, useImperativeHandle, useState } from 'react'
import findLastIndex from 'lodash/findLastIndex'
import isEqual from 'lodash/isEqual'

import inputMethodFactory from './input_method'

interface ChatInputModalProps {
  onCancel: () => void
  onFinish: () => void
  handler: any
  events: any
  conversationMeta: any
  chatMessages: any
  settings: any
  inputMethodOverride: any
  children?: ([string]: any) => any
}

const ChatInputModal: React.FC<ChatInputModalProps> = props => {
  const [inputMethod, setInputMethod] = useState<object | null>(null)
  const [operatorActive, setOperatorActive] = useState(false)

  useEffect(() => {
    _checkShowInputModal()
  }, [])

  useEffect(() => {
    setTimeout(() => _checkShowInputModal(), 0)
  }, [props])

  const cancel = () => {
    props.onCancel()
    // forceUpdate()
  }

  const finish = (type, payload) => {
    props.handler.send(type, payload)
    props.onFinish()
    // setTimeout(() => forceUpdate(), 0) Force Update somehow
  }

  const _checkShowInputModal = () => {
    const inputIndex = findLastIndex(props.events, { type: 'input_method' })
    const renderableIndex = findLastIndex(props.events, { renderable: true })

    const operatorActive = props.conversationMeta?.operator_present
    setOperatorActive(operatorActive)

    if (inputIndex === -1 || inputIndex < renderableIndex || operatorActive) {
      if (inputMethod !== null) {
        setInputMethod(null)
        scrollToBottom()
      }
    } else {
      const event = props.events[inputIndex]
      const tempInputMethod = { ...event.payload, time: event.time || new Date().getTime() }
      if (!isEqual(inputMethod, tempInputMethod)) {
        setInputMethod(tempInputMethod)
        scrollToBottom()
      }
    }
  }

  const scrollToBottom = () => {
    if (props.chatMessages) {
      setTimeout(() => props.chatMessages.scrollToBottom(), 50)
    }
  }

  const isDisabled = (item: any) => {
    return props.settings.chat_config.disabled_inputs?.indexOf(item) >= 0
  }

  const allDisabled = () => {
    return props.settings.hide_input || (isDisabled('text') && isDisabled('location') && isDisabled('image'))
  }

  const method = inputMethod || props.inputMethodOverride
  if (method) {
    return inputMethodFactory(method, props, { finish, cancel })
  }

  if (allDisabled() && !operatorActive) {
    return null
  }

  return props.children(operatorActive)
}

export default ChatInputModal
