import { WebSocket, WebSocketServer } from "ws";
const ws = new WebSocketServer({ port: 8080 });

let dedicatedServer = {
  port: 7777,
  status: "Running",
  playersStatus: "Awaiting players",
  playersCount: 0,
};

ws.on("connection", (ws) => {
  console.log("New user connected");
  ws.send("Your are connected to your own websocket!");

  if (dedicatedServer.playersCount >= 2) {
    ws.send("Server is full");
  } else {
    dedicatedServer.playersCount++;
    if (dedicatedServer.playersCount == 2) {
      dedicatedServer.playersStatus = "Full";
    }
  }

  ws.on('close', function close() {
    console.log('User disconnected');
    dedicatedServer.playersCount--;
    if (dedicatedServer.playersCount < 2) {
      dedicatedServer.playersStatus = "Awaiting players";
    }
  });
  ws.send(JSON.stringify(dedicatedServer));
});
