// Importing the required modules
const WebSocketServer = require('ws');

// Creating a new websocket server
const wss = new WebSocketServer.Server({ port: 8080 })

var clientId = 0;
var lookup = []
var uniqueMessageId = 0;

const ACTION_OUT_PLAYERS_UPDATED = "ACTION_OUT_PLAYERS_UPDATED";
const ACTION_IN_SET_NAME = "ACTION_IN_SET_NAME";
const ACTION_IN_NEW_CHAT_MESSAGE = "ACTION_IN_NEW_CHAT_MESSAGE";
const ACTION_OUT_NEW_CHAT_MESSAGE = "ACTION_OUT_NEW_CHAT_MESSAGE";
const ACTION_OUT_SET_PLAYER_ID = "ACTION_OUT_SET_PLAYER_ID";

wss.on("connection", ws => {
// Creating connection using websocket

    ws.id = clientId++;
    lookup.push(ws);

    console.log("the client has connected: " + ws.id + ", connections: " + lookup.map(ws => ws.id));

    function send(message) {
        ws.send(JSON.stringify(message));
    }

    function sendAll(message) {
        lookup.forEach(ws => ws.send(JSON.stringify(message)))
        // wss.clients.forEach(client => client.send(message.toString()));
    }

    function sendToClient(message, clientId) {
        clientWs = lookup.filter(ws => clientId === ws.id);
        clientWs.send(JSON.stringify(message));
    }

    function sendUpdatedPlayers() {
        const players = lookup.map(ws => ({playerId: ws.id, playerName: ws.playerName}));
        sendAll({action: ACTION_OUT_PLAYERS_UPDATED, data: players});
    }

    function processIncomingData(clientId, data) {
        console.log("Client has sent us: " + JSON.stringify(data));

        switch(data.action) {
            case ACTION_IN_SET_NAME:
                const playerName = data.data;
                ws.playerName = playerName;
                send({action: ACTION_OUT_SET_PLAYER_ID, data: ws.id });
                sendUpdatedPlayers();
                break;
            case ACTION_IN_NEW_CHAT_MESSAGE:
                const newChatMessageText = data.data;
                const newChatMessage = {id: uniqueMessageId++, playerId: ws.id, playerName: ws.playerName, chatMessageText: newChatMessageText};
                sendAll({action: ACTION_OUT_NEW_CHAT_MESSAGE, data: newChatMessage})
                break;
            default:
                send({action: "UNKNOWN_COMMAND", data: data.action});
        }
    }

    //on message from client
    ws.on("message", data => {
        processIncomingData(ws.id, JSON.parse(data));
    });

    function timer() {
        sendAll(getTimestampInSeconds());
    }

    function getTimestampInSeconds () {
        return Math.floor(Date.now() / 1000)
    }

    // handling what to do when clients disconnects from server
    ws.on("close", () => {
        lookup = lookup.filter(item => item.id !== ws.id);
        sendUpdatedPlayers();
        console.log("the client has disconnected: " + ws.id);
    });

    // handling client connection error
    ws.onerror = function () {
        console.log("Some Error occurred")
    }
});
console.log("The WebSocket server is running on port 8080");