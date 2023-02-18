// Importing the required modules
const WebSocketServer = require('ws');

// Creating a new websocket server
const wss = new WebSocketServer.Server({ port: 8080 })

// Creating connection using websocket
wss.on("connection", ws => {
    console.log("new client connected");

    // sending message to client
    ws.send('Welcome, you are connected!');

    //on message from client
    ws.on("message", data => {
        console.log(`Client has sent us: ${data}`);
        // let myVar = null;
        if(data == 'start') {
            myVar = setInterval(function(){ timer() }, 1000);
        } else if (data == 'stop') {
            clearInterval(myVar);
        } else {
            ws.send(`Unknown command: ${data}`);
        }
    });

    function timer() {
        ws.send(getTimestampInSeconds());
    }

    function getTimestampInSeconds () {
        return Math.floor(Date.now() / 1000)
    }

    // handling what to do when clients disconnects from server
    ws.on("close", () => {
        console.log("the client has connected");
    });

    // handling client connection error
    ws.onerror = function () {
        console.log("Some Error occurred")
    }
});
console.log("The WebSocket server is running on port 8080");