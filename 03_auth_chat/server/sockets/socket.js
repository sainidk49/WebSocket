

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

function onConnected(socket, io) {
    socket.on('addUser', (userId) => {
        addUser(userId, socket.id);
        console.log('Connected users:', users);
    });

    socket.on('sendMessage', ({ senderId, receiverId, content }) => {
        const receiver = getUser(receiverId);
        console.log("receiver", receiverId);
        if (receiver) {
            console.log(receiver.socketId)
            io.to(receiver.socketId).emit('getMessage', { senderId, content });
        }
    });

    socket.on("disconnect", () => {
        removeUser(socket.id);
        // console.log('User disconnected:', socket.id);
    });
}

module.exports = { onConnected }

// io.on('connection', (socket) => {
//   console.log('User connected');

//   socket.on('send_message', (message) => {
//     io.emit('receive_message', message);  // Broadcast message to all users
//   });

//   socket.on('disconnect', () => {
//     console.log('User disconnected');
//   });
// });

// socket.on('send_message', (message) => {
//     console.log(message)
//     io.emit('receive_message', message);
// });