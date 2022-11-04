import * as http from "http"
import * as express from "express"

async function processRequest(flag: boolean): Promise<string> {
    try {
        if(flag) {
            throw new Error("Promise reject: error happens");
        }
    }
    catch(error) {
        return Promise.reject(error);
    }
    return "process success";
}

function returnResponse<T>(promise: Promise<T>, response: express.Response) {
    promise.then((result) => {
        console.log(`result is ${result}`);
        return response.sendStatus(200);
    }, (error) => {
        console.log(`error is ${error}`);
        return response.sendStatus(500);
        
    })
}

// ARM response format
interface ArmErrorResponse {
    error: {
        code: string,
        message: string
    }
}

function createRouter(): express.Router {
    let router = express.Router();
    router.get("/success", async function(req, res) {
        let obj = await res.send(
            {
                key: "Home page"
            });
        console.log(obj);
    });
    router.get("/reject", async function(req, res) {
        const armResponse: ArmErrorResponse = {
            error: {
                code: "TestArmCode",
                message: "TestErrorMsg",
            }
        }
        let obj = await res.status(500).json(armResponse);
        console.log(obj);
    });
    return router;
}

function createHttpServer(router: express.Router): http.Server {
    let app = express();
    app.use(router);
    return http.createServer(app);
}

function run() {
    const hostname = "127.0.0.1";
    const port = 8000;

    let router: express.Router = createRouter();
    let server = createHttpServer(router);
    server.listen(port, hostname, function() {
        console.log(`Server is listening at http://${hostname}:${port}`);
    })
}

run();