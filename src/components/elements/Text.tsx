import React from 'react'
import classNames from 'classnames'
import { TextUtil } from '@botsquad/sdk'
import Message, { Text as TextPayload } from './types'
import { CopyStr } from '../icons'
import { copyToClipboard } from '../../common/util'

interface Props {
  className: string
  message: Message<TextPayload>
}

const Text: React.FC<Props> = ({ className, message }) => {
  // This will work on any structure such as:
  // <div>
  //   <button>Copy</button>
  //   <any-elem>Text here</any-elem>
  // </div>
  const onClickCopyButton = React.useCallback(e => {
    if (!e.target) return
    const button = e.target.closest('.bsqd-copy-button')
    if (!button) return
    const textContainer = button.nextElementSibling
    if (!textContainer) return
    copyToClipboard(textContainer.textContent?.trim() || '')

    const div = document.createElement('div')
    div.classList.add('copied-to-clipboard')
    div.innerHTML = CopyStr
    button.parentElement.prepend(div)
    setTimeout(() => div.remove(), 500)
  }, [])

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
    textNode = (
      <span dangerouslySetInnerHTML={TextUtil.processText(message.payload.message, { copyButtonContent: CopyStr })} />
    )
  }

  return (
    <div onClick={onClickCopyButton} className={classNames(className, { 'large-emoji': emoji })}>
      {textNode}
    </div>
  )
}

export default Text
