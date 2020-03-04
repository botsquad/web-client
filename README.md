# BotSquad Web Client React component

[![Build Status](https://travis-ci.org/botsquad/web-client.svg?branch=master)](https://travis-ci.org/botsquad/web-client)
[![npm (scoped)](https://img.shields.io/npm/v/@botsquad/web-client)](https://www.npmjs.com/package/@botsquad/web-client)

The BotSquad Web Client components embeds Botsquad chatbots inside a
React component for the web.


## Demo

 * http://web-client-demo.apps.botsqd.com/


## Installation

    npm install @botsquad/web-client


## Example code

```javascript

import React, { useEffect } from 'react';
import { Socket } from 'phoenix'
import WebClient from '@botsquad/web-client';

let socket = new Socket('wss://bsqd.me/socket')

// A user ID, based on a cookie or some external property
const user_id = 'u' + Math.random()

// your Botsquad bot
const bot_id = "1adc3f20-32e9-4376-a147-d9ef23ac8a4c"

function App() {
  useEffect(() => {
    socket.connect()
  }, [])

  return (
    <div className="botsquad-components layout-docked">
      <WebClient
        bot_id={bot_id}
        params={{ user_id }}
        socket={socket}
        hideAvatars
      />
    </div>
  )
}

export default App
```
