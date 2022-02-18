# BotSquad Web Client React component

[![CI check/test/build](https://github.com/botsquad/web-client/actions/workflows/webpack.yml/badge.svg)](https://github.com/botsquad/web-client/actions/workflows/webpack.yml)
[![npm (scoped)](https://img.shields.io/npm/v/@botsquad/web-client)](https://www.npmjs.com/package/@botsquad/web-client)

The BotSquad Web Client components embeds Botsquad chatbots inside a
React component for the web.

## Demo

A Botsquad chatbot has a lot of UI controls, like input widgets and chat bubble types. To try them all out, visit the
[Web Client demonstration page](https://web-client-demo.bsqd.me/).

## Installation

    npm install @botsquad/web-client

## Development

1. Install dependencies with `npm install`
1. Create a .devenv in the root folder and add the contents of template.devenv and replace the variables with the keys you have.
1. Run in development with `npm run dev`

## Example code

```javascript
import React from 'react'
import WebClient from '@botsquad/web-client'

// A user ID, based on a cookie or some external property
const user_id = 'u' + Math.random()

// your Botsquad bot
const bot_id = '1adc3f20-32e9-4376-a147-d9ef23ac8a4c'

function App() {
  return (
    <div className="botsquad-components layout-docked">
      <WebClient bot_id={bot_id} params={{ user_id }} />
    </div>
  )
}

export default App
```
