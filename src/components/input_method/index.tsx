import React from 'react'

import SingleItemPicker from './SingleItemPicker'
import MultiItemPicker from './MultiItemPicker'

import Form from './Form'
import LocationPicker from './LocationPicker'
import Wait from './Wait'
import NumericKeyboard from './NumericKeyboard'
import InputMethodContext from './InputMethodContext'
export default function elementFactory(method: { type: string; payload: any; time: any }, props: any, inputModal: any) {
  const { type, payload, time } = method
  let element = (
    <div>
      Unsupported input method: <b>{type}</b>
    </div>
  )

  if (type === 'item_picker' && payload.mode === 'single') {
    element = <SingleItemPicker />
  }
  if (type === 'item_picker' && payload.mode === 'multiple') {
    element = <MultiItemPicker />
  }
  if (type === 'location') {
    element = <LocationPicker />
  }
  if (type === 'form') {
    element = <Form {...props} config={payload} inputModal={inputModal} />
  }
  if (type === 'wait') {
    element = <Wait {...props} time={time} type={type} config={payload} inputModal={inputModal} />
  }
  if (type === 'closed') {
    element = <Wait {...props} time={time} type={type} config={payload} inputModal={inputModal} />
  }
  if (type === 'numeric') {
    element = <NumericKeyboard {...props} time={time} type={type} config={payload} inputModal={inputModal} />
  }
  /*
     if (type === 'barcode') {
     return <Barcode {...props} config={payload} inputModal={inputModal} />
     }
   */

  return <InputMethodContext props={{ ...props, config: payload, inputModal }}>{element}</InputMethodContext>
}
