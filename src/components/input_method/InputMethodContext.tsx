import React from 'react'
import { Channel, Socket } from 'phoenix'
import { createContext, useContext, useState } from 'react'
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
  config: any
  bot_id: string
  channel: Channel | null
  className: string
  conversationMeta: any
  events: any[]
  handler: ChatHandler | null
  hideAvatars: boolean
  inline: boolean
  inputModal: InputMethodTemplate | null
  joined: boolean
  layout: string
  localePrefs: string[]
  mapsApiKey: string
  message: Message<Payload> | null
  modalHiding: boolean
  onLoad: (() => void) | null
  online: boolean
  params: any
  payload: any
  settings: any
  socket: Socket | null
  typing: boolean
  typingAs: any
  upload: any
  chatMessages: ChatMessages | null
  inputMethodOverride: any
  onCancel: (() => void) | null
  onFinish: (() => void) | null
}

const DEFAULT_INPUT_METHOD_PROPS: InputMethodProps = {
  config: null,
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
  layout: '',
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

type inputMethodUpdateType = (name: keyof InputMethodProps, value: any) => void

const InputMethodPropsContext = createContext<InputMethodProps>(DEFAULT_INPUT_METHOD_PROPS)
// {} as inputMethodUpdateType prevents showing that it could be null
const InputMethodUpdateContext = createContext<inputMethodUpdateType>({} as inputMethodUpdateType)

const InputMethodContext = (props: any) => {
  const [values, setValues] = useState<InputMethodProps>({
    ...props.props,
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

export default InputMethodContext
