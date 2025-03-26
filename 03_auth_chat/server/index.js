const express = require('express');
const http = require('http');
const path = require('path')
const cors = require('cors');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT || 3000;

const User = require('./models/userModel');

const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const usersRoutes = require('./routes/usersRoute');


const app = express();
const server = http.createServer(app);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const io = socketIo(server, {
  cors: {
    origin: 'http://192.168.0.107:5173',  
    methods: ['GET', 'POST'],
  }
});

app.use(cors({
  origin: 'http://192.168.0.107:5173',  // Change this to match your frontend URL
  methods: ['GET', 'POST'],
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from server");
});

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/', usersRoutes);

//// Socket.io connection for real-time messaging
// io.on('connection', (socket) => {
//   onConnected(socket, io);
// });

//// start the server ///////
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.log('Error connecting to MongoDB', err);
    process.exit(1);
  }
};

startServer();


////////////////// socket .io connection for real-time messaging ////////
io.on('connection', (socket) => {
  let userId;

  socket.on('userLogin', async (id) => {
    try {
      userId = id;
      const user = await User.findById(userId);
      if (user) {
        user.socketId = socket.id;
        user.isOnline = true;
        await user.save();
        console.log(`User ${userId} logged in with socket ID: ${socket.id}`);
      }
    } catch (error) {
      console.error('Error logging in user:', error);
    }
  });

  socket.on('userRegister', async (id) => {
    try {
      userId = id;
      const user = await User.findById(userId);
      if (user) {
        user.socketId = socket.id;
        user.isOnline = true;
        await user.save();
        console.log(`User ${userId} registered with socket ID: ${socket.id}`);
      }
    } catch (error) {
      console.error('Error registering user:', error);
    }
  });

  socket.on('sendMessage', async ({ senderId, receiverId, message }) => {
    try {
      const recipient = await User.findById(receiverId);
      if (recipient && recipient.socketId) {
        socket.to(recipient.socketId).emit('receiveMessage', {
          senderId,
          receiverId,
          message
        });
        console.log(`Message sent to user ${receiverId}: ${message}, and socket id: ${recipient.socketId}`);
      } else {
        console.log(`User ${receiverId} not found or not connected`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  socket.on('typing', async ({ senderId, receiverId, typing }) => {
    try {
      const recipient = await User.findById(receiverId);
      if (recipient && recipient.socketId) {
        socket.to(recipient.socketId).emit('typing', {
          senderId,
          receiverId,
          typing
        });
      } else {
        console.log(`User ${receiverId} not found or not connected`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  })

  // socket.on("chatLsit", async (senderId) => {
  //   console.log("senderId")
  //   const userId = senderId;

  //   // Find chats where the user is either sender or receiver
  //   const chats = await Chat.find({
  //     $or: [{ senderId: userId }, { receiverId: userId }]
  //   })
  //     .populate('senderId', 'name profilePic')
  //     .populate('receiverId', 'name profilePic')
  //     .sort({ updatedAt: -1 });

  //   // Format chat list
  //   const chatList = [];
  //   const uniqueUsers = new Set();

  //   chats.forEach(chat => {
  //     const otherUser = chat.senderId._id.toString() === userId ? chat.receiverId : chat.senderId;

  //     if (!uniqueUsers.has(otherUser._id.toString())) {
  //       uniqueUsers.add(otherUser._id.toString());
  //       chatList.push({
  //         userId: otherUser._id,
  //         userName: otherUser.name,
  //         profilePic: otherUser.profilePic || '/assets/images/default-user.jpg',
  //         lastMessage: chat.content,
  //         timestamp: chat.updatedAt,
  //       });
  //     }
  //   });
  //   socket.emit("chatLsit", chatList)
  // })

  socket.on('disconnect', async () => {
    try {
      if (userId) {
        const user = await User.findById(userId);
        if (user) {
          user.socketId = null;
          user.isOnline = false;
          await user.save();
          console.log(`User ${userId} disconnected`);
        }
      }
    } catch (error) {
      console.error('Error on disconnect:', error);
    }
  });
});

