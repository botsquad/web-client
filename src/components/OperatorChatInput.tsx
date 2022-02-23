import React from 'react'
import { useChatProps } from './ChatContext'

const OperatorChatInput = () => {
  const { channel, conversationMeta } = useChatProps()
  const join = () => {
    channel?.push('operator_join', {})
  }
  const leave = (e: React.MouseEvent) => {
    e.preventDefault()
    channel?.push('operator_leave', {})
  }

  if (!conversationMeta.operator_present) {
    console.log('Operator Not Present')
    return <button onClick={join}>Join</button>
  }
  return (
    <form
      style={{ display: 'flex' }}
      onSubmit={e => {
        e.preventDefault()
        const input = (e.target as any).text as HTMLInputElement
        const action = { type: 'text', payload: { message: input.value } }
        channel?.push('operator_action', { action })
        input.value = ''
      }}
    >
      <input
        autoFocus
        name="text"
        type="text"
        defaultValue=""
        placeholder="Type operator message.."
        style={{ fontSize: 20, padding: '4px 8px' }}
      />
      <button>send</button>
      <button onClick={leave}>Leave</button>
    </form>
  )
}

export default OperatorChatInput
