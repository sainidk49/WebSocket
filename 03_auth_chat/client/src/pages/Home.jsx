import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import socketIOClient from 'socket.io-client';
import axios from 'axios';

const Home = () => {
  const navigate = useNavigate();
  const { baseUrl, getMessageAudio } = useAuth();
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
      try {
        if (getMessageAudio) {
          getMessageAudio.volume = 1
          getMessageAudio.play().catch((error) => console.error('Error playing audio:', error));
        }

        await fetchChatList();
      } catch (error) {
        console.error('Error playing audio:', error);
      }
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
  const markUnseenCount = useCallback(async (userId, userName, profilePicture, description) => {
    try {
      const receiverId = userId;

      const res = await axios.get(`${baseUrl}/api/chat/seen/${senderId}/${receiverId}`);
      const updatedUnseenCounts = { ...unseenCounts, [receiverId]: res.data.unseenMessages };
      setUnseenCounts(updatedUnseenCounts);

      navigate('/chat', { state: { receiverId: userId, receiverName: userName, profilePicture, description } });
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
              onClick={() => markUnseenCount(chat.userId, chat.userName, chat.profile, chat.description)}
              className="chat-list-item w-full flex gap-x-4 pb-3 mb-5">
              <div className="user-img w-10 h-10 rounded-full overflow-hidden">
                <img src={chat.profile || '/assets/images/user-icon.jpg'} alt="" />
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

      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 w-8/12 p-2 px-4 bg-white rounded-full flex justify-around">
        <div className="" onClick={() => navigate('/profile')} >
          <div className="update-profile bg-blue-900 w-7 h-7 p-1.5 rounded-full">
            <img src="/assets/images/user-profile.png" alt="user-profile" />
          </div>
          <p style={{ fontSize: '0.65rem' }} className='text-blue-900 text-sm mt-0.5'>Profile</p>
        </div>

        <div className="" onClick={() => navigate('/users')} >
          <div className="make-group bg-blue-900 w-7 h-7 p-1.5 rounded-full">
            <img src="/assets/images/make-group.png" alt="make-group" />
          </div>
          <p style={{ fontSize: '0.65rem' }} className='text-blue-900 text-sm mt-0.5'>chats</p>
        </div>

        <div className="text-center" onClick={() => navigate('/users')} >
          <div className="add-user bg-blue-900 w-7 h-7 p-1.5 rounded-full">
            <img src="/assets/images/add-user.png" alt="add-user" />
          </div>
          <p style={{ fontSize: '0.65rem' }} className='text-blue-900 text-sm mt-0.5'>Add</p>
        </div>

      </div>

    </div>
  );
};

export default Home;
