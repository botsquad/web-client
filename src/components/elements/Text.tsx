import React from 'react'
import classNames from 'classnames'
import { TextUtil } from '@botsquad/sdk'
import Message, { Text } from './types'

interface Props {
  className: string
  message: Message<Text>
}

const Text: React.FC<Props> = ({ className, message }) => {
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

export default Text
