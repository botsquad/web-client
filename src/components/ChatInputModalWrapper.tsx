import { ChatHandler } from 'components'
import React from 'react'
import { useChatProps, useChatPropsUpdate } from './ChatContext'

import ChatInputModal, { ChatProps } from './ChatInputModal'

interface ChatInputModalWrapperProps {
  handler: ChatHandler
  cancelLabel: string
  children: (props: ChatProps) => React.ReactElement | null
}

const ChatInputModalWrapper: React.FC<ChatInputModalWrapperProps> = props => {
  const { inputMethodOverride } = useChatProps()
  const updater = useChatPropsUpdate()
  const cancel = () => {
    const { handler, cancelLabel } = props
    if (inputMethodOverride) {
      updater({ inputMethodOverride: null })
    } else {
      if (handler) handler.send('user_message', { type: 'cancel', text: cancelLabel })
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
