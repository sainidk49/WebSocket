const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Import the socket logic from the socket module
const { onConnected } = require('./sockets/socket');

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Set up socket connection event handler
io.on('connection', (socket) => {
    onConnected(socket, io);  
});

// Start server
server.listen(PORT, () => {
    console.log("Server running at :: ", `http://localhost:${PORT}`);
});
