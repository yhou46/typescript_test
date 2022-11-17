import * as http  from "http";
import * as socketIo from "socket.io";
import * as express from "express"

function createHttpServer(): http.Server {
    const app = express();
    app.get('/', (req, res) => {
        res.send('<h1>Hello world</h1>');
    });
    const httpServer = http.createServer(app);
    return httpServer
}

function createSocketIoServer(httpServer: http.Server): socketIo.Server {
    const io = new socketIo.Server(httpServer, {
    // options
    });
    return io;
}

function configureSocketIoServer(socketIoServer: socketIo.Server) {
    socketIoServer.on("connection", (socket: socketIo.Socket) => {
        console.log("A user connected");
        socket.on("op", (message) => {
            console.log(`Server: received message: ${JSON.stringify(message)}`);
        });
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

run();