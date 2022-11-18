import * as http  from "http";
import * as socketIo from "socket.io";
import * as express from "express"

export enum SocketIoMessageOperation {
    Disconnect = "Disconnect",
    ForceDisconnect = "ForceDisconnect",
    Operation = "Operation",
};

export interface SocketIoMessage {
    userId: string,
    operation: SocketIoMessageOperation,
    message?: string,
};

function createHttpServer(): http.Server {
    const app = express();
    app.get('/', (req, res) => {
        res.send('<h1>Hello world</h1>');
    });
    const httpServer = http.createServer(app);
    return httpServer
}

function createSocketIoServer(httpServer: http.Server): socketIo.Server {
    const serverOptions: Partial<socketIo.ServerOptions> = {
        transports: ["websocket", "polling"],
    };
    const io = new socketIo.Server(httpServer, serverOptions);
    return io;
}

function configureSocketIoServer(socketIoServer: socketIo.Server) {
    socketIoServer.on("connection", (socket: socketIo.Socket) => {
        console.log(`A user connected, socket id = ${socket.id}`);

        socket.on("op", (message: SocketIoMessage) => {
            console.log(`Server: received message from client ${socket.id}:\n ${JSON.stringify(message)}\n`);
            if (message.operation == SocketIoMessageOperation.Disconnect) {
                console.log(`Disconnecting client ${socket.id}`);
                socket.disconnect();
            }
            else if (message.operation == SocketIoMessageOperation.ForceDisconnect) {
                console.log(`Force disconnecting client ${socket.id}`);
                socket.disconnect(true);
            }
        });

        socket.on("disconnect", () => {
            console.log(`client ${socket.id} disconnected`);
        })
    });
}

function run() {
    let httpServer = createHttpServer();
    let socketIoServer = createSocketIoServer(httpServer);
    configureSocketIoServer(socketIoServer);

    console.log("Starting socket io server");
    httpServer.listen(3000, () => {
        console.log("Listening on *.3000");
    });
}

if (require.main === module) {
   run();
}