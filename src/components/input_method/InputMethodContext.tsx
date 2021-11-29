import classNames from 'classnames'
import { Channel } from 'phoenix'
import { createContext, ReactNode, useContext, useState } from 'react'
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
  events: Message<Payload>[]
  handler: ChatHandler
  hideAvatars: boolean
  inline: boolean
  inputModal: InputMethodTemplate
  joined: boolean
  layout: string
  localePrefs: string[]
  mapsApiKey: string
  message: Message<Payload>
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
}

interface InputMethodUpdate {
  setBotId: React.Dispatch<React.SetStateAction<string>>
  setChannel: React.Dispatch<React.SetStateAction<Channel>>
  setClassName: React.Dispatch<React.SetStateAction<string>>
  setConversationMeta: React.Dispatch<React.SetStateAction<any>>
  setEvents: React.Dispatch<React.SetStateAction<Message<Payload>[]>>
  setHandler: React.Dispatch<React.SetStateAction<ChatHandler>>
  setHideAvatars: React.Dispatch<React.SetStateAction<boolean>>
  setInline: React.Dispatch<React.SetStateAction<boolean>>
  setInputModal: React.Dispatch<React.SetStateAction<InputMethodTemplate>>
  setJoined: React.Dispatch<React.SetStateAction<boolean>>
  setLocalePrefs: React.Dispatch<React.SetStateAction<string[]>>
  setMapsApiKey: React.Dispatch<React.SetStateAction<string>>
  setMessage: React.Dispatch<React.SetStateAction<Message<Payload>>>
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
  }

  return (
    <InputMethodPropsContext.Provider value={props}>
      <InputMethodUpdateContext.Provider value={updaters}>{children}</InputMethodUpdateContext.Provider>
    </InputMethodPropsContext.Provider>
  )
}
