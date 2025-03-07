import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import socketIOClient from 'socket.io-client';
import MessagePopup from '../components/popups/Message';

const Login = () => {
  const { baseUrl, setGetMessageAudio, setSendMessageAudio, setUser } = useAuth();
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const sendBtnRef = useRef()
  const verifyBtnRef = useRef()
  const navigate = useNavigate();
  const [isError, setIsError] = useState('')

  //////////// handle send OTP //////////
  const handleSendOtp = async () => {
    try {
      sendBtnRef.current.disabled = true
      const res = await fetch(baseUrl + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
      })
        .then(res => res.json());

      console.log(res)

      if (res.status) {
        setIsOtpSent(true);
      } else {
        setIsError(res.message)
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
    }
    finally {
      sendBtnRef.current.disabled = false
    }
  };


  //////////// on enter send OTP //////////
  const handleKeyDownEmail = (event) => {
    if (event.key === 'Enter') {
      handleSendOtp()
    }
  };


  //////////// handle login //////////
  const handleLogin = async () => {
    const socket = socketIOClient(baseUrl);
    try {
      verifyBtnRef.current.disabled = true
      const res = await fetch(baseUrl + '/api/auth/verify-otp', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, otp: otp })
      }).then(res => res.json());

      if (res.status) {
        localStorage.setItem("token", res.token)
        localStorage.setItem('senderId', res.userId);
        localStorage.setItem('userName', res.userName);
        setUser({ name: res.userName, email: res.email, profile: res.profile })
        const receive = new Audio('/assets/audio/receive.mp3')
        receive.volume = 0
        setGetMessageAudio(receive)

        const send = new Audio('/assets/audio/send.mp3')
        send.volume = 0
        setSendMessageAudio(send)

        socket.emit('userLogin', res.userId);
        navigate('/');

      }
      else {
        setIsError(res.message)
      }

    } catch (error) {
      alert(error);
    }
    finally {
      verifyBtnRef.current.disabled = false
    }
  };

  //////////// on enter login //////////
  const handleKeyDownOtp = (event) => {
    if (event.key === 'Enter') {
      handleLogin()
    }
  };

  if (isError) {
    return <MessagePopup message={isError} setIsError={setIsError} />
  }

  return (
    <div className="blur-layer relative w-full h-full text-white px-5">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10/12 max-w-md bg-black opacity-80 p-6 rounded-lg shadow-lg">
        {!isOtpSent ? (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDownEmail}
              placeholder="Enter email"
              className="w-full p-3 mb-5 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSendOtp}
              ref={sendBtnRef}
              className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
            >
              Send OTP
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              onKeyDown={handleKeyDownOtp}
              placeholder="Enter OTP"
              className="w-full p-3 mb-4 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleLogin}
              ref={verifyBtnRef}
              className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
            >
              Login
            </button>
          </>
        )}
        <div className="mt-4 flex justify-center text-center">
          <p className="text-sm text-gray-500">
            Don't have an account? <Link className="!text-blue-500 !hover:text-blue-600" to="/register"> Register </Link>
          </p>
        </div>
      </div>
    </div>

  );
};

export default Login;
