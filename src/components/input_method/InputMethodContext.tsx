import classNames from 'classnames'
import { Channel } from 'phoenix'
import { createContext, ReactNode, useContext, useState } from 'react'
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
}

interface InputMethodUpdate {
  setBotId: React.Dispatch<React.SetStateAction<string>>
  setChannel: React.Dispatch<React.SetStateAction<Channel>>
  setClassName: React.Dispatch<React.SetStateAction<string>>
  setConversationMeta: React.Dispatch<React.SetStateAction<any>>
  setEvents: React.Dispatch<React.SetStateAction<Message<Payload>[]>>
  setHandler: React.Dispatch<React.SetStateAction<ChatHandler>>
}

const DEFAULT_INPUT_METHOD_PROPS: InputMethodProps = {
  botId: '',
  channel: null,
  className: '',
  conversationMeta: null,
  events: [],
  handler: null,
}

const InputMethodPropsContext = createContext<InputMethodProps>(DEFAULT_INPUT_METHOD_PROPS)
const InputMethodUpdateContext = createContext<InputMethodUpdate>(null)

const ElementFactoryProvider = ({ children }: { children: ReactNode }) => {
  const [botId, setBotId] = useState(DEFAULT_INPUT_METHOD_PROPS.botId)
  const [channel, setChannel] = useState<Channel>(DEFAULT_INPUT_METHOD_PROPS.channel)
  const [className, setClassName] = useState(DEFAULT_INPUT_METHOD_PROPS.className)
  const [conversationMeta, setConversationMeta] = useState<any>(DEFAULT_INPUT_METHOD_PROPS.conversationMeta)
  const [events, setEvents] = useState<Message<Payload>[]>(DEFAULT_INPUT_METHOD_PROPS.events)
  const [handler, setHandler] = useState<ChatHandler>()

  const props = { botId, channel, className, conversationMeta, events, handler }
  const updaters = { setBotId, setChannel, setClassName, setConversationMeta, setEvents, setHandler }

  return (
    <InputMethodPropsContext.Provider value={props}>
      <InputMethodUpdateContext.Provider value={updaters}>{children}</InputMethodUpdateContext.Provider>
    </InputMethodPropsContext.Provider>
  )
}
