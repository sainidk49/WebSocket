const express = require('express');
const path = require('path')
const app = express();
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log("Server running is :: ", `http:://localhost:${PORT}`)
})

const io = require("socket.io")(server)

let connectedUsers = new Set();

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', onConnected)

function onConnected(socket) {
    connectedUsers.add(socket.id);
    io.emit("total-users", connectedUsers.size)

    socket.on("disconnect", () => {
        connectedUsers.delete(socket.id);
        io.emit("total-users", connectedUsers.size)
    })

    socket.on("message", (data)=>{
        socket.broadcast.emit("chat-message", data)
    })  

    socket.on("typing", (data) => {
        socket.broadcast.emit("typing", data)
    })
}

