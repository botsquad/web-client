import React, { useEffect, useState } from 'react'
import isEqual from 'lodash/isEqual'
import { EventEmitter, EventSubscription } from 'fbemitter'

import QuickReplies from './QuickReplies'
import ChatInput from './ChatInput'
import elementFactory from './elements'
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

interface ChatMessagesProps {
  handler: any
  settings: { layout: string }
  host: any
  hideAvatars: boolean
  elementFactory: any
  typingAs: any
  botAvatar: any
  channel: any
  upload: { type: any; progress: any; retry: any }
  typing: boolean
  userAvatar: any
  events: any
  conversationMeta: any
}

const ChatMessages: React.FC<ChatMessagesProps> = props => {
  // const {
  //   handler,
  //   settings,
  //   host,
  //   hideAvatars,
  //   elementFactory,
  //   typingAs,
  //   botAvatar,
  //   channel,
  //   upload,
  //   typing,
  //   userAvatar,
  //   events,
  //   conversationMeta,
  // } = useChatProps()
  const allProps = useChatProps

  const [messageGroups, setMessageGroups] = useState<any[]>([])
  const [lastMessage, setLastMessage] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [scrollToBottomListener, setScrollToBottomListener] = useState<EventSubscription>(null)
  const chatPropsUpdate = useChatPropsUpdate() //Preparing to use Context
  let wrapperElement = React.createRef<HTMLDivElement>()

  useEffect(() => {
    console.log('[Chat Messages Props]', props)
    chatPropsUpdate('scrollToBottom', scrollToBottom)
    groupMessages(props)
    setScrollToBottomListener(chatMessagesEvents.addListener('scrollToBottom', scrollToBottom))
    return () => {
      scrollToBottomListener.remove()
    }
  }, [])

  useEffect(() => {
    setLoading(false)
    groupMessages(props) // change to allProps
  }, [props, allProps])

  useEffect(() => {
    if (props.settings.layout === 'embedded') {
      // do not autoload history, for now
      return
    }
    const wrapper = wrapperElement.current
    if (
      wrapper &&
      wrapper.scrollHeight <= wrapper.offsetHeight &&
      props.channel &&
      props.channel.hasMoreHistory() &&
      !loading
    ) {
      loadHistory()
    }
  }, [props, allProps])

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

  const groupMessages = (props: ChatMessagesProps) => {
    const { events, userAvatar, botAvatar, conversationMeta } = props

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

    if (props.handler) {
      props.handler._lastModal = lastModalMessage
    }

    setMessageGroups(messageGroups)
    setLastMessage(lastMessage)
  }

  const scrollToBottom = () => {
    const { layout } = props.settings
    if (layout === 'embedded' && props.host) {
      // scroll the document
      props.host.scrollToBottom()
    } else if (wrapperElement.current) {
      wrapperElement.current.scrollTop = wrapperElement.current.scrollHeight
    }
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
        {!props.hideAvatars && group.avatar ? (
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
      ...props,
      key: message.time,
      message,
      className:
        cls + (message.payload.class ? ' ' + message.payload.class : '') + (isRecent(message) ? ' recent' : ''),
      layout: props.settings.layout,
      onLoad: () => scrollToBottom(),
    }

    return (props.elementFactory ? props.elementFactory(message, attrs) : null) || elementFactory(message, attrs)
  }

  const renderUpload = ({ progress, type, retry }) => {
    if (retry) {
      return (
        <div className="upload">
          <span className="label">Upload failed…</span>
          <div className="retry">
            <button onClick={() => props.handler.sendFile(retry)}>Retry</button>
            <button onClick={() => props.handler.cancelUpload()}>×</button>
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
    const avatar = props.typingAs ? props.typingAs.profile_picture : props.botAvatar

    return (
      <div className="bubble-group bot typing">
        {!props.hideAvatars ? (
          <div className="avatar" style={{ backgroundImage: avatar ? `url(${avatar})` : null }} />
        ) : null}
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
      props.handler.sendLinkClick(url)
    }
  }

  const loadHistory = () => {
    setLoading(true)
  }

  useEffect(() => {
    if (loading === true) props.channel.getMoreHistory()
    scrollToBottom()
  }, [loading])

  const onScroll = () => {
    if (props.channel && props.channel.hasMoreHistory() && wrapperElement.current.scrollTop < 10 && !loading) {
      loadHistory()
    }
  }

  const { upload, typing, handler, hideAvatars, userAvatar } = props

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
        {props.settings.layout === 'embedded' ? (
          <div className="bubble-group self">
            {!hideAvatars && userAvatar ? (
              <div
                className="avatar"
                style={{ backgroundImage: props.userAvatar ? `url(${props.userAvatar})` : null }}
              />
            ) : null}
            <ChatInput {...props} scrollToBottom={scrollToBottom} />
          </div>
        ) : null}

        {lastMessage && !lastMessage.self && lastMessage.payload.quick_replies && !typing && !upload ? (
          <QuickReplies
            className={`${lastMessage.payload.class} ${isRecent(lastMessage) ? ' recent' : ''}`}
            buttons={lastMessage.payload.quick_replies}
            handler={handler}
            {...props}
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
