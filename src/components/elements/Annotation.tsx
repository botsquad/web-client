import React from 'react'
import { BxEmail, BxErrorCircle } from '../icons'
import { AnnotationPayloadType } from './types'

function annotationIcon(type: AnnotationPayloadType) {
  if (type === 'error') {
    return BxErrorCircle
  }
  return BxEmail
}

interface Props {
  payload: { payload: any; type: AnnotationPayloadType; message: string }
}

// This annotation component does not use create_note, redirect and transcript!

const Annotation: React.FC<Props> = ({ payload }) => {
  const p = payload.payload

  if (payload.type === 'intent-match') {
    return null
  }

  if (payload.type === 'error') {
    return (
      <div className="annotation error">
        <span className="message" title={p.cause}>
          <div>{annotationIcon(payload.type)} </div>
          {' ' + payload.message}
        </span>
      </div>
    )
  }
  const title = p.actor ? `by ${p.actor.first_name} ${p.actor.last_name}` : p.description

  return (
    <div className={`meta annotation ${payload.type}`}>
      <span className={'message ' + (p.success === false ? 'error' : 'success')} title={title || ''}>
        <div>{annotationIcon(payload.type)} </div>
        {' ' + payload.message}
      </span>
    </div>
  )
}

export default Annotation
