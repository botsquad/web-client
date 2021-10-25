import React from 'react'
import classNames from 'classnames'
import { TextUtil } from '@botsquad/sdk'

export default class Text extends React.PureComponent {
  render() {
    const { className, message } = this.props

    if (!message.payload.message || !message.payload.message.trim().length) {
      return null
    }

    const emoji = /^\p{Emoji}$/u.test(message.payload.message.trim())

    return (
      <div className={classNames(className, { 'large-emoji': emoji })}>
        <span dangerouslySetInnerHTML={TextUtil.processText(message.payload.message)} />
      </div>
    )
  }
}
