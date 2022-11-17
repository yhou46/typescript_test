import * as socketIoClient from "socket.io-client"

function createSocketIoClient(): socketIoClient.Socket {
    const socket = socketIoClient.io();
    return socket;
}

function run() {
    // let socket = createSocketIoClient();
    // socket.on("connection", (socket) => {
    //     console.log();
    // });
    let socket = socketIoClient.connect("ws://localhost:3000");
    socket.on("connect", () => {
        console.log("connected");
    });
}

run();