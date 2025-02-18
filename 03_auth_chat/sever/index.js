const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT || 3000

const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');


const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());

app.get("/", (req, res)=>{
  res.send("Hello from server")
})

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// Socket.io connection for real-time messaging
// io.on('connection', (socket) => {
//   console.log('User connected');

//   socket.on('send_message', (message) => {
//     io.emit('receive_message', message);  // Broadcast message to all users
//   });

//   socket.on('disconnect', () => {
//     console.log('User disconnected');
//   });
// });

const startServer = async () => {
  try {
    await connectDB();  
    // Now, start the server
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.log('Error connecting to MongoDB', err);
    process.exit(1);  // Exit the process if DB connection fails
  }
};

startServer();

