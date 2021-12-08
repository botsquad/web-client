import React, { useEffect, useRef, useState } from 'react'
import classNames from 'classnames'

import ChatMessages from './ChatMessages'
import ChatInput from './ChatInput'
import { deviceClasses } from '../common/util'
import { useChatProps } from './ChatContext'

const ChatWindow: React.FC = () => {
  const { online, settings } = useChatProps()
  const { ...allProps } = useChatProps()
  const [forceUpdater, setForceUpdater] = useState(false) // this is only used to force update the component
  useEffect(() => {
    window.addEventListener('orientationchange', () => setForceUpdater(!forceUpdater))
  }, [])
  const layout = `layout-${settings.layout || 'docked'}`
  const { scrollToBottom } = useChatProps()
  return (
    <div className={classNames('chat-window', { online }, layout, deviceClasses())}>
      <ChatMessages />
      {settings.layout !== 'embedded' ? <ChatInput /> : null}
    </div>
  )
}

export default ChatWindow
