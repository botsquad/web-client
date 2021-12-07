import { Argument } from 'classnames'
import { Channel, Socket } from 'phoenix'
import React, { useEffect } from 'react'
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
  online: Argument
  params: any
  payload: any
  settings: any // { layout: string, }
  socket: Socket
  typing: boolean
  typingAs: any
  upload: any
  inputMethodOverride: any
  onCancel: () => void
  onFinish: () => void
  showToast: (toast: { message: string }) => void
  hiding: boolean
  modal: Message<Payload>
  modalParams: any
  host: any
  elementFactory: any
  botAvatar: any
  userAvatar: any
  scrollToBottom: () => void
  onClose: () => void
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
  upload: null, // { type: any; progress: any; retry: any }
  inputMethodOverride: null,
  onCancel: null,
  onFinish: null,
  showToast: null,
  hiding: false,
  modal: null,
  modalParams: null,
  host: null,
  elementFactory: null,
  botAvatar: null,
  userAvatar: null,
  scrollToBottom: null,
  onClose: null,
}

type ChatUpdateType = (update: any) => void

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

  const updateValues = update => {
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
