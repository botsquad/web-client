import { createContext, ReactNode, useContext, useState } from 'react'

export function useInputMethodProps {
  return useContext(InputMethodPropsContext)
}

export function useInputMethodPropsUpdate {
  return useContext(InputMethodUpdateContext)
}

interface inputMethodProps {
  botId: string
}

interface inputMethodUpdate {
  setBotId: ([string]:string) => void
}

const defaultInputMethodProps  = {
  botId: ''
}


const InputMethodPropsContext = createContext<inputMethodProps>(defaultInputMethodProps)
const InputMethodUpdateContext = createContext<inputMethodUpdate>(null)

const ElementFactoryProvider = ({ children }:{children:ReactNode}) => {
  const [botId, setBotId] = useState('')

  return (
    <InputMethodPropsContext.Provider value = {{botId}}>
      <InputMethodUpdateContext.Provider value={{setBotId}}>{children}</InputMethodUpdateContext.Provider>
    </InputMethodPropsContext.Provider>
  )
}
