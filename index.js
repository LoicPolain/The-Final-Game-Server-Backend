import { WebSocket, WebSocketServer } from "ws";
const ws = new WebSocketServer({port: 8080});

ws.on("connection", (ws)=> {
    console.log("user connected");
    ws.send("Your are connected!")
})