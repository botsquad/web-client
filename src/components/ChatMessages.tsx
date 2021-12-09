import React, { useEffect, useState } from 'react'
import isEqual from 'lodash/isEqual'
import { EventEmitter, EventSubscription } from 'fbemitter'

import QuickReplies from './QuickReplies'
import ChatInput from './ChatInput'
import ElementFactory from './elements'
import { shortDateTimeFormat } from '../common/util'
import { Payload } from './elements/types'
import { useChatProps, useChatPropsUpdate } from './ChatContext'

export const chatMessagesEvents = new EventEmitter()

function messageHasModal({ type, payload }: { type: string; payload: Payload }) {
  if (type === 'location') {
    return true
  }
  if (type === 'media') {
    return payload.kind === 'web' || payload.kind === 'image'
  }
  if (type === 'template' && payload.template_type === 'gallery') {
    return true
  }
  return false
}

const ChatMessages: React.FC = () => {
  const {
    handler,
    settings,
    host,
    hideAvatars,
    elementFactory,
    typingAs,
    botAvatar,
    channel,
    upload,
    typing,
    userAvatar,
    events,
    conversationMeta,
    modalParams,
  } = useChatProps()

  const [messageGroups, setMessageGroups] = useState<any[]>([])
  const [lastMessage, setLastMessage] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [scrollToBottomListener, setScrollToBottomListener] = useState<EventSubscription>(null)
  const [scrollToBottomAtStart, setScrollToBottomAtStart] = useState(true)
  const updater = useChatPropsUpdate()
  let wrapperElement = React.createRef<HTMLDivElement>()

  const scrollToBottom = () => {
    const { layout } = settings
    if (layout === 'embedded' && host) {
      // scroll the document
      host.scrollToBottom()
    } else if (wrapperElement.current) {
      wrapperElement.current.scrollTop = wrapperElement.current.scrollHeight
    }
  }

  useEffect(() => {
    groupMessages()
    setScrollToBottomListener(chatMessagesEvents.addListener('scrollToBottom', scrollToBottom))
    updater({ scrollToBottom })
    return () => {
      scrollToBottomListener.remove()
    }
  }, [])

  // INITIAL SCROLL
  useEffect(() => {
    if (scrollToBottomAtStart && messageGroups.length !== 0) {
      scrollToBottom()
      setScrollToBottomAtStart(false)
    }
  }, [messageGroups])

  useEffect(() => {
    setLoading(false)
    groupMessages()
  }, [useChatProps()])

  useEffect(() => {
    if (settings.layout === 'embedded') {
      // do not autoload history, for now
      return
    }
    const wrapper = wrapperElement.current
    if (wrapper && wrapper.scrollHeight <= wrapper.offsetHeight && channel && channel.hasMoreHistory() && !loading) {
      loadHistory()
    }
  }, [useChatProps(), wrapperElement])

  const _connectFormEvents = (events: any) => {
    const formLookup = {}
    for (const m of events) {
      if (m.type === 'template' && m.payload.template_type === 'input_method') {
        formLookup[m.payload.template_id] = m
      }
      if (m.type === 'user_event' && m.payload.name === '$form') {
        const { _template_id, ...data } = m.payload.payload || JSON.parse(m.payload.json)
        if (_template_id && formLookup[_template_id]) {
          formLookup[_template_id].read_only_data = data
        }
      }
    }
  }

  const groupMessages = () => {
    // convert all events into groups of messages
    const messageGroups = []
    let lastMessage = false
    let lastModalMessage = null
    let currentGroup: any = false

    _connectFormEvents(events)

    for (const message of events) {
      if (!message.renderable) {
        continue
      }
      if (currentGroup === false || !isGroupable(message, lastMessage)) {
        if (currentGroup !== false) {
          messageGroups.unshift(currentGroup)
        }
        currentGroup = {
          avatar: message.self ? userAvatar : message.as ? message.as.profile_picture || botAvatar : botAvatar,
          messages: [message],
          class: message.payload.class || null,
          as: message.as,
        }
      } else {
        currentGroup.messages.push(message)
      }
      if (messageHasModal(message)) {
        lastModalMessage = message
      }
      lastMessage = message
    }
    if (currentGroup !== false) {
      messageGroups.unshift(currentGroup)
    }
    if (lastMessage === null) {
      setTimeout(() => scrollToBottom(), 50)
      setTimeout(() => scrollToBottom(), 500)
    }

    const hasReadUntil =
      conversationMeta && conversationMeta.unread_message_count > 0 ? conversationMeta.read_until : null
    if (hasReadUntil) {
      let insertIdx = messageGroups.length
      const hasReadTime = Date.parse(hasReadUntil)
      while (insertIdx > 1 && messageGroups[insertIdx - 1].messages[0].time >= hasReadTime) insertIdx--
      if (insertIdx > 0 && insertIdx < messageGroups.length) {
        messageGroups.splice(insertIdx, 0, { hasReadUntil })
      }
    }

    if (handler) {
      if (handler._lastModal !== lastModalMessage) {
        const newHandler = handler
        newHandler._lastModal = lastModalMessage //FIXME: Do not add new properties to already used objects
        updater({ handler: newHandler })
      }
    }

    setMessageGroups(messageGroups)
    setLastMessage(lastMessage)
  }

  const renderMessageGroup = (group, index) => {
    if (group.hasReadUntil) {
      return (
        <div key="hasReadUntil" className="has-read-until">
          <span>{shortDateTimeFormat(group.hasReadUntil)}</span>
        </div>
      )
    }

    const name = group.as ? (group.as.first_name + ' ' + (group.as.last_name || '')).trim() : null

    return (
      <div key={index} className={`bubble-group ${group.messages[0].self ? 'self' : 'bot'} ${group.class || ''}`}>
        {!hideAvatars && group.avatar ? (
          <div className="as">
            <div
              className="avatar"
              style={{ backgroundImage: group.avatar ? `url(${group.avatar})` : null }}
              title={name}
            />
            {name?.length ? <div className="name">{name}</div> : null}
          </div>
        ) : null}
        <div className="bubble-container">{group.messages.map(renderMessage)}</div>
      </div>
    )
  }

  const isRecent = message => {
    if (!message) {
      return false
    }
    return new Date().getTime() - message.time < 1000
  }

  const renderMessage = message => {
    const cls = `bubble ${message.self ? 'self' : 'bot'} ` + message.type
    const attrs = {
      modalParams,
      handler,
      message,
      key: message.time,
      className:
        cls + (message.payload.class ? ' ' + message.payload.class : '') + (isRecent(message) ? ' recent' : ''),
      layout: settings.layout,
      toggleModalPreferHeight: null,
      onLoad: () => scrollToBottom(),
    }

    return (elementFactory ? elementFactory(message, attrs) : null) || ElementFactory(message, attrs)
  }

  const renderUpload = ({ progress, type, retry }) => {
    if (retry) {
      return (
        <div className="upload">
          <span className="label">Upload failed…</span>
          <div className="retry">
            <button onClick={() => handler.sendFile(retry)}>Retry</button>
            <button onClick={() => handler.cancelUpload()}>×</button>
          </div>
        </div>
      )
    }

    const typeMap = { image: 'image', video: 'video', audio: 'sound' }
    type = typeMap[type.split('/')[0]] || 'file'

    return (
      <div className="upload">
        <span className="label">
          Sending {type}… {Math.ceil(progress)}%
        </span>
        <span className="progress">
          <span style={{ width: progress + '%' }} />
        </span>
      </div>
    )
  }

  const isGroupable = (a: any, b: any) => {
    return (
      a.self === b.self &&
      a.type === b.type &&
      a.payload.class === b.payload.class &&
      isEqual(a.as, b.as) &&
      Math.abs(a.time - b.time) < 15000
    )
  }

  const renderTyping = () => {
    const avatar = typingAs ? typingAs.profile_picture : botAvatar

    return (
      <div className="bubble-group bot typing">
        {!hideAvatars ? <div className="avatar" style={{ backgroundImage: avatar ? `url(${avatar})` : null }} /> : null}
        <div className="typing">
          <span />
          <span />
          <span />
        </div>
      </div>
    )
  }

  const checkLinkClick = e => {
    const url = e.target?.getAttribute('href')
    if (url) {
      handler.sendLinkClick(url)
    }
  }

  const loadHistory = () => {
    setLoading(true)
  }

  useEffect(() => {
    if (loading === true) channel.getMoreHistory()
  }, [loading])

  const onScroll = () => {
    if (channel && channel.hasMoreHistory() && wrapperElement.current.scrollTop < 10 && !loading) {
      loadHistory()
    }
  }

  if (isRecent(lastMessage) || typing || upload) {
    setTimeout(() => scrollToBottom(), 0)
  }

  return (
    <div
      className={`chat-messages ${hideAvatars ? 'hide-avatars' : userAvatar ? 'user-avatar' : ''}`}
      ref={wrapperElement}
      onClick={checkLinkClick}
      onScroll={onScroll}
    >
      <div className="inner">
        {settings.layout === 'embedded' ? (
          <div className="bubble-group self">
            {!hideAvatars && userAvatar ? (
              <div className="avatar" style={{ backgroundImage: userAvatar ? `url(${userAvatar})` : null }} />
            ) : null}
            <ChatInput />
          </div>
        ) : null}

        {lastMessage && !lastMessage.self && lastMessage.payload.quick_replies && !typing && !upload ? (
          <QuickReplies
            className={`${lastMessage.payload.class} ${isRecent(lastMessage) ? ' recent' : ''}`}
            buttons={lastMessage.payload.quick_replies}
          />
        ) : null}

        {upload ? renderUpload(upload) : null}
        {typing ? renderTyping() : null}

        {messageGroups.map(renderMessageGroup)}

        {loading ? <span>…</span> : null}
      </div>
    </div>
  )
}

export default ChatMessages
