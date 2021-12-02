import React from 'react'
import { createContext, useContext, useState } from 'react'

export function useChatProps() {
  return useContext(ChatPropsContext)
}

export function useChatPropsUpdate() {
  return useContext(ChatUpdateContext)
}

interface ChatProps {}

const DEFAULT_INPUT_METHOD_PROPS: ChatProps = {}

type ChatUpdateType = (name: keyof ChatProps, value: any) => void

const ChatPropsContext = createContext<ChatProps>(DEFAULT_INPUT_METHOD_PROPS)
// {} as ChatUpdateType prevents showing that it could be null
const ChatUpdateContext = createContext<ChatUpdateType>({} as ChatUpdateType)

const InputMethodContext = (props: any) => {
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

export default InputMethodContext
