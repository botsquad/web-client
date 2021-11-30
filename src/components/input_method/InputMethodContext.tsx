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
}

const DEFAULT_INPUT_METHOD_PROPS: InputMethodProps = {
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
}

const InputMethodPropsContext = createContext<InputMethodProps>(DEFAULT_INPUT_METHOD_PROPS)
const InputMethodUpdateContext = createContext<(name: keyof InputMethodProps, value: any) => void>(null)

const ElementFactoryProvider = (props: any) => {
  const [values, setValues] = useState<InputMethodProps>({
    ...props,
  })

  const updateValues = (name: keyof InputMethodProps, value: any) => {
    setValues({ ...values, [name]: value })
  }

  return (
    <InputMethodPropsContext.Provider value={values}>
      <InputMethodUpdateContext.Provider value={updateValues}>{props.children}</InputMethodUpdateContext.Provider>
    </InputMethodPropsContext.Provider>
  )
}
