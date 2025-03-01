const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT || 3000;

const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const usersRoutes = require('./routes/usersRoute');
const { onConnected } = require('./sockets/socket');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://192.168.1.116:5173',  // Frontend URL
    methods: ['GET', 'POST'],
  }
});

app.use(cors({
  origin: 'http://192.168.1.116:5173',
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
let users = [];

const addUser = (userId, socketId) => {
  if (!users.some(user => user.userId === userId)) {
    users.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  users = users.filter(user => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find(user => user.userId === userId);
};

io.on('connection', (socket) => {
  socket.on('addUser', (userId) => {
    addUser(userId, socket.id);
    console.log('Connected users:', users);
  });

  socket.on('sendMessage', ({ senderId, receiverId, content }) => {
    const receiver = getUser(receiverId); 
    // console.log("receiver", receiverId);
    
    if (receiver) {
      // console.log("Receiver socket ID:", receiver.socketId);
      socket.to(receiver.socketId).emit('getMessage', { senderId, content });
    } else {
      console.log("Receiver not found");
    }
  });
  
  socket.on('typing', ({ receiverId, typing }) => {
    // console.log(receiverId, typing);
    const receiver = getUser(receiverId);
    if(receiver) {
      socket.to(receiver.socketId).emit('typing', typing);
    }
  })

  socket.on("disconnect", () => {
    removeUser(socket.id);
    console.log('User disconnected:', socket.id);
  });
})
