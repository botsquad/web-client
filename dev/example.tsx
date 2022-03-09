import React, { useState } from 'react'
import ReactDOM from 'react-dom'

import WebClient from '../src/index'
import './example.scss'

const user_id = 'YCP'
const bot_id = '5b9e0beb-3c3d-4567-a0f4-63fa02fd588b'
const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY

function App() {
  return (
    <div className="app">
      <div className="botsquad-components layout-docked">
        <WebClient
          bot_id={bot_id}
          params={{ user_id }}
          mapsApiKey={mapsApiKey}
          hideAvatars
          settings={{ alwaysFocus: true, chat_config: { disabled_inputs: [] } }}
        />
      </div>
    </div>
  )
}

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(<App />, document.getElementById('root'))
})
