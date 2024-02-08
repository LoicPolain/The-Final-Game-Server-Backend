import { WebSocket, WebSocketServer } from "ws";
import { exec } from "child_process";

const createWebSockets = function (portLst) {
  portLst.forEach((port) => {
    const ws = new WebSocketServer({ port: port });
    console.log(`Created game session on port: ${port}`);
    // Define the Docker command you want to execute
    const dockerCommand = "docker container ls -a";

    // Store connected clients
    const clients = new Set();

    let dedicatedServer = {
      port: port,
      status: "Awaiting players",
      playersStatus: "Awaiting players",
      playersCount: 0,
    };

    ws.on("connection", (ws) => {
      console.log(`New user connected on game session: ${port}`);
      clients.add(ws);
      ws.send(`Your are connected to game session ${port}`);

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

      ws.on("message", function incoming(message) {
        console.log("received: %s", message);
        if (message == "Start game") {
          executeDockerCmd();
        }
      });

      ws.on("close", function close() {
        console.log(`User disconnected from game session: ${port}`);
        dedicatedServer.playersCount--;
        if (dedicatedServer.playersCount < 2) {
          dedicatedServer.playersStatus = "Awaiting players";
        }
      });

      ws.on("error", function (error) {
        console.error("WebSocket error:", error);
      });

      broadcast(JSON.stringify(dedicatedServer), clients);
    });

    function executeDockerCmd() {
      // Execute the Docker command
      const childProcess = exec(dockerCommand);

      // Handle stdout data
      childProcess.stdout.on("data", (data) => {
        console.log(`stdout: ${data}`);
      });

      // Handle stderr data
      childProcess.stderr.on("data", (data) => {
        console.error(`stderr: ${data}`);
      });

      // Handle process exit
      childProcess.on("close", (code) => {
        console.log(`child process exited with code ${code}`);
      });

      dedicatedServer.status = "Running";
      broadcast(JSON.stringify(dedicatedServer), clients);
    }
  });
};

// Function to broadcast message to all connected clients
function broadcast(message, clients) {
  clients.forEach((client) => {
    // Check if the connection is still open before sending
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

export { createWebSockets as createWebSockets };
