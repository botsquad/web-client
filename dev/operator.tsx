import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { Socket, Channel } from 'phoenix'

import WebClient from '../src/index'
import './example.scss'
import { API } from '@botsquad/sdk'

const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY
const token =
  'SFMyNTY.g2gDbQAAACQwNjhiNmI0MS1jYzNhLTRlM2EtODUyMy0xZTg4MDk1ZTMzMmZuBgD3oOMgfwFiAAFRgA.3oxf7K8cPE65eTylLnuNhktg5cDLNJFDx_TvuMEnQhI'

const conversationId = '33d58cd3-919b-40ff-b72b-fa45ff6286c1'

const socket = new Socket('ws://localhost:4001/socket', { params: { token } })
socket.connect()

function ChatInput(props: { channel: Channel; meta: API.Conversation }) {
  const join = () => {
    props.channel.push('operator_join', {})
  }
  const leave = (e: React.MouseEvent) => {
    e.preventDefault()
    props.channel.push('operator_leave', {})
  }

  if (!props.meta.operator_present) {
    return <button onClick={join}>Join</button>
  }
  return (
    <form
      style={{ display: 'flex' }}
      onSubmit={e => {
        e.preventDefault()
        const input = (e.target as any).text as HTMLInputElement
        const action = { type: 'text', payload: { message: input.value } }
        props.channel.push('operator_action', { action })
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

function App() {
  const [channel, setChannel] = useState<Channel | null>(null)
  const [meta, setMeta] = useState<API.Conversation | null>(null)
  return (
    <div className="app">
      <div className="botsquad-components layout-docked">
        <WebClient
          socket={socket}
          mapsApiKey={mapsApiKey}
          hideAvatars
          settings={{ alwaysFocus: true, chat_config: { disabled_inputs: [] } }}
          operatorConversationId={conversationId}
          onChannel={setChannel}
          onConversationMeta={setMeta}
        />
      </div>
      {channel ? <ChatInput channel={channel} meta={meta} /> : null}
    </div>
  )
}

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(<App />, document.getElementById('root'))
})
