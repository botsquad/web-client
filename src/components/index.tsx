import React, { createRef } from 'react'
import { Channel, Socket } from 'phoenix'
import locale2 from 'locale2'
import { EventEmitter } from 'fbemitter'

import { getUserInfo } from '../common/util'
import ChatWindow from './ChatWindow'
import ChatModal from './ChatModal'
import ChatToast from './ChatToast'
import NotificationManager from './NotificationManager'
import botChannelJoin from './channel'
import { uploadFile } from './upload'
import { Offline } from './icons'
import UploadTrigger from './UploadTrigger'

import './index.scss'
import ChatContext from './ChatContext'
import { Argument } from 'classnames'
import Message, { As, Payload } from './elements/types'

export type Meta = {
  readonly dialog?: string | null
  readonly file?: string | null
  readonly line?: string | number
}

type BotProcesses = {
  master?: true
  group?: string
}

export type DebugInfo = {
  meta: Meta | null
  context: Record<string, string> | null
  processes: BotProcesses
}

export type Emit = { event: string; payload?: any }

export class ChatHandler {
  component: any //typeof Chat
  channel: any
  _activeAudio: any
  _audioElements: any
  _eventQueue: any[]
  _lastModal: any
  constructor(component) {
    this.component = component
    this.channel = null
    this._activeAudio = null
    this._audioElements = []
    this._eventQueue = []
  }

  joinChannel({ bot_id, params, onJoinError }, socket) {
    this.leaveChannel()
    this.component.setState({ upload: null, typing: false, events: [] })
    params = { ...params, context: params.context || { user: getUserInfo() } }
    botChannelJoin(this.component, socket, bot_id, params)?.then(channel => {
      this.channel = channel
      this._eventQueue.forEach(({ type, payload }) => {
        this.send(type, payload)
      })
      this._eventQueue = []
      this.component.setState({ online: true })
    }, onJoinError)
  }

  leaveChannel() {
    if (this.channel !== null) {
      this.channel.leave()
      if (this.component.props.onChannelLeave) {
        this.component.props.onChannelLeave()
      }
    }
  }

  send(type, payload) {
    if (this.channel === null) {
      this._eventQueue.push({ type, payload })
      return
    }
    this.channel.push('user_action', { type, payload })
    if (type === 'message' && typeof payload === 'string') {
      payload = { text: payload, type: 'text' }
    }
    this.component.addEvent({
      type: `user_${type}`,
      payload,
      time: new Date().getTime(),
    })
  }

