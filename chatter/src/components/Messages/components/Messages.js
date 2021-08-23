import React, { useContext, useState, useCallback, useEffect } from 'react';
import io from 'socket.io-client';
import useSound from 'use-sound';
import config from '../../../config';
import LatestMessagesContext from '../../../contexts/LatestMessages/LatestMessages';
import TypingMessage from './TypingMessage';
import Header from './Header';
import Footer from './Footer';
import Message from './Message';
import initialBottyMessage from '../../../common/constants/initialBottyMessage';
import '../styles/_messages.scss';

const socket = io(
  config.BOT_SERVER_ENDPOINT,
  { transports: ['websocket', 'polling', 'flashsocket'] }
);

function Messages() {
  const [playSend] = useSound(config.SEND_AUDIO_URL);
  const [playReceive] = useSound(config.RECEIVE_AUDIO_URL);
  const { setLatestMessage } = useContext(LatestMessagesContext);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    setMessages([createMessage(initialBottyMessage, "bot", false)]);

    socket.on('bot-message', (msg) => {
      setMessages(oldArray => [...oldArray, createMessage(msg, "bot", false)]);
      setLatestMessage('bot', msg);
      setTyping(false);
    });

    socket.on('bot-typing', () => {
      setTyping(true);
    })
  }, []);

  const onChangeMessage = (e) => {
    setMessage(e.target.value);
  }

  const sendMessage = () => {
    setMessages(oldArray => [...oldArray, createMessage(message, "me", false)]);

    setLatestMessage('bot', message);
    socket.emit('user-message', message);
    setMessage('');
  }

  const createMessage = (message, user, botTyping) => {
    return {
      message: {
        id: message,
        message: message,
        user: user
      },
      botTyping: botTyping
    }
  }

  const renderMessages = messages.map(function(d, index) {
      return (<Message nextMessage="true" message={d.message} botTyping={d.botTyping}></Message>)
  })

  return (
    <div className="messages">
      <Header />
      <div className="messages__list" id="message-list">
        {renderMessages}
        {typing && <TypingMessage/>}
      </div>
      <Footer message={message} sendMessage={sendMessage} onChangeMessage={onChangeMessage} />
    </div>
  );
}

export default Messages;
