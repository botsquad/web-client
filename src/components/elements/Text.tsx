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

  let textNode = (
    <span>
      <p>{message.payload.message}</p>
    </span>
  )
  if (message.payload.input_type !== 'dtmf') {
    textNode = <span dangerouslySetInnerHTML={TextUtil.processText(message.payload.message)} />
  }
  return <div className={classNames(className, { 'large-emoji': emoji })}>{textNode}</div>
}

export default Text
