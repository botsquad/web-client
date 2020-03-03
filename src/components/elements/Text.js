import React from 'react'
import { processText } from './util'

export default class Text extends React.PureComponent {
  render() {
    const { className, message } = this.props

    if (!message.payload.message || !message.payload.message.trim().length) {
      return null
    }

    return (
      <div className={className}>
        <span dangerouslySetInnerHTML={processText(message.payload.message)} />
      </div>
    )
  }
}
