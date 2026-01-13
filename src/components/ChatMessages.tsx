import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import isEqual from 'lodash/isEqual'
import { EventEmitter } from 'fbemitter'

import QuickReplies from './QuickReplies'
import ChatInput from './ChatInput'
import ElementFactory from './elements'
import { shortDateTimeFormat } from '../common/util'
import Message, { As, Payload } from './elements/types'
import { ChatHandler } from 'components'
import { API } from '@botsquad/sdk'
import { AugmentedChannel } from './ChatContext'

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
  handler: ChatHandler
  settings: Record<string, any> | null
  operatorConversationId?: string
  host: any
  hideAvatars: boolean
  elementFactory: typeof ElementFactory | null
  typingAs: As | null
  botAvatar: any
  channel?: AugmentedChannel
  upload: { type: any; progress: any; retry: any }
  typing: boolean
  userAvatar: any
  events: Message<any>[]
  conversationMeta?: API.Conversation
  updater: (update: any) => void
  localePrefs: string[]
}

function ChatMessages(props: ChatMessagesProps) {
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
    updater,
    localePrefs,
  } = props

  const [messageGroups, setMessageGroups] = useState<any[]>([])
  const [lastMessage, setLastMessage] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const wrapperElementRef = useRef<HTMLDivElement>(null)

  const isGroupable = useCallback((a: any, b: any) => {
    return (
      a.self === b.self &&
      a.type === b.type &&
      a.payload.class === b.payload.class &&
      isEqual(a.as, b.as) &&
      Math.abs(a.time - b.time) < 15000
    )
  }, [])

  const isRecent = useCallback((message: Message<any>) => {
    if (!message) {
      return false
    }
    return new Date().getTime() - message.time < 1000
  }, [])

  const scrollToBottom = useCallback(() => {
    const layout = settings?.layout || ''
    if (layout === 'embedded' && host) {
      // scroll the document
      host.scrollToBottom()
    } else if (wrapperElementRef.current) {
      wrapperElementRef.current.scrollTop = wrapperElementRef.current.scrollHeight
    }
  }, [settings, host])

  const _connectFormEvents = useCallback((events: any) => {
    const formLookup: any = {}
    for (const m of events) {
      if (m.type === 'template' && m.payload.template_type === 'input_method') {
        formLookup[m.payload.template_id] = m
      }
      if (m.type === 'user_event' && m.payload.name === '$form') {
        const { _template_id, ...data } = m.payload.payload
        if (_template_id && formLookup[_template_id]) {
          formLookup[_template_id].read_only_data = data
        }
      }
    }
  }, [])

  const groupMessages = useCallback(
    (props: ChatMessagesProps) => {
      const { events, userAvatar, botAvatar, conversationMeta } = props

      // convert all events into groups of messages
      const newMessageGroups: any[] = []
      let lastMsg: boolean | Message<unknown> = false
      let lastModalMessage: Message<unknown> | null = null
      let currentGroup: any = false

      _connectFormEvents(events)
      for (const message of events) {
        if (!message.renderable && message.type !== 'annotation') {
          continue
        }
        if (currentGroup === false || !isGroupable(message, lastMsg)) {
          if (currentGroup !== false) {
            newMessageGroups.unshift(currentGroup)
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
        lastMsg = message
      }
      if (currentGroup !== false) {
        newMessageGroups.unshift(currentGroup)
      }

      const hasReadUntil =
        conversationMeta && conversationMeta.unread_message_count > 0 ? conversationMeta.read_until : null
      if (hasReadUntil) {
        let insertIdx = newMessageGroups.length
        const hasReadTime = Date.parse(hasReadUntil)
        while (insertIdx > 1 && newMessageGroups[insertIdx - 1].messages[0].time >= hasReadTime) insertIdx--
        if (insertIdx > 0 && insertIdx < newMessageGroups.length) {
          newMessageGroups.splice(insertIdx, 0, { hasReadUntil })
        }
      }

      handler._lastModal = lastModalMessage

      setMessageGroups(newMessageGroups)
      setLastMessage(lastMsg)
    },
    [handler, _connectFormEvents, isGroupable],
  )

  useEffect(() => {
    groupMessages(props)
    const scrollToBottomListener = chatMessagesEvents.addListener('scrollToBottom', scrollToBottom)
    updater({ scrollToBottom })

    return () => {
      scrollToBottomListener.remove()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setLoading(false)
    groupMessages(props)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.events, props.userAvatar, props.botAvatar, props.conversationMeta])

  useEffect(() => {
    if (lastMessage === null && messageGroups.length > 0) {
      setTimeout(() => scrollToBottom(), 50)
      setTimeout(() => scrollToBottom(), 500)
    }
  }, [lastMessage, messageGroups.length, scrollToBottom])

  useEffect(() => {
    if (isRecent(lastMessage) || typing || upload) {
      setTimeout(() => scrollToBottom(), 0)
    }
  }, [lastMessage, typing, upload, isRecent, scrollToBottom])

  useEffect(() => {
    if (settings?.layout === 'embedded') {
      // do not autoload history, for now
      return
    }
    const wrapper = wrapperElementRef.current
    if (wrapper && wrapper.scrollHeight <= wrapper.offsetHeight && channel && channel.hasMoreHistory() && !loading) {
      setLoading(true)
      channel.getMoreHistory()
    }
  }, [settings, channel, loading, messageGroups])

  const renderMessage = useCallback(
    (message: Message<any>) => {
      if (!settings) {
        return null
      }
      const cls = `bubble ${message.self ? 'self' : 'bot'} ` + message.type

      const key = message.time

      const attrs = {
        ...props,
        message,
        className:
          cls + (message.payload.class ? ' ' + message.payload.class : '') + (isRecent(message) ? ' recent' : ''),
        layout: settings.layout,
        onLoad: () => scrollToBottom(),
        toggleModalPreferHeight: null,
        settings: settings,
        localePrefs: localePrefs,
      }

      const element = (elementFactory ? elementFactory(message, attrs) : null) || ElementFactory(message, attrs)

      // Add key to the element, not to attrs
      return element ? React.cloneElement(element, { key }) : null
    },
    [settings, props, isRecent, scrollToBottom, elementFactory, localePrefs],
  )

  const renderMessageGroup = useCallback(
    (group: any) => {
      if (group.hasReadUntil) {
        return (
          <div key="hasReadUntil" className="has-read-until">
            <span>{shortDateTimeFormat(group.hasReadUntil)}</span>
          </div>
        )
      }

      const rendered = group.messages.map(renderMessage).filter((el: any) => el !== null)
      if (rendered.length === 0) return null

      const key = group.messages[0].time
      const name = group.as ? (group.as.first_name + ' ' + (group.as.last_name || '')).trim() : null

      return (
        <div key={key} className={`bubble-group ${group.messages[0].self ? 'self' : 'bot'} ${group.class || ''}`}>
          {!hideAvatars && group.avatar ? (
            <div className="as">
              <div
                className="avatar"
                style={{ backgroundImage: group.avatar ? `url(${group.avatar})` : '' }}
                title={name ? name : ''}
              />
              {name?.length ? <div className="name">{name}</div> : null}
            </div>
          ) : null}
          <div className="bubble-container">{rendered}</div>
        </div>
      )
    },
    [hideAvatars, renderMessage],
  )

  const renderUpload = useCallback(
    ({ progress, type, retry }: { progress: number; type: string; retry: any }) => {
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

      const typeMap: Record<string, string> = { image: 'image', video: 'video', audio: 'sound' }
      const displayType = typeMap[type.split('/')[0]] || 'file'

      return (
        <div className="upload">
          <span className="label">
            Sending {displayType}… {Math.ceil(progress)}%
          </span>
          <span className="progress">
            <span style={{ width: progress + '%' }} />
          </span>
        </div>
      )
    },
    [handler],
  )

  const renderTyping = useMemo(() => {
    const avatar = typingAs ? typingAs.profile_picture : botAvatar

    return (
      <div className="bubble-group bot typing">
        {!hideAvatars ? <div className="avatar" style={{ backgroundImage: avatar ? `url(${avatar})` : '' }} /> : null}
        <div className="typing">
          <span />
          <span />
          <span />
        </div>
      </div>
    )
  }, [typingAs, botAvatar, hideAvatars])

  const checkLinkClick = useCallback(
    (e: any) => {
      const url = e.target?.getAttribute('href')
      if (url && handler) {
        handler.sendLinkClick(url)
      }
    },
    [handler],
  )

  const onScroll = useCallback(() => {
    if (
      channel &&
      channel.hasMoreHistory() &&
      wrapperElementRef.current &&
      wrapperElementRef.current.scrollTop < 10 &&
      !loading
    ) {
      setLoading(true)
      channel.getMoreHistory()
    }
  }, [channel, loading])

  return (
    <div
      className={`chat-messages ${hideAvatars ? 'hide-avatars' : userAvatar ? 'user-avatar' : ''}`}
      ref={wrapperElementRef}
      onClick={checkLinkClick}
      onScroll={onScroll}
    >
      <div className="inner">
        {settings?.layout === 'embedded' ? (
          <div className="bubble-group self">
            {!hideAvatars && userAvatar ? (
              <div className="avatar" style={{ backgroundImage: userAvatar ? `url(${userAvatar})` : '' }} />
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
        {typing ? renderTyping : null}

        {messageGroups.map(renderMessageGroup)}

        {loading ? <span>…</span> : null}
      </div>
    </div>
  )
}

export default ChatMessages
