import React from 'react'
import { TextUtil } from '@botsquad/sdk'

export default class Text extends React.PureComponent {
  render() {
    const { className, message } = this.props

    if (!message.payload.message || !message.payload.message.trim().length) {
      return null
    }

    return (
      <div className={className}>
        <span dangerouslySetInnerHTML={TextUtil.processText(message.payload.message)} />
      </div>
    )
  }
}
