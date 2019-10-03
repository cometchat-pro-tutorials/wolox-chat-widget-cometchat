import React, { useEffect } from 'react'
import { CometChat } from '@cometchat-pro/chat'
import axios from 'axios'
import {
  Widget,
  addResponseMessage,
  addUserMessage,
  dropMessages
} from 'react-chat-widget'
import 'react-chat-widget/lib/styles.css'

function Client() {
  const clientUID = localStorage.getItem('cometchat:client-uid')

  useEffect(() => {
    addResponseMessage('Welcome to this awesome chat!')

    const createClient = async () => {
      try {
        const response = await axios.get(
          'http://localhost:4000/api/create-client'
        )
        const client = await response.data.client

        CometChat.login(client.authToken).then(
          loggedInClient => {
            localStorage.setItem('cometchat:client-uid', client.uid)

            fetchPreviousMessages()
            listenForNewMessages()
          },
          error => {
            console.log('Error logging in', error)
          }
        )
      } catch (err) {
        console.log({ err })
      }
    }

    const createAuthToken = async uid => {
      try {
        const response = await axios.get(
          `http://localhost:4000/api/auth-user?uid=${uid}`
        )
        const client = await response.data.user

        CometChat.login(client.authToken).then(
          loggedInClient => {
            fetchPreviousMessages()
            listenForNewMessages()
          },
          error => {
            console.log('Error logging in', error)
          }
        )
      } catch (err) {
        console.log({ err })
      }
    }

    if (clientUID === null) {
      createClient()
    } else {
      createAuthToken(clientUID)
    }

    return () => {
      CometChat.removeMessageListener('client-listener-key')
      CometChat.logout()
      dropMessages()
    }
  }, [clientUID])

  const fetchPreviousMessages = () => {
    const messagesRequest = new CometChat.MessagesRequestBuilder()
      .setUID('admin')
      .setLimit(50)
      .build()
    messagesRequest.fetchPrevious().then(
      messages => {
        messages.forEach(message => {
          if (message.sender.name === 'Admin') {
            addResponseMessage(message.text)
          } else {
            addUserMessage(message.text)
          }
        })
      },
      error => {
        console.log('Message fetching failed with error:', error)
      }
    )
  }

  const listenForNewMessages = () => {
    CometChat.addMessageListener(
      'client-listener-key',
      new CometChat.MessageListener({
        onTextMessageReceived: message => {
          addResponseMessage(message.text)
        }
      })
    )
  }

  const handleNewUserMessage = newMessage => {
    const textMessage = new CometChat.TextMessage(
      'admin',
      newMessage,
      CometChat.MESSAGE_TYPE.TEXT,
      CometChat.RECEIVER_TYPE.USER
    )

    CometChat.sendMessage(textMessage).then(
      message => {
        // console.log('Message sent successfully:', message)
      },
      error => {
        console.log('Message sending failed with error:', error)
      }
    )
  }

  return (
    <div
      className='d-flex justify-content-center align-items-center'
      style={{ height: '100vh' }}
    >
      <h1>Hello World!</h1>
      <Widget
        handleNewUserMessage={handleNewUserMessage}
        title='Live Chat'
        subtitle='Speak with an online representative'
      />
    </div>
  )
}

export default Client
