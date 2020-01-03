import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CometChat } from '@cometchat-pro/chat'
import config from '../config'
import uuid from 'uuid'

function Admin({
  match: {
    params: { uid }
  }
}) {
  const [users, setUsers] = useState([])
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const createAuthToken = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/authenticate-user?uid=${config.adminUID}`
        )
        const json = await response.json()
        const admin = await json.user
        await CometChat.login(admin.authToken)
        setIsLoggedIn(true)
      } catch (err) {
        console.log({ err })
      }
    }
    createAuthToken()
  }, [])

  useEffect(() => {
    const listenerId = 'message-listener-id'
    const listenForNewMessages = () => {
      CometChat.addMessageListener(
        listenerId,
        new CometChat.MessageListener({
          onTextMessageReceived: msg => {
            setMessages(prevMessages => [...prevMessages, msg])
          }
        })
      )
    }
    listenForNewMessages()
    return () => {
      CometChat.removeMessageListener(listenerId)
      CometChat.logout()
    }
  }, [])

  useEffect(() => {
    const getUsers = async () => {
      const response = await fetch('http://localhost:4000/api/get-users')
      const json = await response.json()
      const users = await json.users
      setUsers([...users])
    }
    getUsers()
  }, [isLoggedIn])

  useEffect(() => {
    const listenerID = 'user-listener-id'
    CometChat.addUserListener(
      listenerID,
      new CometChat.UserListener({
        onUserOnline: onlineUser => {
          const otherUsers = users.filter(u => u.uid !== onlineUser.uid)
          setUsers([onlineUser, ...otherUsers])
        },
        onUserOffline: offlineUser => {
          const targetUser = users.find(u => u.uid === offlineUser.uid)
          if (targetUser && targetUser.uid === offlineUser.uid) {
            const otherUsers = users.filter(u => u.uid !== offlineUser.uid)
            setUsers([...otherUsers, offlineUser])
            const messagesToKeep = messages.filter(
              m =>
                m.receiver !== uid &&
                m.sender.uid !== config.adminUID &&
                m.receiver !== config.adminUID &&
                m.sender.uid !== uid
            )
            setMessages(messagesToKeep)
          }
        }
      })
    )
    return () => CometChat.removeUserListener(listenerID)
  }, [users, messages, uid])

  useEffect(() => {
    const fetchPreviousMessages = async () => {
      console.log(uid)
      try {
        const messagesRequest = new CometChat.MessagesRequestBuilder()
          .setLimit(50)
          .setUID(uid)
          .build()
        const previousMessages = await messagesRequest.fetchPrevious()
        setMessages([...previousMessages])
      } catch (err) {
        console.log('Message fetching failed with error:', err)
      }
    }
    if (uid !== undefined) fetchPreviousMessages()
  }, [uid])

  const handleSendMessage = async e => {
    e.preventDefault()

    const _message = message
    setMessage('')
    const textMessage = new CometChat.TextMessage(
      uid,
      _message,
      CometChat.RECEIVER_TYPE.USER
    )
    try {
      const msg = await CometChat.sendMessage(textMessage)
      setMessages([...messages, msg])
    } catch (error) {
      console.log('Message sending failed with error:', error)
    }
  }

  return (
    <div style={{ height: '100vh' }}>
      <header
        className='bg-secondary text-white d-flex align-items-center'
        style={{ height: '50px' }}
      >
        <h3 className='px-3'>
          <Link to='/admin' className='text-white'>
            Dashboard
          </Link>
        </h3>
        {uid !== undefined && (
          <span>
            {' - '}
            {uid}
          </span>
        )}
      </header>
      <div style={{ height: 'calc(100vh - 50px)' }}>
        <div className='d-flex' style={{ height: '100%' }}>
          <aside
            className='bg-light p-3'
            style={{ width: '30%', height: '100%', overflowY: 'scroll' }}
          >
            <h2 className='pl-4'>Users</h2>
            {users.length > 0 ? (
              users.map(user => (
                <li
                  style={{
                    background: 'transparent',
                    border: 0,
                    borderBottom: '1px solid #ccc'
                  }}
                  className='list-group-item'
                  key={user.uid}
                >
                  <Link className='lead' to={`/admin/${user.uid}`}>
                    {user.name}
                  </Link>
                </li>
              ))
            ) : (
              <span className='text-center pl-4 mt-4'>Fetching users</span>
            )}
          </aside>
          <main
            className='p-3 d-flex flex-column'
            style={{
              flex: '1',
              height: 'calc(100vh - 60px)',
              position: 'relative'
            }}
          >
            <div className='chat-box' style={{ flex: '1', height: '70vh' }}>
              {uid === undefined && !messages.length && (
                <div>
                  <h3 className='text-dark'>Chats</h3>
                  <p className='lead'>Select a chat to load the messages</p>
                </div>
              )}
              {messages.length > 0 ? (
                <ul
                  className='list-group px-3'
                  style={{ height: '100%', overflowY: 'scroll' }}
                >
                  {messages.map(m => (
                    <li
                      className='list-group-item mb-2 px-0'
                      key={uuid()}
                      style={{
                        border: 0,
                        background: 'transparent',
                        textAlign: m.sender.uid === uid ? 'left' : 'right'
                      }}
                    >
                      <span
                        className='py-2 px-3'
                        style={{
                          background:
                            m.sender.uid === uid ? '#F4F7F9' : '#A3EAF7',
                          borderRadius: '4px'
                        }}
                      >
                        {m.text}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='lead'>No messages</p>
              )}
            </div>
            {uid !== undefined && (
              <div
                className='chat-form'
                style={{
                  height: '50px'
                }}
              >
                <form
                  className='w-100 d-flex justify-content-between align-items-center'
                  onSubmit={e => handleSendMessage(e)}
                >
                  <div className='form-group w-100'>
                    <input
                      type='text'
                      className='form-control mt-3'
                      placeholder='Type to send message'
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                    />
                  </div>
                  <button className='btn btn-secondary' type='submit'>
                    Send
                  </button>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
export default Admin
