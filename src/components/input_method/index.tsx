import React from 'react'

import SingleItemPicker from './SingleItemPicker'
import MultiItemPicker from './MultiItemPicker'

import Form from './Form'
import LocationPicker from './LocationPicker'
import Wait from './Wait'
import NumericKeyboard from './NumericKeyboard'

export default function elementFactory(method: { type: string; payload: any; time: any }, props: any, inputModal: any) {
  const { type, payload, time } = method
  console.log(`[Type of Input: ${type}]`, props)
  if (type === 'item_picker' && payload.mode === 'single') {
    return <SingleItemPicker {...props} config={payload} inputModal={inputModal} />
  }
  if (type === 'item_picker' && payload.mode === 'multiple') {
    return <MultiItemPicker {...props} config={payload} inputModal={inputModal} />
  }
  if (type === 'location') {
    return <LocationPicker {...props} config={payload} inputModal={inputModal} />
  }
  if (type === 'form') {
    return <Form {...props} config={payload} inputModal={inputModal} />
  }
  if (type === 'wait') {
    return <Wait {...props} time={time} type={type} config={payload} inputModal={inputModal} />
  }
  if (type === 'closed') {
    return <Wait {...props} time={time} type={type} config={payload} inputModal={inputModal} />
  }
  if (type === 'numeric') {
    return <NumericKeyboard {...props} time={time} type={type} config={payload} inputModal={inputModal} />
  }
  /*
     if (type === 'barcode') {
     return <Barcode {...props} config={payload} inputModal={inputModal} />
     }
   */
  return (
    <div>
      Unsupported input method: <b>{type}</b>
    </div>
  )
}
