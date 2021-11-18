import React from 'react'

import inputMethodFactory from '../input_method'
import { Location } from './types'

interface Props {
  payload: any
  handler: any
}

export default class InputMethodTemplate extends React.Component<Props> {
  finish(type: string, payload: any, config: any) {
    if (type === 'location' && !config?.event) {
      // send raw
      this.props.handler.send(type, payload)
      return
    }

    // Wrap other responses in an event
    const name = config?.event || '$' + payload.type

    if (payload.type === 'form') {
      payload = { _template_id: this.props.payload.template_id, ...payload.data }
    } else if (type !== 'location') {
      payload = payload.data
    }

    this.props.handler.send('event', { name, payload })
  }

  render() {
    const { payload } = this.props

    return inputMethodFactory(
      { type: payload.input_method, payload, time: null },
      { inline: true, inputModal: this, ...this.props },
      this,
    )
  }
}
