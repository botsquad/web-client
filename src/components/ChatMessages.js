import React from 'react'
import ReactDOM from 'react-dom'
import debounce from 'lodash/debounce'
import isEqual from 'lodash/isEqual'

import QuickReplies from './QuickReplies'
import ChatInput from './ChatInput'
import elementFactory from './elements'
import { shortDateTimeFormat } from '../common/util'
import { messageHasModal } from './elements/util'
import { EventEmitter } from 'fbemitter'

export const chatMessagesEvents = new EventEmitter()


export default class ChatMessages extends React.Component {

  state = {
    messageGroups: [],
    lastMessage: null,
    loading: false
  }

  wrapperElement = null
  scrollElement = null

  componentDidMount() {
    this.groupMessages(this.props)
    this.scrollToBottomListener = chatMessagesEvents.addListener('scrollToBottom', this.scrollToBottom)
  }

  componentWillUnmount() {
    this.scrollToBottomListener.remove()
  }

  componentWillReceiveProps(newProps) {
    this.setState({ loading: false })
    this.groupMessages(newProps)
  }

  _connectFormEvents(events) {
    const formLookup = {}
    for (let m of events) {
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

  groupMessages(props) {
    const { events, userAvatar, botAvatar, conversationMeta } = props

    // convert all events into groups of messages
    let messageGroups = []
    let lastMessage = false
    let lastModalMessage = null
    let currentGroup = false

    this._connectFormEvents(events)

    for (let message of events) {
      if (!message.renderable) {
        continue
      }
      if (currentGroup === false || !this.isGroupable(message, lastMessage)) {
        if (currentGroup !== false) {
          messageGroups.unshift(currentGroup)
        }
        currentGroup = {
          avatar: message.self ? userAvatar : (message.as ? message.as.profile_picture : botAvatar),
          messages: [message],
          class: message.payload.class || null,
          as: message.as
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
    if (this.state.lastMessage === null) {
      setTimeout(() => this.scrollToBottom(), 50)
      setTimeout(() => this.scrollToBottom(), 500)
    }

    const hasReadUntil = conversationMeta && conversationMeta.unread_message_count > 0 ? conversationMeta.read_until : null
    if (hasReadUntil) {
      let insertIdx = messageGroups.length
      const hasReadTime = Date.parse(hasReadUntil)
      while (insertIdx > 1 && messageGroups[insertIdx - 1].messages[0].time >= hasReadTime) insertIdx--;
      if (insertIdx > 0 && insertIdx < messageGroups.length) {
        messageGroups.splice(insertIdx, 0, { hasReadUntil })
      }
    }

    if (this.props.handler) {
      this.props.handler._lastModal = lastModalMessage
    }

    this.setState({ messageGroups, lastMessage })
  }

  scrollToBottom = () => {
    const { layout } = this.props.settings
    if (layout === 'embedded' && this.props.host) {
      // scroll the document
      this.props.host.scrollToBottom()
    } else if (this.wrapperElement) {
      this.wrapperElement.scrollTop = this.wrapperElement.scrollHeight
    }
  }

  renderMessageGroup(group){
    if (group.hasReadUntil) {
      return <div key="hasReadUntil" className={`has-read-until`}>
        <span>{shortDateTimeFormat(group.hasReadUntil)}</span>
      </div>
    }

    const key = group.messages[0].time

    const name = group.as ? group.as.first_name + ' ' + (group.as.last_name || '') : null
    return (
      <div key={key} className={`bubble-group ${group.messages[0].self ? 'self' : 'bot'} ${group.class || ''}`} >
        {!this.props.hideAvatars && group.avatar
        ? <div className="avatar" style={{ backgroundImage: group.avatar ? `url(${group.avatar})` : null }} title={name} />
        : null}
        <div className="bubble-container">
          {group.messages.map(this.renderMessage.bind(this))}
        </div>
      </div>
    )
  }

  isRecent(message) {
    if (!message) {
      return false
    }
    return (new Date().getTime() - message.time) < 1000
  }

  renderMessage(message) {
    let element = null
    const cls = `bubble ${message.self ? 'self' : 'bot'} ` + message.type

    const attrs = {
      ...this.props,
      key: message.time,
      message,
      className: cls + (message.payload.class ? ' ' + message.payload.class : '') + (this.isRecent(message) ? ' recent' : ''),
      layout: this.props.settings.layout,
      onLoad: () => this.scrollToBottom()
    }

    return (this.props.elementFactory ? this.props.elementFactory(message, attrs) : null) || elementFactory(message, attrs)
  }

  renderUpload({ name, progress, type, retry }) {
    if (retry) {
      return (
        <div className="upload">
          <span className="label">Upload failed…</span>
          <div className="retry">
            <button onClick={() => this.props.handler.sendFile(retry)}>Retry</button>
            <button onClick={() => this.props.handler.cancelUpload()}>×</button>
          </div>
        </div>
      )
    }

    const typeMap = { image: 'image', video: 'video', audio: 'sound' }
    type = typeMap[type.split('/')[0]] || 'file'

    return (
      <div className="upload">
        <span className="label">Sending {type}… {Math.ceil(progress)}%</span>
        <span className="progress">
          <span style={{ width: progress + '%' }}></span>
        </span>
      </div>
    )
  }

  isGroupable(a, b) {
    return a.self === b.self && a.type === b.type && a.payload.class === b.payload.class && isEqual(a.as, b.as) && Math.abs(a.time - b.time) < 15000
  }

  renderTyping() {
    const avatar = this.props.typingAs ? this.props.typingAs.profile_picture : this.props.botAvatar

    return (
      <div className="bubble-group bot typing">
        {!this.props.hideAvatars
        ? <div className="avatar" style={{ backgroundImage: avatar ? `url(${avatar})` : null }} />
        : null}
        <div className="typing">
          <span></span><span></span><span></span>
        </div>
      </div>
    )
  }

  checkLinkClick(e) {
    let url
    if (e.target && (url = e.target.getAttribute('href'))) {
      this.props.handler.sendLinkClick(url)
    }
  }

  loadHistory() {
    this.setState({ loading: true }, () => {
      this.props.channel.getMoreHistory()
    })
  }

  onScroll() {
    if (this.props.channel && this.props.channel.hasMoreHistory() && this.wrapperElement.scrollTop < 10 && !this.state.loading) {
      this.loadHistory()
    }
  }

  render() {
    const { upload, events, typing, handler, hideAvatars, userAvatar } = this.props
    const { messageGroups, lastMessage } = this.state

    if (this.isRecent(lastMessage) || typing || upload) {
      setTimeout(() => this.scrollToBottom(), 0)
    }

    const hasMore = this.props.channel && this.props.channel.hasMoreHistory()

    return (
      <div className={`chat-messages ${hideAvatars ? 'hide-avatars' : (userAvatar ? 'user-avatar' : '')}`} ref={e => this.wrapperElement = e } onClick={this.checkLinkClick.bind(this)} onScroll={this.onScroll.bind(this)}>
        <div className="inner">

          {(this.props.settings.layout === 'embedded')
          ? <div className="bubble-group self">
            {!hideAvatars && userAvatar ? <div className="avatar" style={{ backgroundImage: this.props.userAvatar ? `url(${this.props.userAvatar})` : null }} /> : null}
            <ChatInput {...this.props} chatMessages={this} />
          </div>
          : null}

          {(lastMessage && !lastMessage.self && lastMessage.payload.quick_replies && !typing && !upload)
          ? <QuickReplies className={`${lastMessage.payload.class} ${this.isRecent(lastMessage) ? ' recent' : ''}`} buttons={lastMessage.payload.quick_replies} handler={handler} />
          : null}

          {upload ? this.renderUpload(upload) : null}
          {typing ? this.renderTyping() : null}

          {messageGroups.map(this.renderMessageGroup.bind(this))}

          {this.state.loading ? <span>…</span> : null}
        </div>
      </div>
    )
  }

  componentDidUpdate() {
    if (this.props.settings.layout === 'embedded') {
      // do not autoload history, for now
      return
    }
    if (this.wrapperElement && this.wrapperElement.scrollHeight <= this.wrapperElement.offsetHeight && this.props.channel && this.props.channel.hasMoreHistory() && !this.state.loading) {
      this.loadHistory()
    }
  }
}
