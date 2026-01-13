import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
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
import UploadTrigger, { UploadTriggerRef } from './UploadTrigger'
import { chatMessagesEvents } from './ChatMessages'

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

export interface ChatSpan {
  newest: string | null
  oldest: string | null
}

interface ChatComponentRef {
  setState: (updater: Partial<ChatState> | ((prev: ChatState) => Partial<ChatState>)) => void
  state: ChatState
  props: ChatProps
  windowElement: any
  uploader: UploadTriggerRef | null
  showModal: (message: Message<any>, modalParams: any) => void
  hideModal: () => void
  addEvent: (event: any) => void
  getSpan: () => ChatSpan
  prependEvents: (history: Message<any>[], cb?: () => void, initial?: boolean) => void
  triggerModal: () => void
  showToast: (toast: any) => void
  triggerAudio: (payload: any) => void
  mounted: boolean
  forceUpdate: () => void
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

export class ChatHandler {
  component: ChatComponentRef
  channel?: AugmentedChannel
  _activeAudio: any
  _audioElements: any[]
  _eventQueue: any[]
  _lastModal: any
  constructor(component: ChatComponentRef) {
    this.component = component
    this.channel = undefined
    this._activeAudio = null
    this._audioElements = []
    this._eventQueue = []
  }

  joinChannel(props: ChatProps, socket: Socket, span: () => ChatSpan) {
    const { params, onJoinError } = props
    this.leaveChannel()
    this.component.setState({ upload: null, typing: false, events: [] })
    const staticParams = { ...params, context: params?.context || { user: getUserInfo() } }

    botChannelJoin(this.component, socket, staticParams, span)?.then(
      channel => {
        this.channel = channel
        this._eventQueue.forEach(({ type, payload }) => {
          this.send(type, payload)
        })
        this._eventQueue = []
        this.component.setState({ online: true })
      },
      onJoinError,
    )
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
            this.component.setState((prev: ChatState) => ({
              upload: { ...prev.upload, progress },
            }))
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
  host?: any
  externalInterface?: any
}

function Chat(props: ChatProps) {
  const [hideInput, setHideInput] = useState<boolean>(false)
  const [events, setEvents] = useState<Message<any>[]>([])
  const [typing, setTyping] = useState<boolean>(false)
  const [typingAs, setTypingAs] = useState<As | null>(null)
  const [upload, setUpload] = useState<any>(null)
  const [modal, setModal] = useState<Message<Payload> | null>(null)
  const [modalHiding, setModalHiding] = useState<boolean>(false)
  const [conversationMeta, setConversationMeta] = useState<API.Conversation | undefined>(undefined)
  const [online, setOnline] = useState<Argument>(true)
  const [localePrefs, setLocalePrefs] = useState<string[]>(
    props.localePrefs || [lang.replace(/-.*$/, '')],
  )
  const [joined, setJoined] = useState<boolean>(false)
  const [socket] = useState<Socket>(props.socket || new Socket('wss://bsqd.me/socket'))
  const [toastHiding, setToastHiding] = useState<boolean>(true)
  const [toast, setToast] = useState<any>(null)
  const [modalParams, setModalParams] = useState<any>(null)

  const rootRef = useRef<HTMLDivElement>(null)
  const uploaderRef = useRef<UploadTriggerRef | null>(null)
  const windowElementRef = useRef<any>(null)
  const notificationManagerRef = useRef<NotificationManager | null>(null)
  const eventDispatcherRef = useRef<EventEmitter>(new EventEmitter())
  const onlineTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const toastClearerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const toastClearer2Ref = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef<boolean>(false)

  const state: ChatState = {
    hideInput,
    events,
    typing,
    typingAs,
    upload,
    modal,
    modalHiding,
    conversationMeta,
    online,
    localePrefs,
    joined,
    socket,
    toastHiding,
    toast,
    modalParams,
  }

  const stateRef = useRef(state)
  stateRef.current = state

  const setState = useCallback((updater: Partial<ChatState> | ((prev: ChatState) => Partial<ChatState>)) => {
    const updates = typeof updater === 'function' ? updater(stateRef.current) : updater
    if (updates.hideInput !== undefined) setHideInput(updates.hideInput)
    if (updates.events !== undefined) setEvents(updates.events)
    if (updates.typing !== undefined) setTyping(updates.typing)
    if (updates.typingAs !== undefined) setTypingAs(updates.typingAs)
    if (updates.upload !== undefined) setUpload(updates.upload)
    if (updates.modal !== undefined) setModal(updates.modal)
    if (updates.modalHiding !== undefined) setModalHiding(updates.modalHiding)
    if (updates.conversationMeta !== undefined) setConversationMeta(updates.conversationMeta)
    if (updates.online !== undefined) setOnline(updates.online)
    if (updates.localePrefs !== undefined) setLocalePrefs(updates.localePrefs)
    if (updates.joined !== undefined) setJoined(updates.joined)
    if (updates.toastHiding !== undefined) setToastHiding(updates.toastHiding)
    if (updates.toast !== undefined) setToast(updates.toast)
    if (updates.modalParams !== undefined) setModalParams(updates.modalParams)
  }, [])

  const getSpan = useCallback((): ChatSpan => {
    function getCursor(event: Message<any> | undefined) {
      if (!event || !event.id) return null
      const iso = new Date(event.time).toISOString()
      return `${iso}#${event.id}`
    }

    return {
      newest: getCursor(events[events.length - 1]),
      oldest: getCursor(events[0]),
    }
  }, [events])

  const normalizeEvent = useCallback((message: Message<any>): Message<any> => {
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
  }, [])

  const addEvent = useCallback(
    (event: any) => {
      eventDispatcherRef.current.emit('chat_event', event)
      if (events.find(e => !!e.id && e.id === event.id)) return

      const normalized = normalizeEvent(event)
      setEvents(prev => [...prev, normalized])
      setTyping(false)
      setTimeout(() => {
        chatMessagesEvents.emit('scrollToBottom')
      }, 0)
    },
    [events, normalizeEvent],
  )

  const showModal = useCallback((message: Message<any>, modalParams: any) => {
    setModal(message)
    setModalParams(modalParams)
  }, [])

  const hideModal = useCallback(() => {
    if (modal === null) {
      return
    }
    setModalHiding(true)
    setTimeout(() => {
      setModal(null)
      setModalHiding(false)
    }, 300)
  }, [modal])

  const showToast = useCallback(
    (toast: any) => {
      if (toastClearerRef.current) {
        clearTimeout(toastClearerRef.current)
      }
      if (toastClearer2Ref.current) {
        clearTimeout(toastClearer2Ref.current)
      }

      setToast(toast)
      setToastHiding(false)

      toastClearer2Ref.current = setTimeout(() => {
        setToastHiding(true)

        setTimeout(() => {
          toastClearerRef.current = null
          setToast(null)
          setToastHiding(false)
        }, 500)
      }, 4000)
    },
    [],
  )

  const triggerModal = useCallback(() => {
    if (handlerRef.current._lastModal) {
      showModal(handlerRef.current._lastModal, null)
    }
  }, [showModal])

  const triggerAudio = useCallback((payload: any) => {
    handlerRef.current.handleAudioEvent(payload)
  }, [])

  const prependEvents = useCallback(
    (history: Message<any>[], cb?: () => void, initial?: boolean) => {
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
          const hideInputValue = lastInputState.payload.payload
          setHideInput(hideInputValue)
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
          setTimeout(() => triggerModal(), 0)
        }
      }

      const normalizedHistory = history.map(e => normalizeEvent(e))
      setEvents(prev => [...normalizedHistory, ...prev])
      if (cb) {
        setTimeout(cb, 0)
      }
    },
    [normalizeEvent, triggerModal],
  )

