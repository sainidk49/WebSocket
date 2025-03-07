const socket = io();
const userName = document.getElementById('userName');
const messageListBx = document.getElementById('messageListBx');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const userActive = document.getElementById('userActive');
const connectedUsers = document.getElementById('activeUsers');

const mesageSend = new Audio("assets/audio/message.mp3")
const mesageRecieve = new Audio("assets/audio/send.mp3")


socket.on("total-users", (data) => {
    connectedUsers.innerText = `${data}`;
});


messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    sendMessage();
});


function sendMessage() {
    const data = {
        name: userName.value.trim(),
        message: messageInput.value.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    socket.emit("message", data);
    addMessageUI(true, data);
    messageInput.value = '';
}


socket.on("chat-message", (data) => {
    addMessageUI(false, data);
});


function addMessageUI(isOwnMessage, data) {
    let messageAlign = isOwnMessage ? "right" : "left";
    const element = `
        <li class="list-item ${messageAlign}">
            <span class="text-message-bx">${data.message}</span>
            <span id="messsageTime">${data.name} - ${data.time} </span>
        </li>
        `;
    messageListBx.innerHTML += element;
    scrollToBottom()
    if (isOwnMessage) {
        console.log("hello")
        mesageSend.play()
    }
    else{
        mesageRecieve.play()
        console.log("hello")
    }
}


messageInput.addEventListener("focus", (e) => {
    socket.emit("typing", {
        typing: `${userName.value.trim()} is typing...`
    })
});


messageInput.addEventListener("keypress", (e) => {
    socket.emit("typing", {
        typing: `${userName.value.trim()} is typing...`
    })
});


messageInput.addEventListener("blur", (e) => {
    socket.emit("typing", {
        typing: ``
    })
});


socket.on("typing", (data) => {
    userActive.innerText = data.typing;
})


function scrollToBottom() {
    messageListBx.scrollTop = messageListBx.scrollHeight;
}