import * as socketIoClient from "socket.io-client"
import { SocketIoMessage, SocketIoMessageOperation } from "./socketio_server_test"
import * as uuid from "uuid"
import * as readline from "readline"

function createSocketIoClient(): socketIoClient.Socket {
    const socket = socketIoClient.io("ws://localhost:3000");

    // Attach event handler
    socket.on("connect", () => {
        console.log(`Socket connected with socket id: ${socket.id}`);

        processMessage(socket);
    });

    socket.on("op", (message: SocketIoMessage) => {
        console.log(`Client#${socket.id}: Received message from server: ${JSON.stringify(message)}`);
    });

    return socket;
}

async function getUserInput(): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question("Please type below:\n", (input: string) => {
        rl.close();
        resolve(input);
    }))
}

async function processMessage(socket: socketIoClient.Socket) {
    if (socket.connected) {
        const input: string = await getUserInput();
        if (input.toLowerCase() === "exit" || input.toLowerCase() === "quit") {
            socket.disconnect();
            return;
        }

        if (input.toLowerCase() === "disconnect") {
            console.log(`Specail command typed: ${input}`);
            const message: SocketIoMessage = {
                userId: uuid.v4(),
                operation: SocketIoMessageOperation.Disconnect,
                message: "Hello world",
            }
            socket.emit("op", message);
            return;
        }
        else if (input.toLowerCase() === "forcedisconnect") {
            console.log(`Specail command typed: ${input}`);
            const message: SocketIoMessage = {
                userId: uuid.v4(),
                operation: SocketIoMessageOperation.ForceDisconnect,
                message: "Hello world",
            }
            socket.emit("op", message);
            return;
        }
        else {
            socket.emit("op", input);
        }

        process.nextTick(() => {
            processMessage(socket)
        });
    }
}

async function run() {
    console.log("Starting socket io client...");
    let socket = createSocketIoClient();
    let socket2 = createSocketIoClient();
}

if (require.main === module) {
    run();
 }