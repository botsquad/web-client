import React from 'react'

import SingleItemPicker from './SingleItemPicker'
import MultiItemPicker from './MultiItemPicker'
import Form from './Form'
import DatePicker from './DatePicker'
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
  time?: number
}

interface FactoryProps {
  handler: ChatHandler
  inline?: boolean
  inputModal?: InputMethodTemplate | null
  settings: Record<string, any> | null
  localePrefs: string[]
  message?: Message<Payload> | null
}

export default function elementFactory(
  { type, payload, time }: MethodProps,
  props: FactoryProps,
  inputModal: { finish: (type: any, payload: any, config: any) => void; cancel: () => void },
) {
  const { handler, inline, settings, localePrefs, message } = props
  if (!settings) {
    return null
  }
  let element = (
    <div>
      Unsupported input method: <b>{type}</b>
    </div>
  )
  if (type === 'item_picker' && payload.mode === 'single') {
    element = <SingleItemPicker settings={settings} />
  }
  if (type === 'item_picker' && payload.mode === 'multiple') {
    element = <MultiItemPicker settings={settings} />
  }
  if (type === 'date_picker') {
    element = <DatePicker settings={settings} />
  }
  if (type === 'location') {
    element = <LocationPicker settings={settings} />
  }
  if (type === 'form') {
    element = <Form message={message} settings={settings} />
  }
  if (type === 'wait') {
    element = <Wait time={time} type={type} />
  }
  if (type === 'closed') {
    element = <Wait time={time} type={type} />
  }
  if (type === 'numeric') {
    element = <NumericKeyboard settings={settings} />
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
