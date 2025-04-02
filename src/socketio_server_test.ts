import * as http  from "http";
import * as socketIo from "socket.io";
import * as express from "express"
import { createAdapter } from "@socket.io/redis-adapter";
import { Redis } from "ioredis";
import * as nconf from "nconf";
import * as path from "path";

export enum SocketIoMessageOperation {
    Disconnect = "Disconnect",
    ForceDisconnect = "ForceDisconnect",
    Operation = "Operation",
    Join = "Join",
    Leave = "Leave",
    Broadcast = "Broadcast",
};

export interface SocketIoMessage {
    userId: string,
    operation: SocketIoMessageOperation,
    message?: string,
    room?: string,
};

function createHttpServer(): http.Server {
    const app = express();
    // Middleware to parse JSON request bodies
    app.use(express.json());

    app.get('/', (req, res) => {
        res.send('<h1>Hello world</h1>');
    });

    app.post('/send', (req, res) => {
        const message = req.body;
        console.log(`HTTP sever: received message: ${JSON.stringify(message)}`);
        res.send('Message received');
    });
    const httpServer = http.createServer(app);
    return httpServer
}

async function createSocketIoServer(httpServer: http.Server, config: nconf.Provider): Promise<socketIo.Server> {
    // Redis connection details (replace with your Azure Redis instance details)
    const redisHost = config.get("redisHost");
    const redisPort = config.get("redisPort");;
    const redisPassword = config.get("redisPassword");

    // Create Redis clients for pub/sub using ioredis
    const pubClient = new Redis({
        host: redisHost,
        port: redisPort,
        password: redisPassword,
        tls: {}, // Use TLS for secure connection
    });
    const subClient = pubClient.duplicate();
    pubClient.on("error", (err) => {
        console.error("Redis pubClient error:", err);
    });
    subClient.on("error", (err) => {
        console.error("Redis subClient error:", err);
    });

    const adapter = createAdapter(pubClient, subClient);

    // Use the Redis adapter
    const serverOptions: Partial<socketIo.ServerOptions> = {
        transports: ["websocket", "polling"],
        adapter,
    };
    const io = new socketIo.Server(httpServer, serverOptions);
    return io;
}

function configureSocketIoServer(socketIoServer: socketIo.Server) {
    socketIoServer.on("connection", (socket: socketIo.Socket) => {
        console.log(`A user connected, socket id = ${socket.id}`);

        socket.on("op", (message: string) => {
            console.log(`Server: received message from client ${socket.id}:\n ${JSON.stringify(message)}\n`);
            try {
                const messageObj = JSON.parse(message) as SocketIoMessage;
                if (messageObj.operation === SocketIoMessageOperation.Disconnect) {
                    console.log(`Disconnecting client ${socket.id}`);
                    socket.disconnect();
                }
                else if (messageObj.operation === SocketIoMessageOperation.ForceDisconnect) {
                    console.log(`Force disconnecting client ${socket.id}`);
                    socket.disconnect(true);
                }
                else if (messageObj.operation == SocketIoMessageOperation.Join) {
                    console.log(`Joining room ${messageObj.room}`);
                    const roomName = messageObj.room;
                    socket.join(roomName);
                }
                else if (messageObj.operation == SocketIoMessageOperation.Leave) {
                    console.log(`Leaving room ${messageObj.room}`);
                    const roomName = messageObj.room;
                    socket.leave(roomName);
                }
                else if (messageObj.operation == SocketIoMessageOperation.Broadcast) {
                    const roomName = messageObj.room;
                    const msg = messageObj.message;
                    console.log(`Broadcasting message to room ${roomName}: ${msg}`);
                    socketIoServer.to(roomName).emit("test", msg);
                }
                else {
                    console.log(`Unknown operation: ${messageObj.operation}`);
                }
            }
            catch (error) {
                console.error(`Error when handling message: ${message}, Error: ${error}`);
            }
        });

        socket.on("disconnect", () => {
            console.log(`client ${socket.id} disconnected`);
        })
    });
}

async function run() {
    const configFilePath = path.join(
		__dirname,
		"../config/socketIoServerConfig.secret.json",
	);
    const config = nconf.file(configFilePath)
    .argv()
    .env()
    .defaults({
        port: 3000, // Default port if not provided
    });
    const port = nconf.get("port");
    let httpServer = createHttpServer();
    let socketIoServer = await createSocketIoServer(httpServer, config);
    configureSocketIoServer(socketIoServer);

    const randomNumber = Math.floor(Math.random() * 1000);
    setInterval(() => {
        console.log(`Sending message to all clients: rand: ${randomNumber}`);
        socketIoServer.sockets.emit("test", `test from local, rand: ${randomNumber}`);
    }, 5000);

    console.log("Starting socket io server");
    //socketIoServer.listen(port);
    httpServer.listen(port, () => {
        console.log(`Listening on *.${port}`);
    });
}

if (require.main === module) {
   run();
}