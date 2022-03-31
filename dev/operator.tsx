import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { Socket, Channel } from 'phoenix'

import WebClient from '../src/index'
import './example.scss'
import { API } from '@botsquad/sdk'
import OperatorChatInput from './OperatorChatInput'

const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY
const token =
  'SFMyNTY.g2gDbQAAACQwNjhiNmI0MS1jYzNhLTRlM2EtODUyMy0xZTg4MDk1ZTMzMmZuBgD3oOMgfwFiAAFRgA.3oxf7K8cPE65eTylLnuNhktg5cDLNJFDx_TvuMEnQhI'

const conversationId = '33d58cd3-919b-40ff-b72b-fa45ff6286c1'

const socket = new Socket('ws://localhost:4001/socket', { params: { token } })
socket.connect()

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
          operatorChatInputComponent={OperatorChatInput}
        />
      </div>
    </div>
  )
}

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(<App />, document.getElementById('root'))
})
