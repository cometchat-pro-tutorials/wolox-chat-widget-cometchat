import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { CometChat } from '@cometchat-pro/chat'
import config from '../config'

function Admin() {
  const { uid } = useParams()

  const [users, setUsers] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
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

        const loggedInAdmin = await CometChat.login(admin.authToken)
        if (loggedInAdmin) {
          setIsLoggedIn(true)
        } else {
          createAuthToken()
        }
      } catch (err) {
        console.log({ err })
      }
    }

    createAuthToken()
  }, [])

  useEffect(() => {
    const getUsers = async () => {
      const response = await fetch('http://localhost:4000/api/get-users')
      const json = await response.json()
      const users = await json.users
      setUsers([...users])
    }

    if (isLoggedIn) {
      getUsers()
    }
  }, [isLoggedIn])

  useEffect(() => {
    const _currentUser = users.find(user => user.uid === uid)
    setCurrentUser(_currentUser)
  }, [uid, users])

  useEffect(() => {
    const listenerId = 'message-listener-id'
    const listenForNewMessages = () => {
      CometChat.addMessageListener(
        listenerId,
        new CometChat.MessageListener({
          onTextMessageReceived: msg => {
            setMessages([...messages, msg])
          }
        })
      )
    }

    listenForNewMessages()
    return () => CometChat.removeMessageListener(listenerId)
  }, [messages, users])

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
          }
        }
      })
    )

    return () => CometChat.removeUserListener(listenerID)
  }, [users])

  const handleSendMessage = async e => {
    e.preventDefault()

    const _message = message
    setMessage('')

    const textMessage = new CometChat.TextMessage(
      currentUser.uid,
      _message,
      CometChat.MESSAGE_TYPE.TEXT,
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
      <header className='bg-secondary text-white' style={{ height: '50px' }}>
        <div className='container'>
          <h3 className='px-3'>
            Dashboard | {currentUser && currentUser.name}
          </h3>
        </div>
      </header>
      <div className='container' style={{ height: 'calc(100vh - 50px)' }}>
        <div className='d-flex' style={{ height: '100%' }}>
          <aside
            className='bg-light p-3'
            style={{ width: '30%', height: '100%', overflowY: 'scroll' }}
          >
            <h2>Users</h2>
            {users.length > 0 ? (
              users.map(u => (
                <li
                  style={{
                    background: 'transparent',
                    border: 0,
                    borderBottom: '1px solid #ccc'
                  }}
                  className='list-group-item'
                  key={u.uid}
                >
                  <Link
                    className={`lead ${
                      u.status === 'offline' ? 'text-link' : 'text-success'
                    }`}
                    to={`/admin/${u.uid}`}
                  >
                    {String(u.name)
                      .split('-')[0]
                      .concat('...')}
                  </Link>
                </li>
              ))
            ) : (
              <span className='text-center'>Fetching users</span>
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
              {uid === undefined && messages.length === 0 && (
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
                  {messages
                    .filter(
                      m =>
                        (m.receiver === uid &&
                          m.sender.uid === config.adminUID) ||
                        (m.receiver === config.adminUID && m.sender.uid === uid)
                    )
                    .map(m => (
                      <li
                        className='list-group-item mb-2 px-0'
                        key={m.id}
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
          </main>
        </div>
      </div>
    </div>
  )
}

export default Admin
