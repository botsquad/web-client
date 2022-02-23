import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { Socket, Channel } from 'phoenix'

import WebClient from '../src/index'
import './example.scss'
import { API } from '@botsquad/sdk'

const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY
const token =
  'SFMyNTY.g2gDbQAAACQ2ZTY5MGExNi1mNDVkLTRiZDgtOWRhNi1mYmQ4YjRmY2Y0MjluBgA46C0mfwFiAAFRgA.1VkgspjgIdP_tnI9J9HlOvDANvyXLwpHTbFFhayZXHk'

const conversationId = '51bc7063-a6c3-4abf-ac46-66d6d7cdfc2f'

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
      </div>
      {meta && channel ? <ChatInput channel={channel} meta={meta} /> : null}
    </div>
  )
}

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(<App />, document.getElementById('root'))
})
