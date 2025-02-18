// src/components/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const navigation = useNavigate();

  const handleRegister = async () => {
    try {
      // Send request to backend to generate and send OTP to email
      await axios.post('http://localhost:5000/api/auth/register', { email });
      setIsOtpSent(true);  // Set OTP sent state to true after success
      alert('OTP has been sent to your email!');
    } catch (error) {
      console.error('Error sending OTP:', error);
      alert('Failed to send OTP.');
    }
  };

  const handleVerifyOTP = async () => {
    try {
      // Verify OTP on backend
      const response = await axios.post('http://localhost:5000/api/auth/verify-otp', { email, otp });
      localStorage.setItem('token', response.data.token);
      alert('OTP verified, you are now logged in!');
      navigation.navigate('/chat');
    } catch (error) {
      console.error('Error verifying OTP:', error);
      alert('Invalid OTP. Please try again.');
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <div>
        {!isOtpSent ? (
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
            <button onClick={handleRegister}>Send OTP</button>
          </div>
        ) : (
          <div>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
            />
            <button onClick={handleVerifyOTP}>Verify OTP</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