  sendLinkClick(url) {
    if (url.match(/bsqd.me\/s\//) || url.match(/localhost:4000\/s\//)) {
      // ignore short URLs, these are tracked internally
      return
    }
    this.send('event', { name: '$link_click', payload: { url, via: 'web' } })
  }

  sendFile(file) {
    const { name } = file
    let { type } = file
    this.component.setState({ upload: { name, type, progress: 0 } })
    this.channel.push('get_upload_url', { type }).receive('ok', ({ upload_url, public_url }) => {
      uploadFile(
        file,
        upload_url,
        () => {
          type = type.replace(/\/.*$/, '')
          if (type !== 'video' && type !== 'audio' && type !== 'image') {
            type = 'file'
          }
          this.send('attachment', { type, url: public_url, caption: name })
          this.component.setState({ upload: null })
        },
        () => {
          // error
          this.component.setState({ upload: { name, type, retry: file } })
        },
        progress => {
          this.component.setState({
            upload: { ...this.component.state.upload, progress },
          })
        },
        file.type,
      )
    })
  }

  handleAudioEvent(payload) {
    if (!this._activeAudio) return

    switch (payload) {
      case 'play':
        // pause all others
        this._audioElements.forEach(a => {
          if (a !== this._activeAudio) a.pause()
        })
        // perform command
        this._activeAudio.play()
        break
      case 'pause':
        this._activeAudio.pause()
        break
      default:
        break
    }
  }

  attachAudio(audio) {
    this._activeAudio = audio
    if (this._audioElements.indexOf(audio) === -1) {
      this._audioElements.push(audio)
    }
  }

  cancelUpload() {
    this.component.setState({ upload: null })
  }

  getClientDimensions() {
    const { clientWidth } = this.component.windowElement
    let { clientHeight } = this.component.windowElement
    clientHeight = Math.min(clientHeight, window.innerHeight)
    return {
      clientHeight,
      clientWidth,
      clientRatio: clientHeight / clientWidth,
    }
  }

  getMapsAPIKey() {
    return this.component.props.mapsApiKey || ''
  }
}

interface ChatProps {
  bot_id: string
  socket?: Socket
  params?: Record<string, any>
  onHideInput?: (flag: boolean) => void
  settings: Record<string, any>
  localePrefs?: string[]
  closeConversation?: () => void
  mapsApiKey?: string
  botAvatar?: string
  userAvatar?: string
  onChannel?: (channel: Channel) => void
  onChannelLeave?: () => void
  onClose?: () => void
  onEmit?: (event: Emit) => void
  notificationManager?: boolean
  online?: boolean
  hideAvatars?: boolean
  onJoinError?: (payload: { reason: string }) => void
  onError?: (message: string) => void
  onDebug?: (info: DebugInfo) => void
  makeChannelTopic?: (botId: string, params: Record<string, any>) => string | null
  onConversationMeta: any
  onReady: any
}

interface ChatState {
  events: Message<any>[]
  typing: boolean
  typingAs: As | null
  upload: any
  modal: Message<Payload> | null
  modalHiding: boolean
  conversationMeta: any
  online: Argument
  localePrefs: string[]
  joined: boolean
  socket: Socket
  toastHiding: boolean
  toast: any
  modalParams: any
}

export default class Chat extends React.Component<ChatProps, ChatState> {
  handler: ChatHandler
  notificationManager: NotificationManager
  eventDispatcher: EventEmitter
  _onlineTimeout: ReturnType<typeof setTimeout>
  mounted: boolean
  _toastClearer: ReturnType<typeof setTimeout> | null
  _toastClearer2: ReturnType<typeof setTimeout>
  windowElement: any
  root = createRef<HTMLDivElement>()
  uploader: UploadTrigger | null
  constructor(props) {
    super(props)
    this.state = {
      events: [],
      typing: false,
      typingAs: null,
      upload: null,
      modal: null,
      modalHiding: false,
      conversationMeta: {},
      online: true,
      joined: false,
      localePrefs: props.localePrefs || [locale2.replace(/-.*$/, '')],
      socket: props.socket || new Socket('wss://bsqd.me/socket'),
      toastHiding: true,
      toast: null,
      modalParams: null,
    }
    this.handler = new ChatHandler(this)
    if (props.notificationManager) {
      this.notificationManager = new NotificationManager(this)
    }
    if (!props.socket) {
      this.state.socket.connect()
    }
    this.eventDispatcher = new EventEmitter()
  }

  componentWillReceiveProps(newProps) {
    if (newProps.bot_id !== this.props.bot_id) {
      this.handler.joinChannel(newProps, this.state.socket)
    }
    if (this.notificationManager) {
      this.notificationManager.windowFocusChange()
    }

    if (newProps.online !== this.props.online) {
      if (newProps.online) {
        clearTimeout(this._onlineTimeout)
        this.setState({ online: true })
      } else {
        this._onlineTimeout = setTimeout(() => this.setState({ online: false }), 1000)
      }
    }
  }

  componentWillUnmount() {
    this.mounted = false
    if (this.notificationManager) {
      this.notificationManager.componentWillUnmount()
    }
    this.handler.leaveChannel()
  }

  showModal(message, modalParams) {
    this.setState({ modal: message, modalParams })
  }

  hideModal() {
    if (this.state.modal === null) {
      return
    }
    this.setState({ modalHiding: true })
    setTimeout(() => this.setState({ modal: null, modalHiding: false }), 300)
  }