  const forceUpdate = useCallback(() => {
    // Force re-render by updating a dummy state
    setToastHiding(prev => !prev)
    setTimeout(() => setToastHiding(prev => !prev), 0)
  }, [])

  const componentRef = useRef<ChatComponentRef>({
    setState,
    state,
    props,
    windowElement: windowElementRef.current,
    uploader: uploaderRef.current,
    showModal,
    hideModal,
    addEvent,
    getSpan,
    prependEvents,
    triggerModal,
    showToast,
    triggerAudio,
    mounted: mountedRef.current,
    forceUpdate,
  })

  componentRef.current.state = state
  componentRef.current.props = props
  componentRef.current.windowElement = windowElementRef.current
  componentRef.current.uploader = uploaderRef.current
  componentRef.current.showModal = showModal
  componentRef.current.hideModal = hideModal
  componentRef.current.addEvent = addEvent
  componentRef.current.getSpan = getSpan
  componentRef.current.prependEvents = prependEvents
  componentRef.current.triggerModal = triggerModal
  componentRef.current.showToast = showToast
  componentRef.current.triggerAudio = triggerAudio
  componentRef.current.mounted = mountedRef.current
  componentRef.current.forceUpdate = forceUpdate

  const handlerRef = useRef<ChatHandler>(new ChatHandler(componentRef.current))

