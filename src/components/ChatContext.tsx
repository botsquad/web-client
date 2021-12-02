import { Channel, Socket } from 'phoenix'
import React from 'react'
import { createContext, useContext, useState } from 'react'
import { ChatHandler } from '.'
import ChatMessages from './ChatMessages'
import InputMethodTemplate from './elements/InputMethodTemplate'
import Message, { Payload } from './elements/types'

export function useChatProps() {
  return useContext(ChatPropsContext)
}

export function useChatPropsUpdate() {
  return useContext(ChatUpdateContext)
}

interface ChatProps {
  bot_id: string
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
  toast: { message: string }
  toastHiding: boolean
  showToast: (toast: { message: string }) => void
  hiding: boolean
  modal: Message<Payload>
  modalParams: any
}

const DEFAULT_INPUT_METHOD_PROPS: ChatProps = {
  bot_id: '',
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
  toast: null,
  toastHiding: false,
  showToast: null,
  hiding: false,
  modal: null,
  modalParams: null,
}

type ChatUpdateType = (name: keyof ChatProps, value: any) => void

const ChatPropsContext = createContext<ChatProps>(DEFAULT_INPUT_METHOD_PROPS)
// {} as ChatUpdateType prevents showing that it could be null
const ChatUpdateContext = createContext<ChatUpdateType>({} as ChatUpdateType)

const ChatContext = (props: any) => {
  const [values, setValues] = useState<ChatProps>({
    ...props.props,
  })

  const updateValues = (name: keyof ChatProps, value: any) => {
    setValues({ ...values, [name]: value })
  }

  return (
    <ChatPropsContext.Provider value={values}>
      <ChatUpdateContext.Provider value={updateValues}>{props.children}</ChatUpdateContext.Provider>
    </ChatPropsContext.Provider>
  )
}

export default ChatContext
