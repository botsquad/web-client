import classNames from 'classnames'
import { Channel, Socket } from 'phoenix'
import { createContext, ReactNode, useContext, useState } from 'react'
import ChatMessages from '../ChatMessages'
import InputMethodTemplate from '../elements/InputMethodTemplate'
import Message, { Payload } from '../elements/types'
import { ChatHandler } from '../index'

export function useInputMethodProps() {
  return useContext(InputMethodPropsContext)
}

export function useInputMethodPropsUpdate() {
  return useContext(InputMethodUpdateContext)
}

interface InputMethodProps {
  botId: string
  channel: Channel
  className: string
  conversationMeta: any
  events: any[]
  handler: ChatHandler
  hideAvatars: boolean
  inline: boolean
  inputModal: InputMethodTemplate
  joined: boolean
  layout: string
  localePrefs: string[]
  mapsApiKey: string
  message: Message<Payload>
  modalHiding: boolean
  onLoad: () => void
  online: boolean
  params: any
  payload: any
  settings: any
  socket: Socket
  typing: boolean
  typingAs: any
  upload: any
  chatMessages: ChatMessages
  inputMethodOverride: any
  onCancel: () => void
  onFinish: () => void
}

const DEFAULT_INPUT_METHOD_PROPS: InputMethodProps = {
  botId: '',
  channel: null,
  className: '',
  conversationMeta: null,
  events: [],
  handler: null,
  hideAvatars: false,
  inline: false,
  inputModal: null,
  joined: false,
  layout: undefined,
  localePrefs: [],
  mapsApiKey: '',
  message: null,
  modalHiding: false,
  onLoad: null,
  online: false,
  params: null,
  payload: null,
  settings: null,
  socket: null,
  typing: false,
  typingAs: null,
  upload: null,
  chatMessages: null,
  inputMethodOverride: null,
  onCancel: null,
  onFinish: null,
}

interface InputMethodUpdate {
  setBotId: React.Dispatch<React.SetStateAction<string>>
  setChannel: React.Dispatch<React.SetStateAction<Channel>>
  setClassName: React.Dispatch<React.SetStateAction<string>>
  setConversationMeta: React.Dispatch<React.SetStateAction<any>>
  setEvents: React.Dispatch<React.SetStateAction<any[]>>
  setHandler: React.Dispatch<React.SetStateAction<ChatHandler>>
  setHideAvatars: React.Dispatch<React.SetStateAction<boolean>>
  setInline: React.Dispatch<React.SetStateAction<boolean>>
  setInputModal: React.Dispatch<React.SetStateAction<InputMethodTemplate>>
  setJoined: React.Dispatch<React.SetStateAction<boolean>>
  setLocalePrefs: React.Dispatch<React.SetStateAction<string[]>>
  setMapsApiKey: React.Dispatch<React.SetStateAction<string>>
  setMessage: React.Dispatch<React.SetStateAction<Message<Payload>>>
  setModalHiding: React.Dispatch<React.SetStateAction<boolean>>
  setOnLoad: React.Dispatch<React.SetStateAction<() => void>>
  setOnline: React.Dispatch<React.SetStateAction<boolean>>
  setParams: React.Dispatch<any>
  setPayload: React.Dispatch<any>
  setSettings: React.Dispatch<any>
  setSocket: React.Dispatch<React.SetStateAction<Socket>>
  setTyping: React.Dispatch<React.SetStateAction<boolean>>
  setTypingAs: React.Dispatch<any>
  setUpload: React.Dispatch<any>
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessages>>
  setInputMethodOverride: React.Dispatch<any>
  setOnCancel: React.Dispatch<React.SetStateAction<() => void>>
  setOnFinish: React.Dispatch<React.SetStateAction<() => void>>
}

const InputMethodPropsContext = createContext<InputMethodProps>(DEFAULT_INPUT_METHOD_PROPS)
const InputMethodUpdateContext = createContext<InputMethodUpdate>(null)

