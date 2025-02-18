import React, { useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';
import axios from 'axios';

const socket = socketIOClient('http://localhost:5000');

const Chat = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on('receive_message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, []);

  const sendMessage = async () => {
    const senderId = 'user-id'; // Replace with actual user ID from localStorage or context
    const receiverId = 'receiver-id'; // Replace with actual receiver ID
    socket.emit('send_message', message);

    await axios.post('http://localhost:5000/api/messages/send', {
      senderId,
      receiverId,
      content: message,
    });
    
    setMessage('');
  };

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;
