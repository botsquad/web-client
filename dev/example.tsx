import { createRoot } from 'react-dom/client'

import WebClient from '../src/index'
import './example.scss'

const user_id = 'YCP'
const bot_id = '9f62cd1d-8ec7-4a71-8d36-95b2acd251ab'
const mapsApiKey = import.meta.env.GOOGLE_MAPS_API_KEY

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
  const root = createRoot(document.getElementById('root')!)
  root.render(<App />)
})
