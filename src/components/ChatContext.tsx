import { Argument } from 'classnames'
import { Channel } from 'phoenix'
import React, { useMemo, ReactNode } from 'react'
import { createContext, useContext, useState } from 'react'
import { ChatHandler } from '.'
import Message, { As, Payload } from './elements/types'
import ElementFactory from './elements'
import { API } from '@botsquad/sdk'

export interface InputModalInterface {
  cancel: () => void
  finish: (type: string, payload: any, config: any) => void
}

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

export interface OperatorChatInputComponentProps {
  channel: AugmentedChannel
  conversationMeta?: API.Conversation
  handler?: ChatHandler
}

export interface ChatContextProps {
  channel?: AugmentedChannel
  conversationMeta?: API.Conversation
  events: Message<any>[]
  handler: ChatHandler
  hideAvatars: boolean
  inline: boolean
  inputModal: InputModalInterface | null
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
  operatorConversationId?: string
  hideInput: boolean
  operatorChatInputComponent?: React.FC<OperatorChatInputComponentProps>
  params?: Record<string, any>
}

const DEFAULT_INPUT_METHOD_PROPS: ChatContextProps = {
  channel: undefined,
  conversationMeta: undefined,
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
  showToast: toast => console.log(toast),
  hideInput: false,
}

type ChatUpdateType = (update: Partial<ChatContextProps>) => void

const ChatPropsContext = createContext<ChatContextProps>(DEFAULT_INPUT_METHOD_PROPS)
// {} as ChatUpdateType prevents showing that it could be null
const ChatUpdateContext = createContext<ChatUpdateType>({} as ChatUpdateType)

const ChatContext: React.FC<{ initial: Partial<ChatContextProps>; children: ReactNode }> = props => {
  // Directly use props.initial merged with defaults - no need to sync to state
  const [localUpdates, setLocalUpdates] = useState<Partial<ChatContextProps>>({})
  
  const values = useMemo(
    () => ({
      ...DEFAULT_INPUT_METHOD_PROPS,
      ...props.initial,
      ...localUpdates,
    }),
    [props.initial, localUpdates],
  )

  const updateValues = (update: Partial<ChatContextProps>) => {
    setLocalUpdates(prevState => ({ ...prevState, ...update }))
  }

  return (
    <ChatPropsContext.Provider value={values}>
      <ChatUpdateContext.Provider value={updateValues}>{props.children}</ChatUpdateContext.Provider>
    </ChatPropsContext.Provider>
  )
}

export default ChatContext
