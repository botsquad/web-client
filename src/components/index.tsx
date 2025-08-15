import React, { createRef } from 'react'
import { Socket } from 'phoenix'
const lang = navigator.language
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
import ChatContext, { AugmentedChannel, ChatContextProps, OperatorChatInputComponentProps } from './ChatContext'
import { Argument } from 'classnames'
import Message, { As, Payload } from './elements/types'
import { API } from '@botsquad/sdk'

import 'moment/locale/nl'
import 'moment/locale/de'
import 'moment/locale/fr'
import 'moment/locale/es'
import 'moment/locale/da'
import 'moment/locale/fi'

import moment from 'moment'
moment.locale('en')

export type Meta = {
  readonly dialog?: string | null
  readonly file?: string | null
  readonly line?: number
  readonly column?: number
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

export type ErrorInfo = {
  meta: Meta | null
  message: string
}

export type Emit = { event: string; payload?: any }

export class ChatHandler {
  component: Chat
  channel?: AugmentedChannel
  _activeAudio: any
  _audioElements: any
  _eventQueue: any[]
  _lastModal: any
  constructor(component: any) {
    this.component = component
    this.channel = undefined
    this._activeAudio = null
    this._audioElements = []
    this._eventQueue = []
  }

  joinChannel(props: any, socket: Socket) {
    const { params, onJoinError } = props
    this.leaveChannel()
    this.component.setState({ upload: null, typing: false, events: [] })
    const params2 = { ...params, context: params?.context || { user: getUserInfo() } }

    botChannelJoin(this.component, socket, params2)?.then(channel => {
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
      this.channel?.leave()
      if (this.component.props.onChannelLeave) {
        this.component.props.onChannelLeave()
      }
    }
  }

  send(type: string, payload: any) {
    if (this.channel === null) {
      this._eventQueue.push({ type, payload })
      return
    }
    this.channel?.push('user_action', { type, payload })
    if (type === 'user_message' && typeof payload === 'string') {
      payload = { text: payload, type: 'text' }
    }
    this.component.addEvent({
      type,
      payload,
      time: new Date().getTime(),
    })
  }

  sendLinkClick(url: string) {
    if (url.match(/bsqd.me\/s\//) || url.match(/localhost:4000\/s\//)) {
      // ignore short URLs, these are tracked internally
      return
    }
    this.send('event', { name: '$link_click', payload: { url, via: 'web' } })
  }

  sendFile(file: any) {
    const { name } = file
    let { type } = file
    this.component.setState({ upload: { name, type, progress: 0 } })
    this.channel
      ?.push('get_upload_url', { type })
      .receive('ok', ({ upload_url, public_url }: { upload_url: string; public_url: string }) => {
        uploadFile(
          file,
          upload_url,
          () => {
            type = type.replace(/\/.*$/, '')
            if (type !== 'video' && type !== 'audio' && type !== 'image') {
              type = 'file'
            }
            this.send('user_attachment', { type, url: public_url, caption: name })
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

  handleAudioEvent(payload: any) {
    if (!this._activeAudio) return

    switch (payload) {
      case 'play':
        // pause all others
        this._audioElements.forEach((a: any) => {
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

  attachAudio(audio: HTMLAudioElement | null) {
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

export interface ChatProps {
  bot_id?: string
  operatorConversationId?: string
  operatorChatInputComponent?: React.FC<OperatorChatInputComponentProps>
  socket?: Socket
  params?: Record<string, any>
  settings: Record<string, any>
  localePrefs?: string[]
  closeConversation?: () => void
  mapsApiKey?: string
  botAvatar?: string
  userAvatar?: string
  onChannel?: (channel: AugmentedChannel) => void
  onChannelLeave?: () => void
  onClose?: () => void
  onEmit?: (event: Emit) => void
  notificationManager?: boolean
  online?: boolean
  hideAvatars?: boolean
  onJoinError?: (payload: { reason: string }) => void
  onError?: (error: ErrorInfo) => void
  onDebug?: (info: DebugInfo) => void
  onConversationMeta?: (meta: API.Conversation) => void
  onReady?: () => void
}

interface ChatState {
  hideInput: boolean
  events: Message<any>[]
  typing: boolean
  typingAs: As | null
  upload: any
  modal: Message<Payload> | null
  modalHiding: boolean
  conversationMeta?: API.Conversation
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
  notificationManager: NotificationManager = null as unknown as NotificationManager
  eventDispatcher: EventEmitter
  _onlineTimeout: ReturnType<typeof setTimeout> = null as unknown as ReturnType<typeof setTimeout>
  mounted = false
  _toastClearer: ReturnType<typeof setTimeout> | null = null
  _toastClearer2: ReturnType<typeof setTimeout> = null as unknown as ReturnType<typeof setTimeout>
  windowElement: any
  root = createRef<HTMLDivElement>()
  uploader: UploadTrigger | null = null

  constructor(props: ChatProps) {
    super(props)
    this.state = {
      hideInput: false,
      events: [],
      typing: false,
      typingAs: null,
      upload: null,
      modal: null,
      modalHiding: false,
      conversationMeta: undefined,
      online: true,
      joined: false,
      localePrefs: props.localePrefs || [lang.replace(/-.*$/, '')],
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

  getSpan(): { newest: string | null, oldest: string | null } {
    function getCursor(event: Message<any> | undefined) {
      if (!event) return null

      return `${event.time}#${event.id}`
    }

    return {
      newest: getCursor(this.state.events[this.state.events.length - 1]),
      oldest: getCursor(this.state.events[0]),
    }
  }

  componentWillReceiveProps(newProps: ChatProps) {
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

  showModal(message: Message<any>, modalParams: any) {
    this.setState({ modal: message, modalParams })
  }

  hideModal() {
    if (this.state.modal === null) {
      return
    }
    this.setState({ modalHiding: true })
    setTimeout(() => this.setState({ modal: null, modalHiding: false }), 300)
  }

  showToast(toast: any) {
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

  triggerAudio(payload: any) {
    this.handler.handleAudioEvent(payload)
  }

  addEvent(event: any) {
    this.eventDispatcher.emit('chat_event', event)
    this.setState({
      typing: false,
      events: this.state.events.concat([this.normalizeEvent(event)]),
    })
  }

  prependEvents(history: Message<any>[], cb?: () => void, initial?: boolean) {
    if (initial) {
      const lastInputState = history
        .concat([])
        .reverse()
        .find(c => {
          return (
            (c.type === 'emit' && c.payload.event === 'hide_input') ||
            (c.type === 'user_message' && c.payload.input_method === 'closed')
          )
        })
      if (lastInputState) {
        const hideInput = lastInputState.payload.payload
        this.setState({ hideInput })
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

  normalizeEvent(message: Message<any>): Message<any> {
    const { type, payload, time, as, metadata, id } = message
    let type2 = type
    let payload2 = payload
    const self = !!type.match(/^user_/)
    if (type === 'user_message') {
      type2 = 'text'
      payload2 = { message: payload.text, input_type: payload.input_type }
    }
    if (type === 'user_location') {
      type2 = 'location'
    }
    if (type === 'user_attachment') {
      type2 = 'media'
      payload2 = { url: payload.url, kind: payload.type, caption: payload.caption }
    }
    if (type === 'contact') {
      type2 = 'contact'
    }
    const renderable = ['media', 'text', 'location', 'template', 'contact'].indexOf(type2) >= 0
    return { type: type2, self, payload: payload2, renderable, time, as, metadata, id }
  }

  render() {
    const localePrefs = (
      this.state.conversationMeta?.locale ? [this.state.conversationMeta.locale] : this.state.localePrefs
    ).map(l => l.replace(/[^a-z].*$/, ''))

    const { modal, ...state } = this.state
    const contextProps: Partial<ChatContextProps> = {
      ...this.props,
      ...state,
      localePrefs,
      conversationMeta: this.state.conversationMeta,
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
      localePrefs,
    }
    return (
      <ChatContext initial={{ ...contextProps }}>
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
    this.handler.joinChannel(this.props, this.state.socket)

    if (this.notificationManager) {
      this.notificationManager.componentDidMount()
    }
    if (this.root.current) this.windowElement = this.root.current.querySelector('.chat-window')
  }
}
