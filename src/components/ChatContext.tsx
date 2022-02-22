import { Argument } from 'classnames'
import { Channel } from 'phoenix'
import React, { useEffect } from 'react'
import { createContext, useContext, useState } from 'react'
import { ChatHandler } from '.'
import InputMethodTemplate from './elements/InputMethodTemplate'
import Message, { As, Payload } from './elements/types'
import ElementFactory from './elements'

export function useChatProps() {
  return useContext(ChatPropsContext)
}

export function useChatPropsUpdate() {
  return useContext(ChatUpdateContext)
}

export type InputMethod = {
  type: string
  payload: any
}

export type AugmentedChannel = Channel & { hasMoreHistory: () => boolean; getMoreHistory: () => any }

export interface ChatContextProps {
  channel?: AugmentedChannel
  conversationMeta: any
  events: Message<any>[]
  handler: ChatHandler
  hideAvatars: boolean
  inline: boolean
  inputModal: InputMethodTemplate | null
  localePrefs: string[]
  message: Message<Payload> | null
  online: Argument
  settings: Record<string, any> | null
  typing: boolean
  typingAs: As | null
  upload: any
  inputMethodOverride: InputMethod | null
  modal: Message<Payload> | null
  modalParams: any
  host: any
  elementFactory: typeof ElementFactory | null
  botAvatar: any
  userAvatar: any
  scrollToBottom: (() => void) | null
  showToast: (toast: any) => void
  hideInput: boolean
}

const DEFAULT_INPUT_METHOD_PROPS: ChatContextProps = {
  channel: {} as Channel & { hasMoreHistory: () => boolean; getMoreHistory: () => any },
  conversationMeta: null,
  events: [],
  handler: null as never,
  hideAvatars: false,
  inline: false,
  inputModal: null,
  localePrefs: [],
  message: null,
  online: false,
  settings: null,
  typing: false,
  typingAs: null,
  upload: null,
  inputMethodOverride: null,
  modal: null,
  modalParams: null,
  host: null,
  elementFactory: null,
  botAvatar: null,
  userAvatar: null,
  scrollToBottom: null,
  showToast: (_toast: any) => {},
  hideInput: false,
}

type ChatUpdateType = (update: Partial<ChatContextProps>) => void

const ChatPropsContext = createContext<ChatContextProps>(DEFAULT_INPUT_METHOD_PROPS)
// {} as ChatUpdateType prevents showing that it could be null
const ChatUpdateContext = createContext<ChatUpdateType>({} as ChatUpdateType)

const ChatContext: React.FC<{ initial: Partial<ChatContextProps> }> = props => {
  const [values, setValues] = useState<ChatContextProps>({
    ...DEFAULT_INPUT_METHOD_PROPS,
    ...props.initial,
  })

  useEffect(() => {
    setValues({ ...values, ...props.initial })
  }, [props.initial])

  const updateValues = (update: Partial<ChatContextProps>) => {
    setValues(prevState => {
      const newValues = { ...prevState, ...update }
      return newValues
    })
  }

  return (
    <ChatPropsContext.Provider value={values}>
      <ChatUpdateContext.Provider value={updateValues}>{props.children}</ChatUpdateContext.Provider>
    </ChatPropsContext.Provider>
  )
}

export default ChatContext
