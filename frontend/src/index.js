import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { CometChat } from '@cometchat-pro/chat'
import config from './config'

CometChat.init(config.appID).then(
  () => {
    console.log('Initialized cometchat')
  },
  () => {
    console.log('Failed to initialize cometchat')
  }
)
ReactDOM.render(<App />, document.getElementById('root'))
