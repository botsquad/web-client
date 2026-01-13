import React from 'react'
import ReactDOM from 'react-dom'

import WebClient from '../src/index'
import './example.scss'

let user_id = localStorage.getItem('user_id')
if (!user_id) {
  user_id = Math.random().toString(36).substring(2, 9)
  localStorage.setItem('user_id', user_id)
}
const bot_id = '9f62cd1d-8ec7-4a71-8d36-95b2acd251ab'
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
