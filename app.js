// Importing the required modules
const WebSocketServer = require('ws');

// Creating a new websocket server
const wss = new WebSocketServer.Server({ port: 8080 })

var id = 0;
var lookup = {};

// Creating connection using websocket
wss.on("connection", ws => {

    ws.id = id++;
    lookup[ws.id] = ws;

    function send(message) {
        ws.send(message);
        // wss.clients.forEach(client => client.send(message));
    }

    function sendToClient(message, clientId) {
        clientWs = lookup[clientId];
        clientWs.send(message.toString());
        // wss.clients.forEach(client => client.send(message));
    }

    console.log("new client connected");

    // sending message to client
    send('Welcome, you are connected!!!!!!');

    //on message from client
    ws.on("message", data => {
        console.log(`Client has sent us: ${data}`);
        // let myVar = null;
        if(data == 'start') {
            myVar = setInterval(function(){ timer() }, 1000);
        } else if (data == 'stop') {
            clearInterval(myVar);
        } else {
            sendToClient(data, 0);
            // send(`Unknown command: ${data}`);
        }
    });

    function timer() {
        send(getTimestampInSeconds());
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