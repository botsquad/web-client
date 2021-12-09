import { Argument } from 'classnames'
import { Channel } from 'phoenix'
import React, { useEffect } from 'react'
import { createContext, useContext, useState } from 'react'
import { ChatHandler } from '.'
import InputMethodTemplate from './elements/InputMethodTemplate'
import Message, { Payload } from './elements/types'
import ElementFactory from './elements'

export function useChatProps() {
  return useContext(ChatPropsContext)
}

export function useChatPropsUpdate() {
  return useContext(ChatUpdateContext)
}

interface ChatProps {
  channel: Channel & { hasMoreHistory: () => boolean; getMoreHistory: () => any }
  conversationMeta: any
  events: any[]
  handler: ChatHandler
  hideAvatars: boolean
  inline: boolean
  inputModal: InputMethodTemplate
  localePrefs: string[]
  message: Message<Payload>
  online: Argument
  settings: {
    layout: string
    alwaysFocus: boolean
    chat_config: any
    ui_labels: any
    hide_input: boolean
    [key: string]: any // For everything else that might be needed
  }
  typing: boolean
  typingAs: any
  upload: any
  inputMethodOverride: any
  modal: Message<Payload>
  modalParams: any
  host: any
  elementFactory: typeof ElementFactory
  botAvatar: any
  userAvatar: any
  scrollToBottom: () => void
}

const DEFAULT_INPUT_METHOD_PROPS: ChatProps = {
  channel: null,
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
