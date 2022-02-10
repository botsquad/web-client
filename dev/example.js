import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { Socket } from 'phoenix'

import WebClient from '../src/index'
import './example.scss'

const user_id = 'YCP'
const bot_id = '4b63a542-2c27-480e-8797-b6ecb0eee4db'
const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY
const socket = new Socket('wss://staging.bsqd.me/socket')
socket.connect()

function App() {
  const [hide_input, setHideinput] = useState(false)

  return (
    <div className="app">
      <div className="botsquad-components layout-docked">
        <WebClient
          bot_id={bot_id}
          params={{ user_id }}
          mapsApiKey={mapsApiKey}
          socket={socket}
          onHideInput={setHideinput}
          hideAvatars
          settings={{ alwaysFocus: true, chat_config: { disabled_inputs: [] }, hide_input }}
        />
      </div>
    </div>
  )
}

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(<App />, document.getElementById('root'))
})
