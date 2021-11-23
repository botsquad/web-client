import React, { useEffect, useState } from 'react'
import classNames, { Argument } from 'classnames'

import ChatMessages from './ChatMessages'
import ChatInput from './ChatInput'
import { deviceClasses } from '../common/util'

interface ChatWindowProps {
  settings: { layout: string }
  online: Argument
}

const ChatWindow: React.FC<ChatWindowProps> = props => {
  const [forceUpdater, setForceUpdater] = useState(false) // this is only used to force update the component
  useEffect(() => {
    window.addEventListener('orientationchange', () => setForceUpdater(!forceUpdater))
  }, [])
  let chatMessages = React.createRef<any>()

  const { online } = props
  const layout = `layout-${props.settings.layout || 'docked'}`

  return (
    <div className={classNames('chat-window', { online }, layout, deviceClasses())}>
      <ChatMessages {...props} ref={chatMessages} />
      {props.settings.layout !== 'embedded' ? <ChatInput {...props} chatMessages={chatMessages.current} /> : null}
    </div>
  )
}

export default ChatWindow
