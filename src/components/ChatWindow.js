import React from 'react'
import classNames from 'classnames'

import ChatMessages from './ChatMessages'
import ChatInput from './ChatInput'
import { deviceClasses } from '../common/util'

export default class ChatWindow extends React.Component {

  componentDidMount() {
    window.addEventListener('orientationchange', () => this.forceUpdate())
  }

  render() {
    const { online } = this.props

    return (
      <div className={classNames('chat-window', { online }, deviceClasses())}>
        <ChatMessages {...this.props} ref={r => this.chatMessages = r } />
        {this.props.settings.layout !== 'embedded'
         ? <ChatInput {...this.props} chatMessages={this.chatMessages} />
         : null}
      </div>
    )
  }
}
