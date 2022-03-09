import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { Socket, Channel } from 'phoenix'

import WebClient from '../src/index'
import './example.scss'
import { API } from '@botsquad/sdk'

const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY
const token =
  'SFMyNTY.g2gDbQAAACRjNjk3NTJmZC01NmMxLTQyNDgtYmRiYi1iODMyYzkxZmU2ZmRuBgBDBBBLfwFiAAFRgA.ytj5Dd4UEjOybHCyCJZQ3920C4oduFFTZ7ILIZmE9mg'

const conversationId = 'f1507d8f-f1ad-43dc-9f6e-faf589738cbd'

const socket = new Socket('ws://localhost:4001/socket', { params: { token } })
socket.connect()

function App() {
  return (
    <div className="app">
      <div className="botsquad-components layout-docked">
        <WebClient
          socket={socket}
          mapsApiKey={mapsApiKey}
          hideAvatars
          settings={{ alwaysFocus: true, chat_config: { disabled_inputs: [] } }}
          operatorConversationId={conversationId}
        />
      </div>
    </div>
  )
}

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(<App />, document.getElementById('root'))
})
