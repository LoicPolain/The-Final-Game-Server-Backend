import { WebSocket, WebSocketServer } from "ws";
const ws = new WebSocketServer({port: 8080});

let dedicatedServer = {
    port: 7777,
    status: "Running",
    playerStatus: "Awaiting",
    playersCount: 0
}

ws.on("connection", (ws)=> {
    console.log("New user connected");
    ws.send("Your are connected to your own websocket!")
    dedicatedServer.playersCount++
    if (dedicatedServer.playersCount == 2) {
        dedicatedServer.playerStatus = "Full"
    }
    ws.send(JSON.stringify(dedicatedServer))
})