  useEffect(() => {
    if (props.notificationManager) {
      notificationManagerRef.current = new NotificationManager(componentRef.current)
    }
    if (!props.socket) {
      socket.connect()
    }
  }, [props.notificationManager, props.socket, socket])

  useEffect(() => {
    mountedRef.current = true
    handlerRef.current.joinChannel(props, socket, getSpan)

    if (notificationManagerRef.current) {
      notificationManagerRef.current.componentDidMount()
    }
    if (rootRef.current) {
      windowElementRef.current = rootRef.current.querySelector('.chat-window')
    }

    return () => {
      mountedRef.current = false
      if (notificationManagerRef.current) {
        notificationManagerRef.current.componentWillUnmount()
      }
      handlerRef.current.leaveChannel()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (props.bot_id !== undefined && props.bot_id !== componentRef.current.props.bot_id) {
      handlerRef.current.joinChannel(props, socket, getSpan)
    }
    if (notificationManagerRef.current) {
      notificationManagerRef.current.windowFocusChange()
    }

    if (props.online !== undefined && props.online !== componentRef.current.props.online) {
      if (props.online) {
        if (onlineTimeoutRef.current) {
          clearTimeout(onlineTimeoutRef.current)
        }
        setOnline(true)
      } else {
        onlineTimeoutRef.current = setTimeout(() => setOnline(false), 1000)
      }
    }
  }, [props.bot_id, props.online, socket, getSpan])

  const localePrefsComputed = useMemo(() => {
    return (conversationMeta?.locale ? [conversationMeta.locale] : localePrefs).map(l =>
      l.replace(/[^a-z].*$/, ''),
    )
  }, [conversationMeta, localePrefs])

  const contextProps: Partial<ChatContextProps> = useMemo(
    () => ({
      ...props,
      hideInput,
      events,
      typing,
      typingAs,
      upload,
      modalHiding,
      conversationMeta,
      online,
      localePrefs: localePrefsComputed,
      channel: handlerRef.current.channel,
      handler: handlerRef.current,
      showToast,
      message: modal,
    }),
    [
      props,
      hideInput,
      events,
      typing,
      typingAs,
      upload,
      modalHiding,
      conversationMeta,
      online,
      localePrefsComputed,
      showToast,
      modal,
    ],
  )

  const chatModalProps = useMemo(
    () => ({
      handler: handlerRef.current,
      message: modal as Message<Payload>,
      hiding: modalHiding,
      modalParams: modalParams,
      onLoad: null,
      settings: props.settings,
      localePrefs: localePrefsComputed,
    }),
    [modal, modalHiding, modalParams, props.settings, localePrefsComputed],
  )

  return (
    <ChatContext initial={{ ...contextProps }}>
      <div className="botsi-web-client" ref={rootRef}>
        <ChatWindow />
        {toast ? <ChatToast toast={toast} hiding={toastHiding} /> : null}
        {modal ? <ChatModal {...chatModalProps} /> : null}
        {!online ? <span className="offline">{Offline}</span> : null}
        <UploadTrigger
          ref={uploader => {
            uploaderRef.current = uploader
          }}
        />
        {!joined ? <div className="loader joining" /> : null}
      </div>
    </ChatContext>
  )
}

export { Chat }
export default Chat
