import React from 'react'
import ReactDOM from 'react-dom'
import { Socket } from 'phoenix'

import WebClient from '../src/index'
import './example.scss'
import OperatorChatInput from './OperatorChatInput'

const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY
const token =
  'SFMyNTY.g2gDbQAAACQwNjhiNmI0MS1jYzNhLTRlM2EtODUyMy0xZTg4MDk1ZTMzMmZuBgCrJ5S8gAFiAAFRgA.MCk57gysgFEvhvVSoZ4tmHia6qxEYKFOcOBkMooGft4'

const conversationId = 'bb35bcf2-77a0-410d-8991-e85b87f35518'

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
          operatorChatInputComponent={OperatorChatInput}
        />
      </div>
    </div>
  )
}

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(<App />, document.getElementById('root'))
})
