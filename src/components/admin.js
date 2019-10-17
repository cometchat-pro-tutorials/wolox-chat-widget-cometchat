import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { CometChat } from '@cometchat-pro/chat';
import '../admin.css';

import axios from 'axios';

function Admin() {
  const { uid } = useParams();
  const [isOpen, setIsOpen] = useState(false);

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
        setMessages(prevMessages => [...prevMessages, msg]);
      },
      error => {
        console.log('Message sending failed with error:', error);
      }
    );
  };

  return (
    <div
      className='row w-100 mx-auto'
      style={{ height: '100vh', overflow: 'hidden', position: 'relative' }}
    >
      <div
        className='col-12 col-md-4 sidebar bg-white'
        style={{
          marginLeft: isOpen && '0',
          transition: 'margin 0.3s ease-in-out'
        }}
      >
        <div className='py-2'>
          <button
            className='mr-2 btn btn-light btn-menu'
            onClick={() => setIsOpen(false)}
          >
            &larr; Close
          </button>
          <span className='lead'>Clients</span>
        </div>
        <ul className='list-group'>
          {clients.length > 0 ? (
            clients.map(c => (
              <li className='list-group-item' key={c.uid}>
                <Link
                  className={`lead ${
                    c.status === 'offline' ? 'text-dark' : 'text-success'
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
        </ul>
      </div>
      <div
        className='p-2 col-12 col-md-8 d-flex flex-column justify-content-between bg-white'
        style={{ position: 'relative' }}
      >
        <header
          className=''
          style={{
            height: '60px',
            width: '100%'
          }}
        >
          <button
            className='mr-2 btn btn-light btn-menu'
            onClick={() => setIsOpen(true)}
          >
            Menu
          </button>

          <p className='lead d-inline-block'>
            {currentUser && currentUser.name}
          </p>
        </header>
        <main
          className='mb-1 pb-2 d-flex flex-column justify-content-start'
          style={{
            flex: 1,
            height: '50vh'
          }}
        >
          <ul
            className='list-group'
            style={{
              position: 'relative',
              overflowY: 'scroll',
              flex: 1
            }}
          >
            {messages.length > 0 &&
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
                      background: m.sender.uid === uid ? '#F4F7F9' : '#A3EAF7',
                      borderRadius: '4px'
                    }}
                  >
                    {m.text}
                  </span>
                </li>
              ))}
          </ul>
        </main>
        <footer
          style={{
            height: '60px',
            marginBottom: '1rem',
            bottom: 0
          }}
        >
          <form
            className='w-100 d-flex justify-content-between align-items-center'
            onSubmit={e => handleSendMessage(e)}
          >
            <div className='form-group w-100'>
              <input
                type='text'
                className='form-control form-control-lg mt-3'
                placeholder='Type to send message'
                value={message}
                onChange={e => setMessage(e.target.value)}
              />
            </div>
            <button className='btn btn-dark btn-lg' type='submit'>
              Send
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
}

export default Admin;
