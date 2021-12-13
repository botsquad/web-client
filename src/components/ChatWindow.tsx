import React, { useEffect, useState } from 'react'
import classNames from 'classnames'

import ChatMessages from './ChatMessages'
import ChatInput from './ChatInput'
import { deviceClasses } from '../common/util'
import { useChatProps, useChatPropsUpdate } from './ChatContext'

const ChatWindow: React.FC = () => {
  const { online, settings } = useChatProps()
  const [forceUpdater, setForceUpdater] = useState(false) // this is only used to force update the component
  useEffect(() => {
    window.addEventListener('orientationchange', () => setForceUpdater(!forceUpdater))
  }, [])
  const allProps = useChatProps()
  const layout = `layout-${settings.layout || 'docked'}`
  return (
    <div className={classNames('chat-window', { online }, layout, deviceClasses())}>
      <ChatMessages {...allProps} updater={useChatPropsUpdate()} />
      {settings.layout !== 'embedded' ? <ChatInput /> : null}
    </div>
  )
}

export default ChatWindow
