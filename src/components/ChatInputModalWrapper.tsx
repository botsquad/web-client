import React from 'react'

import ChatInputModal from './ChatInputModal'

interface ChatInputModalWrapperProps {
  inputMethodOverride: any
  setInputMethodOverride: any
  handler: any
  cancelLabel: string
  componentProps: any
}
//FIXME: All Modals need to extract their functions not themselves
const ChatInputModalWrapper: React.FC<ChatInputModalWrapperProps> = props => {
  const cancel = () => {
    const { inputMethodOverride, setInputMethodOverride, handler, cancelLabel } = props
    if (inputMethodOverride) {
      setInputMethodOverride(null)
    } else {
      handler.send('message', { type: 'cancel', text: cancelLabel })
    }
  }

  const finish = () => {
    const { setInputMethodOverride } = props
    setInputMethodOverride(null)
  }

  const { children } = props
  return (
    <ChatInputModal
      {...props.componentProps}
      onCancel={cancel}
      onFinish={finish}
      inputMethodOverride={props.inputMethodOverride}
    >
      {children}
    </ChatInputModal>
  )
}

export default ChatInputModalWrapper
