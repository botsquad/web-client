import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { Socket, Channel } from 'phoenix'

import WebClient from '../src/index'
import './example.scss'
import { API } from '@botsquad/sdk'
import OperatorChatInput from './OperatorChatInput'

const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY
const token =
  'SFMyNTY.g2gDbQAAACQ1MGU4MTkxNS02Nzg4LTQ3YjAtYjNiOS1kYzAwYmNmYWRiZWNuBgChJmqNfwFiAAFRgA.lZHR_tCdFfbTruevCEngixslg5f0QtWUW9LQsyluXSc'

const conversationId = '8434ff30-461b-49e9-83ee-14520ffaf05d'
console.log('conversationId', conversationId)

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
        />
        {channel ? <OperatorChatInput channel={channel} conversationMeta={meta} /> : null}
      </div>
    </div>
  )
}

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(<App />, document.getElementById('root'))
})
