import React from 'react'
import { useChatProps, useChatPropsUpdate } from './ChatContext'

import ChatInputModal from './ChatInputModal'

interface ChatInputModalWrapperProps {
  handler: any
  cancelLabel: string
  children: React.ReactNode
}
const ChatInputModalWrapper: React.FC<ChatInputModalWrapperProps> = props => {
  const { inputMethodOverride } = useChatProps()
  const updater = useChatPropsUpdate()
  const cancel = () => {
    const { handler, cancelLabel } = props
    if (inputMethodOverride) {
      updater({ inputMethodOverride: null })
    } else {
      handler.send('message', { type: 'cancel', text: cancelLabel })
    }
  }

  const finish = () => {
    updater({ inputMethodOverride: null })
  }

  const { children } = props
  return (
    <ChatInputModal onCancel={cancel} onFinish={finish}>
      {children}
    </ChatInputModal>
  )
}

export default ChatInputModalWrapper
