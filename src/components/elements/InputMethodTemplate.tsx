import { ChatHandler } from 'components'
import React from 'react'

import inputMethodFactory from '../input_method'
import Message, { Payload } from './types'

interface Props {
  payload: any
  handler: ChatHandler
  settings: Record<string, any>
  localePrefs: string[]
  message: Message<Payload>
}

export default class InputMethodTemplate extends React.Component<Props> {
  cancel: () => void = () => {
    return
  }

  finish(type: string, payload: any, config: any) {
    if (type === 'user_location' && !config?.event) {
      // send raw
      this.props.handler.send('user_location', payload)
      return
    }

    // Wrap other responses in an event
    const name = config?.event || '$' + payload.type

    if (payload.type === 'form') {
      payload = { _template_id: this.props.payload.template_id, ...payload.data }
    } else if (type !== 'user_location') {
      payload = payload.data
    }

    this.props.handler.send('user_event', { name, payload })
  }

  render() {
    const { payload } = this.props
    return inputMethodFactory(
      { type: payload.input_method, payload, time: 0 },
      { inline: true, inputModal: this, ...this.props },
      this,
    )
  }
}
