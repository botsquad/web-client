import React from 'react'
import Message, { Payload } from '../elements/types'
import { ChatHandler } from '../../components'
import { BxMessageRounded, BxErrorCircle } from '../icons'
import './Annotation.scss'

type Type =
  | 'authentication'
  | 'create_note'
  | 'error'
  | 'escalation'
  | 'intent-match'
  | 'mail'
  | 'note'
  | 'notification'
  | 'redirect'
  | 'sms_notify'
  | 'call_transcript'

function annotationIcon(type: Type) {
  if (type === 'error') {
    return BxErrorCircle
  }
  return BxMessageRounded
}

interface AttributesProp {
  className: string
  message: Message<Payload>
  handler: ChatHandler
  onLoad: (() => void) | null
  toggleModalPreferHeight: ((condition: boolean) => void) | null
  modalParams?: { index?: number }
  settings: Record<string, any>
  localePrefs: string[]
}

interface Props {
  attributes: AttributesProp
  payload: Payload
}

const Annotation = ({ attributes, payload }) => {
  const p = typeof payload.payload === 'string' ? JSON.parse(payload.payload) : {}

  if (payload.type === 'error') {
    return (
      <div className="annotation">
        <span className="message error" title={p.cause}>
          <div>{annotationIcon(payload)} </div>
          {' ' + payload.message}
        </span>
      </div>
    )
  }

  //   if (payload.type === 'create_note') {
  //     const { notes } = this.props
  //     const note = notes.find(n => n.id === p.note_id)
  //     if (!note) return null

  //     // onClick={() => this.setState({ showError: p.error_id })}
  //     return (
  //       <div className="meta annotation note">
  //         <Note key={note.id} note={note} onClick={() => this.setState({ selectedNote: note })} />
  //       </div>
  //     )
  //   }

  //   if (payload.type === 'redirect') {
  //         //   onClick={() => store.dispatch(gotoConversation(p.conversation_id))}

  //     return (
  //       <div className={'meta annotation clickable'}>
  //         <span className={'message ' + (p.success === false ? 'error' : 'success')} title={payload.title || ''}>
  //           <Icon icon={annotationIcon(payload.type, p)} />
  //           {' ' + payload.message}
  //         </span>
  //       </div>
  //     )
  //   }

  //   if (payload.type === 'call_transcript') {
  //     const showCallTranscript = (
  //       typeof payload.payload === 'string' ? JSON.parse(payload.payload) : payload.payload
  //     ) as CallTranscriptPayload

  //     return (
  //       <div
  //         className={'meta annotation clickable')}
  //         onClick={() => this.setState({ showCallTranscript })}
  //       >
  //         <span className={'message ' + (p.success === false ? 'error' : 'success')} title={payload.title || ''}>
  //           <Icon icon={annotationIcon(payload.type, p)} />
  //           {' ' + payload.message}
  //         </span>
  //         {this.state.showCallTranscript && (
  //           <CallTranscriptDialog
  //             payload={this.state.showCallTranscript}
  //             onClose={() => this.setState({ showCallTranscript: null })}
  //           />
  //         )}
  //       </div>
  //     )
  //   }

  //   const clickable = !!(p.meta && p.meta.file) && check(this, 'bot', 'build')
  const title = p.actor ? `by ${p.actor.first_name} ${p.actor.last_name}` : p.description

  return (
    <div className={`meta annotation ${payload.type}`}>
      <span className={'message ' + (p.success === false ? 'error' : 'success')} title={title || ''}>
        <div>{annotationIcon(payload)} </div>
        {' ' + payload.message}
      </span>
    </div>
  )
}

export default Annotation
