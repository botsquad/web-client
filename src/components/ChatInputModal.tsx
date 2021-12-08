import React, { forwardRef, ReactNode, useEffect, useImperativeHandle, useState } from 'react'
import findLastIndex from 'lodash/findLastIndex'
import isEqual from 'lodash/isEqual'

import inputMethodFactory from './input_method'
import { useChatProps } from './ChatContext'

interface ChatInputModalProps {
  onCancel: () => void
  onFinish: () => void
  children?: ([string]: any) => any
}

const ChatInputModal: React.FC<ChatInputModalProps> = props => {
  const {
    handler,
    events,
    conversationMeta,
    scrollToBottom: chatMessagesScrollToBottom,
    settings,
    inputMethodOverride,
    inputModal,
    localePrefs,
    message,
    inline,
  } = useChatProps()

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
    handler.send(type, payload)
    props.onFinish()
    // setTimeout(() => forceUpdate(), 0) Force Update somehow
  }

  const _checkShowInputModal = () => {
    const inputIndex = findLastIndex(events, { type: 'input_method' })
    const renderableIndex = findLastIndex(events, { renderable: true })

    const operatorActive = conversationMeta?.operator_present
    setOperatorActive(operatorActive)

    if (inputIndex === -1 || inputIndex < renderableIndex || operatorActive) {
      if (inputMethod !== null) {
        setInputMethod(null)
        scrollToBottom()
      }
    } else {
      const event = events[inputIndex]
      const tempInputMethod = { ...event.payload, time: event.time || new Date().getTime() }
      if (!isEqual(inputMethod, tempInputMethod)) {
        setInputMethod(tempInputMethod)
        scrollToBottom()
      }
    }
  }

  const scrollToBottom = () => {
    if (chatMessagesScrollToBottom) {
      setTimeout(() => chatMessagesScrollToBottom(), 50)
    }
  }

  const isDisabled = (item: any) => {
    return settings.chat_config.disabled_inputs?.indexOf(item) >= 0
  }

  const allDisabled = () => {
    return settings.hide_input || (isDisabled('text') && isDisabled('location') && isDisabled('image'))
  }

  const method = inputMethod || inputMethodOverride
  if (method) {
    const FactoryProps = { handler, inline, inputModal, settings, localePrefs, message }
    return inputMethodFactory(method, FactoryProps, { finish, cancel })
  }

  if (allDisabled() && !operatorActive) {
    return null
  }

  return props.children(operatorActive)
}

export default ChatInputModal
