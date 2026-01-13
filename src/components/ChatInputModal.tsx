import React, { useEffect, useState } from 'react'
import findLastIndex from 'lodash/findLastIndex'
import isEqual from 'lodash/isEqual'
import inputMethodFactory from './input_method'
import { useChatProps } from './ChatContext'

export interface ChatInputProps {
  operatorActive: boolean
  isDisabled: (input: InputType) => boolean
}

interface ChatInputModalProps {
  onCancel: () => void
  onFinish: () => void
  children: (props: ChatInputProps) => React.ReactElement | null
}

type InputType = 'file' | 'text' | 'location' | 'image' | 'dialpad'

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
    hideInput,
    channel,
    operatorConversationId,
    operatorChatInputComponent: OperatorChatInputComponent,
  } = useChatProps()

  const [inputMethod, setInputMethod] = useState<any | null>(null)
  const [operatorActive, setOperatorActive] = useState(false)

  const inputs = React.useMemo(() => {
    const inputs: Record<InputType, boolean> = {
      file: settings?.layout === 'embedded' ? true : false,
      text: true,
      location: true,
      image: true,
      dialpad: true,
    }

    if (Array.isArray(settings?.chat_config?.disabled_inputs)) {
      const disabledInputs = settings.chat_config.disabled_inputs
      for (const input of disabledInputs) {
        inputs[input as InputType] = false
      }
    }

    if (Array.isArray(settings?.chat_config?.enabled_inputs)) {
      const enabledInputs = settings.chat_config.enabled_inputs
      for (const input of enabledInputs) {
        inputs[input as InputType] = true
      }
    }

    return inputs
  }, [settings])

  useEffect(() => {
    _checkShowInputModal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setTimeout(() => _checkShowInputModal(), 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props])

  const cancel = () => {
    props.onCancel()
    // forceUpdate()
  }

  const finish = (type: string, payload: any) => {
    handler?.send(type, payload)
    props.onFinish()
    // setTimeout(() => forceUpdate(), 0) Force Update somehow
  }

  const _checkShowInputModal = () => {
    const inputIndex = findLastIndex(events, { type: 'input_method' })
    const renderableIndex = findLastIndex(events, { renderable: true })

    const operatorActive = conversationMeta?.operator_present
    setOperatorActive(!!operatorActive)

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

  const isDisabled = React.useCallback((item: InputType) => {
    return inputs[item] === false
  }, [inputs])

  const allDisabled = () => {
    return hideInput || (isDisabled('text') && isDisabled('location') && isDisabled('image') && isDisabled('file'))
  }

  const inputProps = React.useMemo(() => ({ isDisabled, operatorActive }), [isDisabled, operatorActive])

  if (operatorConversationId) {
    if (channel && OperatorChatInputComponent) {
      return <OperatorChatInputComponent channel={channel} conversationMeta={conversationMeta} handler={handler} />
    }
    return null
  }
  const method = inputMethod || inputMethodOverride
  if (method) {
    const FactoryProps = { handler, inline, inputModal, settings, localePrefs, message }
    return inputMethodFactory(method, FactoryProps, { finish, cancel })
  }

  if (allDisabled() && !operatorActive) {
    return null
  }

  return props.children(inputProps)
}

export default ChatInputModal
