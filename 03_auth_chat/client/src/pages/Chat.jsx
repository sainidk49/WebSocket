import React, { useState, useEffect, useRef, useCallback } from 'react';
import socketIOClient from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../context/AuthProvider';
import { useLocation } from 'react-router-dom';

const Chat = () => {
  const location = useLocation();
  const { baseUrl } = useAuth();
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  const [message, setMessage] = useState('');
  const [typing, setTyping] = useState('');
  const [messages, setMessages] = useState([]);

  const senderId = localStorage.getItem("senderId");
  const receiverId = location.state?.receiverId;
  const receiverName = location.state?.receiverName;

  useEffect(() => {
    if (!senderId || !receiverId) return;

    socketRef.current = socketIOClient(baseUrl);

    socketRef.current.emit('userLogin', senderId);

    socketRef.current.on('receiveMessage', ({
      senderId: sender,
      receiverId: receiver,
      message
    }) => {
      if ((sender === receiverId && receiver === senderId) ||
        (sender === senderId && receiver === receiverId)) {
        markUnseenCount()
        setMessages(prev => [...prev,
        { content: message, createdAt: new Date().toISOString(), isOwnMessage: sender === senderId }
        ]);
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    });

    socketRef.current.on('typing', ({
      senderId: sender,
      receiverId: receiver,
      typing
    }) => {
      if ((sender === receiverId && receiver === senderId) ||
        (sender === senderId && receiver === receiverId)) {
        setTyping(typing);
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [baseUrl, senderId, receiverId]);


  const markUnseenCount = useCallback(async () => {
    try {
      await axios.get(`${baseUrl}/api/chat/seen/${senderId}/${receiverId}`);

    } catch (error) {
      console.error('Error fetching unseen count:', error);
    }
  }, [senderId, receiverId]);


  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(`${baseUrl}/api/chat/messages/${senderId}/${receiverId}`);
        setMessages(data.messages.map(msg => ({
          content: msg.content,
          createdAt: msg.createdAt,
          isOwnMessage: msg.senderId === senderId,
        })));
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    if (senderId && receiverId) fetchMessages();
  }, [baseUrl, senderId, receiverId]);


  const sendMessage = useCallback(async () => {
    if (!message.trim()) return;

    try {
      await axios.post(`${baseUrl}/api/chat/send`, { senderId, receiverId, content: message });

      socketRef.current.emit('sendMessage', { senderId, receiverId, message });

      setMessages(prev => [...prev, { content: message, createdAt: new Date().toISOString(), isOwnMessage: true }]);
    } catch (error) {
      console.error("Error sending message:", error);
    }

    setMessage('');
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [message, senderId, receiverId]);

  
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      sendMessage()
    }
  };

  const handleTyping = useCallback(() => {
    setMessage(messageInputRef.current.value);
    socketRef.current.emit("typing", {
      senderId,
      receiverId,
      typing: `${localStorage.getItem("userName")} is typing...`
    });
  }, [senderId, receiverId]);


  const removeTyping = useCallback(() => {
    socketRef.current.emit("typing", {
      senderId,
      receiverId,
      typing: ''
    });
  }, [senderId, receiverId]);

  const formatTime = (dateString) => new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="blur-layer relative w-full h-full text-white px-5 pt-5">
      <div className="relative w-full h-full">
        {/* Header */}
        <div className="chat-list-item w-full flex gap-x-2 pb-2 mb-5">
          <div className="user-img w-5 rounded-full overflow-hidden">
            <img src="/assets/images/user-icon.jpg" alt="User" />
          </div>
          <p className="text-sm capitalize">{receiverName}</p>
        </div>

        {/* Messages */}
        <div className="w-full gap-x-4 mb-5 chat-messages-bx">
          {messages.map((msg, index) => (
            <div key={index} className={`w-10/12 mb-5 ${msg.isOwnMessage ? "ml-auto" : "mr-auto"}`}>
              <div className={`w-full text-left text-sm py-1.5 px-3 mb-1 rounded-lg ${msg.isOwnMessage ? 'bg-blue-900 rounded-tr-none' : 'bg-slate-700 rounded-tl-none'}`}>
                {msg.content}
              </div>
              <div className={`w-full ${msg.isOwnMessage ? "text-right pr-1.5" : "text-left pl-1.5"}`}>
                <p className="text-xs">{formatTime(msg.createdAt)}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing Indicator */}
        <div className="absolute bottom-15 text-center text-xs w-full">{typing}</div>

        {/* Input Box */}
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
            onKeyDown={handleKeyDown}
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
