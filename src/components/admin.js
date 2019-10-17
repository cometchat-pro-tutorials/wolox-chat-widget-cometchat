import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { CometChat } from '@cometchat-pro/chat';

import axios from 'axios';

function Admin() {
  const { uid } = useParams();

  const [clients, setClients] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  const adminUID = 'admin';

  useEffect(() => {
    const createAuthToken = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/api/auth-user?uid=${adminUID}`
        );
        const admin = await response.data.user;

        CometChat.login(admin.authToken).then(
          loggedInAdmin => {
            fetchClients();
          },
          error => {
            console.log('Error logging in', error);
          }
        );
      } catch (err) {
        console.log({ err });
      }
    };

    const fetchClients = async () => {
      const response = await axios.get('http://localhost:4000/api/get-clients');

      const _clients = await response.data.clients;
      setClients([..._clients]);
      const currentClient = _clients.find(c => c.uid === uid);
      setCurrentUser(currentClient);
    };

    createAuthToken();
  }, [uid]);

  useEffect(() => {
    if (uid) {
      const messagesRequest = new CometChat.MessagesRequestBuilder()
        .setUID(uid)
        .setLimit(50)
        .build();
      messagesRequest.fetchPrevious().then(
        msgs => {
          setMessages([...msgs]);
        },
        error => {
          console.log('Message fetching failed with error:', error);
        }
      );
    }
  }, [uid]);

  useEffect(() => {
    const listenerId = 'admin-listener-id';
    const listenForNewMessages = () => {
      CometChat.addMessageListener(
        listenerId,
        new CometChat.MessageListener({
          onTextMessageReceived: msg => {
            setMessages(prevMessages => [...prevMessages, msg]);
          }
        })
      );
    };

    listenForNewMessages();

    return () => CometChat.removeMessageListener(listenerId);
  }, []);

  const handleSendMessage = e => {
    e.preventDefault();
    const _message = message;
    setMessage('');
    const textMessage = new CometChat.TextMessage(
      uid,
      _message,
      CometChat.MESSAGE_TYPE.TEXT,
      CometChat.RECEIVER_TYPE.USER
    );

    CometChat.sendMessage(textMessage).then(
      msg => {
        setMessages([...messages, msg]);
      },
      error => {
        console.log('Message sending failed with error:', error);
      }
    );
  };

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
            style={{ width: '30%', height: '100%' }}
          >
            {clients.length > 0 ? (
              clients.map(c => (
                <li
                  style={{
                    background: 'transparent',
                    border: 0,
                    borderBottom: '1px solid #ccc'
                  }}
                  className='list-group-item'
                  key={c.uid}
                >
                  <Link
                    className={`lead ${
                      c.status === 'offline' ? 'text-link' : 'text-success'
                    }`}
                    to={`/admin/${c.uid}`}
                  >
                    {c.name}
                  </Link>
                </li>
              ))
            ) : (
              <span>Fetching clients</span>
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
              {uid !== undefined && clients.length > 0 ? (
                <ul
                  className='list-group px-3'
                  style={{ height: '100%', overflowY: 'scroll' }}
                >
                  {messages.length > 0 ? (
                    messages.map(m => (
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
                    ))
                  ) : (
                    <p className='lead'>Loading Messages</p>
                  )}
                </ul>
              ) : (
                <div>
                  <h3 className='text-dark'>Chats</h3>
                  <p className='lead'>Select a chat to load the messages</p>
                </div>
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
  );
}

export default Admin;
