import express from 'express';
import { WebSocketServer } from "ws";

const app = express();

const PORT = 8080;

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})

const wss = new WebSocketServer({ server });
wss.on("connection", ws => {
    ws.on("message", data => {
        console.log(`Received message => ${data}`);    
        ws.send("Thanks for connecting with me")
    })
})