const ElementFactoryProvider = ({ children }: { children: ReactNode }) => {
  const [botId, setBotId] = useState(DEFAULT_INPUT_METHOD_PROPS.botId)
  const [channel, setChannel] = useState<Channel>(DEFAULT_INPUT_METHOD_PROPS.channel)
  const [className, setClassName] = useState(DEFAULT_INPUT_METHOD_PROPS.className)
  const [conversationMeta, setConversationMeta] = useState<any>(DEFAULT_INPUT_METHOD_PROPS.conversationMeta)
  const [events, setEvents] = useState<Message<Payload>[]>(DEFAULT_INPUT_METHOD_PROPS.events)
  const [handler, setHandler] = useState<ChatHandler>(DEFAULT_INPUT_METHOD_PROPS.handler)
  const [hideAvatars, setHideAvatars] = useState(DEFAULT_INPUT_METHOD_PROPS.hideAvatars)
  const [inline, setInline] = useState(DEFAULT_INPUT_METHOD_PROPS.inline)
  const [inputModal, setInputModal] = useState<InputMethodTemplate>(DEFAULT_INPUT_METHOD_PROPS.inputModal)
  const [joined, setJoined] = useState(DEFAULT_INPUT_METHOD_PROPS.joined)
  const [layout, setLayout] = useState<string>(DEFAULT_INPUT_METHOD_PROPS.layout)
  const [localePrefs, setLocalePrefs] = useState(DEFAULT_INPUT_METHOD_PROPS.localePrefs)
  const [mapsApiKey, setMapsApiKey] = useState(DEFAULT_INPUT_METHOD_PROPS.mapsApiKey)
  const [message, setMessage] = useState<Message<Payload>>(DEFAULT_INPUT_METHOD_PROPS.message)
  const [modalHiding, setModalHiding] = useState(DEFAULT_INPUT_METHOD_PROPS.modalHiding)
  const [onLoad, setOnLoad] = useState<() => void>(DEFAULT_INPUT_METHOD_PROPS.onLoad)
  const [online, setOnline] = useState(DEFAULT_INPUT_METHOD_PROPS.online)
  const [params, setParams] = useState(DEFAULT_INPUT_METHOD_PROPS.params)
  const [payload, setPayload] = useState(DEFAULT_INPUT_METHOD_PROPS.payload)
  const [settings, setSettings] = useState(DEFAULT_INPUT_METHOD_PROPS.settings)
  const [socket, setSocket] = useState(DEFAULT_INPUT_METHOD_PROPS.socket)
  const [typing, setTyping] = useState(DEFAULT_INPUT_METHOD_PROPS.typing)
  const [typingAs, setTypingAs] = useState(DEFAULT_INPUT_METHOD_PROPS.typingAs)
  const [upload, setUpload] = useState(DEFAULT_INPUT_METHOD_PROPS.upload)
  const [chatMessages, setChatMessages] = useState(DEFAULT_INPUT_METHOD_PROPS.chatMessages)
  const [inputMethodOverride, setInputMethodOverride] = useState(DEFAULT_INPUT_METHOD_PROPS.inputMethodOverride)
  const [onCancel, setOnCancel] = useState<() => void>(DEFAULT_INPUT_METHOD_PROPS.onCancel)
  const [onFinish, setOnFinish] = useState<() => void>(DEFAULT_INPUT_METHOD_PROPS.onFinish)

  const props = {
    botId,
    channel,
    className,
    conversationMeta,
    events,
    handler,
    hideAvatars,
    inline,
    inputModal,
    joined,
    layout,
    localePrefs,
    mapsApiKey,
    message,
    modalHiding,
    onLoad,
    online,
    params,
    payload,
    settings,
    socket,
    typing,
    typingAs,
    upload,
    chatMessages,
    inputMethodOverride,
    onCancel,
    onFinish,
  }
  const updaters = {
    setBotId,
    setChannel,
    setClassName,
    setConversationMeta,
    setEvents,
    setHandler,
    setHideAvatars,
    setInline,
    setInputModal,
    setJoined,
    setLayout,
    setLocalePrefs,
    setMapsApiKey,
    setMessage,
    setModalHiding,
    setOnLoad,
    setOnline,
    setParams,
    setPayload,
    setSettings,
    setSocket,
    setTyping,
    setTypingAs,
    setUpload,
    setChatMessages,
    setInputMethodOverride,
    setOnCancel,
    setOnFinish,
  }

  return (
    <InputMethodPropsContext.Provider value={props}>
      <InputMethodUpdateContext.Provider value={updaters}>{children}</InputMethodUpdateContext.Provider>
    </InputMethodPropsContext.Provider>
  )
}
