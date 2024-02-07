import { WebSocket, WebSocketServer } from "ws";

for (let port = 7777; port <= 7778; port++) {
  const ws = new WebSocketServer({ port: port });

  let dedicatedServer = {
    port: port,
    status: "Running",
    playersStatus: "Awaiting players",
    playersCount: 0,
  };

  ws.on("connection", (ws) => {
    console.log("New user connected");

    ws.send("Your are connected to your own websocket!");

    if (dedicatedServer.playersCount >= 2) {
      ws.send("Server is full");
      ws.close();
    } else {
      dedicatedServer.playersCount++;
      if (dedicatedServer.playersCount == 2) {
        dedicatedServer.playersStatus = "Full";
      }
      console.log(dedicatedServer);
    }

    ws.on("close", function close() {
      console.log("User disconnected");
      dedicatedServer.playersCount--;
      if (dedicatedServer.playersCount < 2) {
        dedicatedServer.playersStatus = "Awaiting players";
      }
    });

    ws.on("error", function (error) {
      console.error("WebSocket error:", error);
    });

    ws.send(JSON.stringify(dedicatedServer));
  });
}
