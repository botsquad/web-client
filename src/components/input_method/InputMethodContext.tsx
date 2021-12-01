import React from 'react'
import { createContext, useContext, useState } from 'react'
import InputMethodTemplate from '../elements/InputMethodTemplate'
import { ChatHandler } from '../index'

export function useInputMethodProps() {
  return useContext(InputMethodPropsContext)
}

export function useInputMethodPropsUpdate() {
  return useContext(InputMethodUpdateContext)
}

interface InputMethodProps {
  config: any
  handler: ChatHandler | null
  inline: boolean
  inputModal: InputMethodTemplate | null
}

const DEFAULT_INPUT_METHOD_PROPS: InputMethodProps = {
  config: null,
  handler: null,
  inline: false,
  inputModal: null,
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
