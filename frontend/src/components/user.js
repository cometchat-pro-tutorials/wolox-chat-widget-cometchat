import React, { useEffect, useState } from 'react'
import { CometChat } from '@cometchat-pro/chat'
import { Widget, addResponseMessage, dropMessages } from 'react-chat-widget'
import 'react-chat-widget/lib/styles.css'
import { Link } from 'react-router-dom'
import config from '../config'

function User() {
  const [UID, setUID] = useState(null)
  useEffect(() => {
    const createUser = async () => {
      try {
        const userResponse = await fetch(
          'http://localhost:4000/api/create-user'
        )
        const json = await userResponse.json()
        const user = await json.user

        await CometChat.login(user.authToken)
        setUID(user.uid)
      } catch (err) {
        console.log({ err })
      }
    }

    createUser()

    return () => {
      CometChat.removeMessageListener('client-listener-key')
      CometChat.logout()
      dropMessages()
    }
  }, [])

  useEffect(() => {
    const listenerId = 'client-listener-key'
    CometChat.addMessageListener(
      listenerId,
      new CometChat.MessageListener({
        onTextMessageReceived: message => {
          addResponseMessage(message.text)
        }
      })
    )

    return () => CometChat.removeMessageListener(listenerId)
  }, [])

  const handleNewUserMessage = async newMessage => {
    const textMessage = new CometChat.TextMessage(
      config.adminUID,
      newMessage,
      CometChat.MESSAGE_TYPE.TEXT,
      CometChat.RECEIVER_TYPE.USER
    )

    try {
      const message = await CometChat.sendMessage(textMessage)
      console.log('Message sent successfully', message)
    } catch (error) {
      console.log('Message sending failed with error:', error)
    }
  }

  return (
    <div style={{ background: '#000', height: '100vh' }}>
      <header>
        <div className='container py-2'>
          <div>
            <h1 className='text-center text-white'>ACME.</h1>
          </div>

          <ul
            className='nav nav-tabs'
            style={{ background: '#000', border: 'none' }}
          >
            <li className='nav-item'>
              <Link
                style={{ color: '#fff', borderBottom: '3px solid #fff' }}
                className='nav-link'
                to='/#'
              >
                Home
              </Link>
            </li>
            <li className='nav-item'>
              <Link style={{ color: '#ccc' }} className='nav-link' to='/#'>
                Features
              </Link>
            </li>
            <li className='nav-item'>
              <Link style={{ color: '#ccc' }} className='nav-link' to='/#'>
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </header>
      <div
        className='jumbotron text-white'
        style={{
          backgroundColor: '#000'
        }}
      >
        <div className='container text-center'>
          <h1 className='display-4'>ACME.</h1>
          <p className='lead'>
            ACME is a San Francisco based design agency. We build amazing web
            experiences
          </p>
          <Link className='btn btn-light btn-lg' to='/' role='button'>
            Learn more
          </Link>
        </div>
      </div>
      <Widget
        handleNewUserMessage={handleNewUserMessage}
        title={`Live Chat. User ID - ${UID}`}
        subtitle='Hi, if you have any questions, please ask them here. Please note that if you refresh the page, all messages will be lost.'
      />
    </div>
  )
}

export default User
