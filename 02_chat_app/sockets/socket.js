let connectedUsers = new Set();

function onConnected(socket, io) {
    connectedUsers.add(socket.id);
    io.emit("total-users", connectedUsers.size);

    socket.on("disconnect", () => {
        connectedUsers.delete(socket.id);
        io.emit("total-users", connectedUsers.size);
    });

    socket.on("message", (data) => {
        socket.broadcast.emit("chat-message", data);
    });

    socket.on("typing", (data) => {
        socket.broadcast.emit("typing", data);
    });
}

module.exports = { onConnected };
