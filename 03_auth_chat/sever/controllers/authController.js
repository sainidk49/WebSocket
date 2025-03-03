const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Send OTP to email
const sendOTP = async (email) => {
  // const otp = crypto.randomBytes(3).toString('hex');
  const otp = Math.floor(100000 + Math.random() * 900000);;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'OTP for Registration',
    text: `Your OTP is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return otp; // Save OTP to User model
  } catch (error) {
    console.log('Error sending OTP: ', error);
    throw new Error('Error sending OTP');
  }
};


const validateUserData = (data, requiredFields) => {
  for (let field of requiredFields) {
    if (!data[field]) {
      return { status: false, message: `${field} is required` };
    }
    else if (field === 'email' && !(/\S+@\S+\.\S+/.test(data[field]))) {
      return { status: false, message: `${field} address is invalid` };
    }
    else if (field === 'mobile' && !(/^\d{10}$/.test(data[field]))) {
      return { status: false, message: `${field} number must be exactly 10 digits` };
    }
  }
  return { status: true };
};


// Register a new user
const registerUser = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ status: false, message: 'User data not provided!' });
    }

    const validation = validateUserData(req.body, ['name', 'email']);
    if (!validation.status) {
      return res.status(400).json(validation);
    }

    const { name, email } = req.body;

    // const otp = await sendOTP(email);
    const otp = 3698;

    const newUser = new User({ name, email, otp });
    await newUser.save();
    res.status(200).json({ status: true, message: 'OTP sent to email' });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};


// Register a new user
const loginUser = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ status: false, message: 'User data not provided!' });
    }

    const validation = validateUserData(req.body, ['email']);
    if (!validation.status) {
      return res.status(400).json(validation);
    }

    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    if(user.isOnline){
      return res.status(400).json({ status: false, message: 'Already logged in in another device'})
    }

    // const otp = await sendOTP(email);
    const otp = 3698;
    await User.findByIdAndUpdate(user._id, { ...req.body, otp }, { new: true });

    res.status(200).json({ status: true, message: 'OTP sent to email' });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};


// Verify OTP and login
const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (user && user.otp === otp) {
    user.isVerified = true;
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.status(200).json({ status: true, message: 'OTP verified', token, userId: user._id, userName: user.name });
  } else {
    res.status(400).json({ status: false, message: 'Invalid OTP' });
  }
};


module.exports = { registerUser, verifyOTP, loginUser };
