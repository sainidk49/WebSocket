import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import socketIOClient from 'socket.io-client';
import axios from 'axios';

const Home = () => {
  const navigate = useNavigate();
  const { baseUrl } = useAuth();
  const [chatList, setChatList] = useState([]);
  const [unseenCounts, setUnseenCounts] = useState({});
  const socketRef = useRef(null);
  const senderId = localStorage.getItem('senderId');

  ////////// register socket and get chat list /////////
  useEffect(() => {
    socketRef.current = socketIOClient(baseUrl);

    console.log("Socket connected");

    socketRef.current.emit('userLogin', senderId);

    socketRef.current.on('receiveMessage', async ({ message }) => {
      await fetchChatList()
    });

    return () => {
      // socketRef.current.off('chatList');
      socketRef.current.off('receiveMessage');
      socketRef.current.disconnect();
      console.log("Socket disconnected");
    }
  }, [senderId, baseUrl]);

  ////////// fetch intial chat list ////////
  useEffect(() => {
    fetchChatList()
  }, [])

  ////////// fetch  chat list ////////
  const fetchChatList = useCallback(async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/chat/list/${senderId}`);
      setChatList(res.data.chats);
    } catch (error) {
      console.error('Error fetching chat list:', error);
    }
  }, [senderId]);

  ////////// fetch unseen counts ////////
  const fetchUnseenCount = useCallback(async (receiverId) => {
    try {
      const res = await axios.get(`${baseUrl}/api/chat/unseen/${senderId}/${receiverId}`);
      return res.data.unseenMessages;
    } catch (error) {
      console.error('Error fetching unseen count:', error);
    }

  }, [senderId]);

  ///////////// call fetch unseen count when chat list is updated /////////
  useEffect(() => {
    // Preload unseen counts for all users
    const preloadUnseenCounts = async () => {
      const updatedUnseenCounts = {};
      for (const chat of chatList) {
        const count = await fetchUnseenCount(chat.userId);
        updatedUnseenCounts[chat.userId] = count;
      }
      setUnseenCounts(updatedUnseenCounts);
    };
    if (chatList.length > 0) {
      preloadUnseenCounts();
    }
  }, [chatList]);

  ////////// mark unseen counts ////////
  const markUnseenCount = useCallback(async (userId, userName) => {
    try {
      const receiverId = userId;

      const res = await axios.get(`${baseUrl}/api/chat/seen/${senderId}/${receiverId}`);
      const updatedUnseenCounts = { ...unseenCounts, [receiverId]: res.data.unseenMessages };
      setUnseenCounts(updatedUnseenCounts);

      navigate('/chat', { state: { receiverId: userId, receiverName: userName } });
    } catch (error) {
      console.error('Error fetching unseen count:', error);
    }
  }, [senderId]);


  return (
    <div className="blur-layer relative w-full h-full bg-cover bg-center text-white px-5">
      {chatList.length === 0 ? (
        <p className="text-gray-400">No recent chats.</p>
      ) : (
        <div className="chat-list w-full py-5">
          {chatList.map((chat) => (
            <div
              key={chat.userId}
              onClick={() => markUnseenCount(chat.userId, chat.userName)}
              className="chat-list-item w-full flex gap-x-4 pb-3 mb-5">
              <div className="user-img w-7 h-7 rounded-full overflow-hidden">
                <img src="/assets/images/user-icon.jpg" alt="" />
              </div>
              <div className="w-fit">
                <p className='text-sm capitalize mb-0 text-left'>
                  {chat.userName}
                </p>
                <p className='text-gray-400 truncate text-left' style={{ fontSize: "0.6rem" }}>{chat.lastMessage}</p>
              </div>

              <div className="w-fit ml-auto">
                <p style={{ fontSize: "0.6rem" }} className="text-gray-400 text-sm mb-1">
                  {new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                {unseenCounts[chat.userId] > 0 ?
                  <div className="user-img ml-auto w-4 h-4 rounded-full overflow-hidden bg-white text-green-500 flex items-center justify-center">
                    <p style={{ fontSize: "0.6rem" }}>{unseenCounts[chat.userId]}</p>
                  </div> : ''
                }

              </div>
            </div>
          ))}
        </div>
      )}
      <div className="add-user absolute right-2.5 bottom-2.5">
        <button onClick={() => navigate('/users')} className="bg-linear-to-r from-blue-500 to-cyan-500 text-white text-sm py-2 px-5 rounded-xl">Add User</button>
      </div>
    </div>
  );
};

export default Home;
