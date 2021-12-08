import React from 'react'

import SingleItemPicker from './SingleItemPicker'
import MultiItemPicker from './MultiItemPicker'

import Form from './Form'
import LocationPicker from './LocationPicker'
import Wait from './Wait'
import NumericKeyboard from './NumericKeyboard'
import InputMethodContext from './InputMethodContext'
import InputMethodTemplate from 'components/elements/InputMethodTemplate'
import { ChatHandler } from '../index'
import Message, { Payload } from '../elements/types'

interface MethodProps {
  type: string
  payload: any
  time: number
}

interface FactoryProps {
  handler: ChatHandler | null
  inline: boolean
  inputModal: InputMethodTemplate | null
  settings: any
  localePrefs: string[]
  message: Message<Payload>
}

export default function elementFactory(
  { type, payload, time }: MethodProps,
  props: FactoryProps,
  inputModal: InputMethodTemplate,
) {
  const { handler, inline, settings, localePrefs, message } = props

  let element = (
    <div>
      Unsupported input method: <b>{type}</b>
    </div>
  )
  if (type === 'item_picker' && payload.mode === 'single') {
    element = <SingleItemPicker {...{ settings }} />
  }
  if (type === 'item_picker' && payload.mode === 'multiple') {
    element = <MultiItemPicker {...{ settings }} />
  }
  if (type === 'location') {
    element = <LocationPicker {...{ settings }} />
  }
  if (type === 'form') {
    element = <Form {...{ message, settings }} />
  }
  if (type === 'wait') {
    element = <Wait {...{ time, type }} />
  }
  if (type === 'closed') {
    element = <Wait {...{ time, type }} />
  }
  if (type === 'numeric') {
    element = <NumericKeyboard {...{ settings }} />
  }
  /*
     if (type === 'barcode') {
     return <Barcode {...props} config={payload} inputModal={inputModal} />
     }
   */

  return (
    <InputMethodContext props={{ handler, inline, config: payload, inputModal, localePrefs }}>
      {element}
    </InputMethodContext>
  )
}
