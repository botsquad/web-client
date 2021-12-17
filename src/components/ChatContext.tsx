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

interface ChatProps {
  channel: Channel & { hasMoreHistory: () => boolean; getMoreHistory: () => any }
  conversationMeta: any
  events: Message<any>[]
  handler: ChatHandler | null
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
}

const DEFAULT_INPUT_METHOD_PROPS: ChatProps = {
  channel: {} as Channel & { hasMoreHistory: () => boolean; getMoreHistory: () => any },
  conversationMeta: null,
  events: [],
  handler: null,
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
}

type ChatUpdateType = (update: Partial<ChatProps>) => void

const ChatPropsContext = createContext<ChatProps>(DEFAULT_INPUT_METHOD_PROPS)
// {} as ChatUpdateType prevents showing that it could be null
const ChatUpdateContext = createContext<ChatUpdateType>({} as ChatUpdateType)

const ChatContext = (props: any) => {
  const [values, setValues] = useState<ChatProps>({
    ...DEFAULT_INPUT_METHOD_PROPS,
    ...props.props,
  })

  useEffect(() => {
    setValues({ ...values, ...props.props })
  }, [props.props])

  const updateValues = (update: Partial<ChatProps>) => {
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
