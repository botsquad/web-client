import React from 'react'

import ChatInputModal from './ChatInputModal'

interface ChatInputModalWrapperProps {
  inputMethodOverride: any
  setInputMethodOverride: any
  component: any
  cancelLabel: string
  componentProps: any
}

const ChatInputModalWrapper: React.FC<ChatInputModalWrapperProps> = props => {
  const cancel = () => {
    const { component, cancelLabel } = props
    if (component.state.inputMethodOverride) {
      component.setState({ inputMethodOverride: null })
    } else {
      component.props.handler.send('message', { type: 'cancel', text: cancelLabel })
    }
  }

  const finish = () => {
    const { component } = props
    component.setState({ inputMethodOverride: null })
  }

  const { children, component } = props
  return (
    <ChatInputModal
      {...component.props}
      onCancel={cancel}
      onFinish={finish}
      inputMethodOverride={component.state.inputMethodOverride}
    >
      {children}
    </ChatInputModal>
  )
}

export default ChatInputModalWrapper