  showToast(toast) {
    if (this._toastClearer) {
      clearTimeout(this._toastClearer)
    }
    clearTimeout(this._toastClearer2)

    this.setState({ toast, toastHiding: false })

    this._toastClearer2 = setTimeout(() => {
      this.setState({ toastHiding: true })

      setTimeout(() => {
        this._toastClearer = null
        this.setState({ toast: null, toastHiding: false })
        // this._toastClearer =  //
      }, 500)
    }, 4000)
  }

  triggerModal() {
    if (this.handler._lastModal) {
      this.showModal(this.handler._lastModal, null)
    }
  }

  triggerAudio(payload) {
    this.handler.handleAudioEvent(payload)
  }

  addEvent(event) {
    this.eventDispatcher.emit('chat_event', event)
    this.setState({
      typing: false,
      events: this.state.events.concat([this.normalizeEvent(event)]),
    })
  }

  prependEvents(history, cb, initial) {
    if (initial) {
      const lastInputState = history
        .concat([])
        .reverse()
        .find(c => c.type === 'emit' && c.payload.event === 'hide_input')
      if (lastInputState) {
        const hide_input = JSON.parse(lastInputState.payload.json)
        if (this.props.onHideInput) {
          this.props.onHideInput(hide_input)
        }
      }

      // determine modal state
      const modalEvents = history
        .concat([])
        .reverse()
        .filter(
          ({ type, payload }) =>
            (type === 'emit' && payload.event === 'trigger_modal') ||
            (type === 'user_event' && payload.name === '$modal_close'),
        )
      const modalOpen = modalEvents.length > 0 ? modalEvents[0].type === 'emit' : false
      if (modalOpen) {
        setTimeout(() => this.triggerModal(), 0)
      }
    }

    const events = history.map(e => this.normalizeEvent(e)).concat(this.state.events)
    this.setState({ events }, cb)
  }

  normalizeEvent({ type, payload, time, as }) {
    const self = !!type.match(/^user_/)
    if (type === 'user_message') {
      type = 'text'
      payload = { message: payload.text }
    }
    if (type === 'input_method' && typeof payload.json === 'string') {
      payload = { type: payload.type, payload: JSON.parse(payload.json) }
    }
    if (type === 'user_location') {
      type = 'location'
    }
    if (type === 'user_attachment') {
      type = 'media'
      payload = { url: payload.url, kind: payload.type, caption: payload.caption }
    }
    const renderable = ['media', 'text', 'location', 'template'].indexOf(type) >= 0
    return { type, self, payload, renderable, time, as }
  }

  render() {
    const localePrefs = this.state.conversationMeta?.locale
      ? [this.state.conversationMeta?.locale]
      : this.state.localePrefs
    const props = { ...this.props, localePrefs }
    const { modal, ...state } = this.state
    const allProps = {
      ...props,
      ...state,
      conversationMeta: this.state.conversationMeta,
      online: this.state.online,
      channel: this.handler.channel,
      handler: this.handler,
      showToast: this.showToast,
      message: this.state.modal,
    }

    const chatModalProps = {
      handler: this.handler,
      message: this.state.modal as Message<Payload>,
      hiding: this.state.modalHiding,
      modalParams: this.state.modalParams,
      onLoad: null,
      settings: this.props.settings,
      localePrefs: this.state.localePrefs,
    }
    return (
      <ChatContext props={{ ...allProps }}>
        <div className="botsi-web-client" ref={this.root}>
          <ChatWindow />
          {this.state.toast ? <ChatToast toast={this.state.toast} hiding={this.state.toastHiding} /> : null}
          {this.state.modal ? <ChatModal {...chatModalProps} /> : null}
          {!this.state.online ? <span className="offline">{Offline}</span> : null}
          <UploadTrigger
            ref={uploader => {
              this.uploader = uploader
            }}
          />
          {this.state.joined === false ? <div className="loader joining" /> : null}
        </div>
      </ChatContext>
    )
  }

  componentDidMount() {
    this.mounted = true
    this.handler.joinChannel(this.props, this.state.socket) //TODO: Ask Also this
    if (this.notificationManager) {
      this.notificationManager.componentDidMount()
    }
    if (this.root.current) this.windowElement = this.root.current.querySelector('.chat-window')
  }
}
