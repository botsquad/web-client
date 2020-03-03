# BotSquad Web Client React component

The BotSquad Web Client components embeds Botsquad chatbots inside a
React component for the web.  website.

## Example code

```javascript

import React, { useEffect } from 'react';
import { Socket } from 'phoenix'
import WebClient from '@botsquad/web-client';

let socket = new Socket('wss://bsqd.me/socket')
const user_id = 'u' + Math.random()

function App() {
  useEffect(() => {
    socket.connect()
  }, [])

  return (
    <div className="botsquad-components layout-docked">
      <WebClient
        bot_id="1adc3f20-32e9-4376-a147-d9ef23ac8a4c"
        params={{ user_id }}
        socket={socket}
        hideAvatars
      />
    </div>
  )
}

export default App
```
