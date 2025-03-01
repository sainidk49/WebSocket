import React, { useState, useEffect, useRef } from 'react';
import socketIOClient from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../context/AuthProvider';
import { useLocation } from 'react-router-dom';

const Chat = () => {
  const location = useLocation();
  const { baseUrl } = useAuth();
  const socket = socketIOClient(baseUrl);
  const [message, setMessage] = useState('');
  const [typing, setTyping] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to socket server with socket ID:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    socket.on('getMessage', (message) => {
      console.log('Received message:', message);
      setMessages((prevMessages) => [
        ...prevMessages,
        { content: message.content, createdAt: new Date().toISOString(), isOwnMessage: false }
      ]);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    const senderId = localStorage.getItem('senderId');
    if (senderId) {
      socket.emit('addUser', senderId);
    }

    socket.on('typing', (typeingMessage) => {
      setTyping(typeingMessage)
    })

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('getMessage');
      socket.off('typing');
    };
  }, []);

  // Handle sending messages
  const sendMessage = async () => {
    const senderId = localStorage.getItem("senderId");
    const receiverId = location.state.receiverId;

    if (!senderId || !receiverId) {
      console.log("Sender ID or Receiver ID is missing");
      return;
    }

    // Emit message to the server
    socket.emit('sendMessage', {
      senderId,
      receiverId,
      content: message,
    });

    // Add message to the UI
    setMessages((prevMessages) => [
      ...prevMessages,
      { content: message, createdAt: new Date().toISOString(), isOwnMessage: true },
    ]);

    await axios.post(`${baseUrl}/api/chat/send`, {
      senderId,
      receiverId,
      content: message,
    });

    setMessage('');
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const getMessages = async () => {
      const receiverId = location.state.receiverId;
      const senderId = localStorage.getItem("senderId");

      try {
        const res = await axios.get(`${baseUrl}/api/chat/messages/${receiverId}/${senderId}`);
        const messagesFromDb = res.data.messages;

        const formattedMessages = messagesFromDb.map((message) => ({
          content: message.content,
          createdAt: message.createdAt,
          isOwnMessage: message.senderId === senderId,
        }));

        setMessages(formattedMessages);
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    getMessages();
  }, [baseUrl]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleTyping = (e) => {
    setMessage(messageInputRef.current.value)
    console.log(localStorage.getItem("userName"))
    socket.emit("typing", {
      receiverId: location.state.receiverId,
      typing: `${localStorage.getItem("userName")} typing...`
    })
  }

  const removeTyping = (e) => {
    socket.emit("typing", {
      receiverId: location.state.receiverId,
      typing: ``
    })
  }


  return (
    <div className="blur-layer relative w-full h-full text-white px-5 pt-5">
      <div className="relative w-full h-full">
        <div className="chat-list-item w-full flex gap-x-2 pb-2 mb-5">
          <div className="user-img w-5 rounded-full overflow-hidden">
            <img src="/assets/images/user-icon.jpg" alt="User" />
          </div>
          <p className="text-sm capitalize">{location.state.receiverName}</p>
        </div>

        <div className="w-full gap-x-4 mb-5 chat-messages-bx" >
          {messages.map((msg, index) => (
            <div key={index} className={`w-10/12 mb-5 ${msg.isOwnMessage ? "ml-auto" : "mr-auto"}`} >
              <div
                className={`w-full text-left text-sm py-1.5 px-3 mb-1 rounded-lg ${msg.isOwnMessage ? 'bg-blue-900 rounded-tr-none' : 'bg-slate-700 rounded-tl-none'}`}
              >
                {msg.content}
              </div>
              <div className={`w-full  ${msg.isOwnMessage ? "text-right pr-1.5" : "text-left pl-1.5"}`}>
                <p className="text-xs">{formatTime(msg.createdAt)}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="absolute bottom-15 text-center text-xs w-full">{typing}</div>

        <div className="absolute w-full bottom-2.5 left-0 bg-white rounded-3xl flex gap-x-2 p-1">
          <div className="w-8 rounded-full overflow-hidden bg-blue-900 p-2 flex items-center">
            <img src="/assets/images/camera-icon.png" alt="camera-icon" />
          </div>
          <input
            type="text"
            value={message}
            onChange={handleTyping}
            onFocus={handleTyping}
            onBlur={removeTyping}
            ref={messageInputRef}
            placeholder="Type a message"
            className="w-full text-black focus-visible: outline-0"
          />
          <button className="w-8 rounded-full overflow-hidden bg-blue-900 p-2 ml-auto" onClick={sendMessage}>
            <img src="/assets/images/send-icon.png" alt="send-icon" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default Chat;
