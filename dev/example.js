import React from 'react'
import ReactDOM from 'react-dom'
import { Socket } from 'phoenix'

import WebClient from '../src/index'
import './example.scss'

const user_id = 'u2'
const bot_id = '5340a013-434a-4568-8799-05173e8f7383'

const socket = new Socket('ws://localhost:4000/socket')
socket.connect()

function App() {
  return (
    <div className="app">
      <div className="botsquad-components layout-docked">
        <WebClient
          bot_id={bot_id}
          params={{ user_id }}
          hideAvatars
          socket={socket}
          settings={{ alwaysFocus: true, chat_config: { disabled_inputs: [] } }}
        />
      </div>
    </div>
  )
}

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(<App />, document.getElementById('root'))
})
