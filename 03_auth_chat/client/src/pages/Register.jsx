// src/components/Register.js
import React, { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import socketIOClient from 'socket.io-client';
import MessagePopup from '../components/popups/Message';

const Register = () => {
  const { baseUrl, setGetMessageAudio, setSendMessageAudio } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const sendBtnRef = useRef()
  const verifyBtnRef = useRef()
  const navigate = useNavigate();
  const [isError, setIsError] = useState('')

  ////////// fill name emal //////////
  const handleRegister = async () => {
    try {
      sendBtnRef.current.disabled = true;
      const res = await fetch(baseUrl + '/api/auth/register',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name }),
        })
        .then(res => res.json());

      if (res.status === true) {
        setIsOtpSent(true);
        setIsError(res.message)
      }
      else {
        setIsError(res.message)
      }

    } catch (error) {
      console.error('Error sending OTP:', error);
      alert('Failed to send OTP.');
    }
    finally {
      sendBtnRef.current.disabled = false;
    }
  };

  //////// hit enter submit name emal /////////
  const handleKeyDownRegister = (event) => {
    if (event.key === 'Enter') {
      handleRegister()
    }
  };

  /////////////// submi otp ////////////////
  const handleVerifyOTP = async () => {
    const socket = socketIOClient(baseUrl);
    try {
      verifyBtnRef.current.disabled = true
      const res = await fetch(baseUrl + '/api/auth/verify-otp',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp }),
        })
        .then(res => res.json());

      if (res.status === true) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('senderId', res.userId);
        localStorage.setItem('userName', res.userName);

        const receive = new Audio('/assets/audio/receive.mp3')
        receive.volume = 0
        setGetMessageAudio(receive)

        const send = new Audio('/assets/audio/send.mp3')
        send.volume = 0
        setSendMessageAudio(send)

        socket.emit('userRegister', res.userId);
        navigate('/');
      }
      else {
        setIsError(res.message)
      }
    }
    catch (error) {
      console.error('Error verifying OTP:', error);
      setIsError(res.message)
    }
    finally {
      verifyBtnRef.current.disabled = false
    }
  };

  //////// hit enter submi otp /////////
  const handleKeyDownOtp = (event) => {
    if (event.key === 'Enter') {
      handleVerifyOTP()
    }
  };


  if (isError) {
    return <MessagePopup message={isError} setIsError={setIsError} />
  }


  return (
    <div className="blur-layer relative w-full h-full text-white px-5">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10/12 max-w-md bg-black opacity-80 p-6 rounded-lg shadow-lg">
        {!isOtpSent ? (
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDownRegister}
              placeholder="Enter your name"
              className="w-full p-3 mb-4 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDownRegister}
              placeholder="Enter your email"
              className="w-full p-3 mb-4 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={handleRegister}
              ref={sendBtnRef}
              className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none">
              Send OTP
            </button>
          </div>
        ) : (
          <div>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              onKeyDown={handleKeyDownOtp}
              placeholder="Enter OTP"
              className="w-full p-3 mb-4 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleVerifyOTP}
              ref={verifyBtnRef}
              className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none">
              Verify OTP
            </button>
          </div>
        )}
        <div className="mt-4 flex justify-center text-center">
          <p className="text-sm text-gray-500">
            Have an account? <Link className="!text-blue-500 !hover:text-blue-600" to="/login"> Login </Link>
          </p>
        </div>
      </div>

    </div>
  );
};

export default Register;
