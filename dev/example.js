import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { Socket } from 'phoenix'

import WebClient from '../src/index'
import './example.scss'

const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY
const token =
  'SFMyNTY.g2gDbQAAACQwNjhiNmI0MS1jYzNhLTRlM2EtODUyMy0xZTg4MDk1ZTMzMmZuBgD3oOMgfwFiAAFRgA.3oxf7K8cPE65eTylLnuNhktg5cDLNJFDx_TvuMEnQhI'
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
          operatorConversationId="33d58cd3-919b-40ff-b72b-fa45ff6286c1"
        />
      </div>
    </div>
  )
}

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(<App />, document.getElementById('root'))
})
