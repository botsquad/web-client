import { useMemo } from 'react'
import { ChatHandler } from 'components'

import inputMethodFactory from '../input_method'
import Message, { Payload } from './types'

interface Props {
  payload: any
  handler: ChatHandler
  settings: Record<string, any>
  localePrefs: string[]
  message: Message<Payload>
}

function InputMethodTemplate(props: Props) {
  const { payload, handler } = props
  const inputModal = useMemo(
    () => ({
      cancel: () => {
        return
      },
      finish: (type: string, payload: any, config: any) => {
        if (type === 'user_location' && !config?.event) {
          // send raw
          handler.send('user_location', payload)
          return
        }

        // Wrap other responses in an event
        const name = config?.event || '$' + payload.type

        let finalPayload = payload
        if (payload.type === 'form') {
          finalPayload = { _template_id: props.payload.template_id, ...payload.data }
        } else if (type !== 'user_location') {
          finalPayload = payload.data
        }

        handler.send('user_event', { name, payload: finalPayload })
      },
    }),
    [handler, props.payload.template_id],
  )

  return inputMethodFactory(
    { type: payload.input_method, payload, time: 0 },
    { inline: true, inputModal, ...props },
    inputModal as any,
  )
}

export default InputMethodTemplate
