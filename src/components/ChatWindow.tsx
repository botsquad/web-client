import React, { useEffect, useRef, useState } from 'react'
import classNames, { Argument } from 'classnames'

import ChatMessages from './ChatMessages'
import ChatInput from './ChatInput'
import { deviceClasses } from '../common/util'
import { useChatProps } from './ChatContext'

interface ChatWindowProps {
  settings: { layout: string }
  online: Argument
}

const ChatWindow: React.FC<ChatWindowProps> = props => {
  console.log('[Passed Props]', props)
  const { online, settings } = useChatProps()
  const { ...allProps } = useChatProps()
  console.log('[All Props]', allProps)
  const [forceUpdater, setForceUpdater] = useState(false) // this is only used to force update the component
  useEffect(() => {
    window.addEventListener('orientationchange', () => setForceUpdater(!forceUpdater))
  }, [])
  let chatMessages = useRef<any>()

  const layout = `layout-${settings.layout || 'docked'}`

  return (
    <div className={classNames('chat-window', { online }, layout, deviceClasses())}>
      <ChatMessages {...props} ref={chatMessages} />
      {props.settings.layout !== 'embedded' ? <ChatInput {...props} chatMessages={chatMessages.current} /> : null}
    </div>
  )
}

export default ChatWindow
