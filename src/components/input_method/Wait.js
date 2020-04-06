import React, { useState, useEffect } from 'react'
import InputMethodContainer from './InputMethodContainer'
import { buttonClick } from '../elements/Template'
import { Closed } from '../icons'
import { fixedLabel } from '../../common/labels'
import { processText } from '../elements/util'

function renderImplicitCloseButton(props) {
  if (props.type !== 'closed') {
    return null
  }
  const { closeConversation } = props.handler.component.props
  if (!closeConversation) {
    return null
  }

  return <button onClick={closeConversation} >{fixedLabel('new_conversation', props.localePrefs)}</button>
}

function renderButton(button, props) {
  if (!button) return null

  const onClick = payload =>
    props.inputModal.finish('message', { type: 'wait', text: button.title, data: { event: payload } }, props.config)

  return <button onClick={() => buttonClick(button, props.handler, onClick)} >{button.title}</button>
}

function pad(n, char = '0') {
  return (n < 10 ? char : '') + Math.floor(n)
}

function formatTime(waitTime, total) {
  const delta = total - waitTime
  return (
    <span className="time">
      {pad(delta / 60, '')}:{pad(delta % 60)}
    </span>
  )
}

function Wait(props) {
  const { type } = props
  const { description, wait_time, button } = props.config
  const [waitTime, setWaitTime] = useState(0)

  const tick = () => {
    if (!wait_time || waitTime < 0) return

    const delta = Math.floor(((new Date()).getTime() - props.time) / 1000)

    if (delta > wait_time) {
      setWaitTime(-1)
      props.inputModal.finish('message', { type: 'wait', text: 'Timeout', data: { timeout: true } }, props.config)
    } else {
      setWaitTime(delta)
    }
  }

  useEffect(() => {
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <InputMethodContainer
      {...props}
      className="wait" inline={type === 'closed'}
      below={renderButton(button, props) || renderImplicitCloseButton(props)}
    >
      {type === 'wait' && (typeof wait_time !== 'undefined') && <div className="loader" />}

      {props.type === 'closed'
      ? <span className="closed">{Closed}</span>
      : null}

      {description
      ? <div className="description" dangerouslySetInnerHTML={processText(description)} />
      : null}

      {wait_time && waitTime >= 0 ? formatTime(waitTime, wait_time) : null}
    </InputMethodContainer>
  )
}

export default Wait
