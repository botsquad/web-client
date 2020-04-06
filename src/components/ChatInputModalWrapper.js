import React from 'react'

import ChatInputModal from './ChatInputModal'

export default class ChatInputModalWrapper extends React.Component {
  cancel = () => {
    const { component, cancelLabel } = this.props
    if (component.state.inputMethodOverride) {
      component.setState({ inputMethodOverride: null })
    } else {
      component.props.handler.send('message', { type: 'cancel', text: cancelLabel })
    }
  }

  finish = () => {
    const { component } = this.props
    component.setState({ inputMethodOverride: null })
  }

  render() {
    const { children, component } = this.props
    return (
      <ChatInputModal {...component.props} onCancel={this.cancel} onFinish={this.finish} inputMethodOverride={component.state.inputMethodOverride}>
        {children}
      </ChatInputModal>
    )
  }
}
