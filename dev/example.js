import React from 'react';
import ReactDOM from 'react-dom';

import WebClient from '../src/index';

const user_id = 'u' + Math.random()
const bot_id = "1adc3f20-32e9-4376-a147-d9ef23ac8a4c"

import './example.scss'

function App() {
  return (
    <div className="app">
      <div className="botsquad-components layout-docked">
        <WebClient
          bot_id={bot_id}
          params={{ user_id }}
          hideAvatars
        />
      </div>
    </div>
  );
}


document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(<App />, document.getElementById("root"))
})
