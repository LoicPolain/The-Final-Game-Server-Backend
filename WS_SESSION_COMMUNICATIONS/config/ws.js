import { WebSocket, WebSocketServer } from "ws";
import { exec } from "child_process";
import { applyStatusChangeToPathsToServersMap, getPathsToServersMap } from "./path.js";

const createWebSockets = function (portLst) {
  portLst.forEach((port) => {
    const ws = new WebSocketServer({ port: port });
    // console.log(`Created game session on port: ${port}`);
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

      dedicatedServer.playersCount++;

      switch (dedicatedServer.playersCount) {
        case 1:{
          applyStatusChangeToPathsToServersMap(port, "AWAITING");
          break;
        }
        case 2:{
            console.log(`Session ${port} is full!`);
            applyStatusChangeToPathsToServersMap(port, "CLOSED");
            break;
        }
        default:
          break;
      }

      if (dedicatedServer.playersCount > 2) {
        ws.send("Session is full");
        ws.close();
      } else {
        console.log(getPathsToServersMap().get(`/session${port - 7000}`));
        broadcast(JSON.stringify(dedicatedServer), clients);
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

        switch (dedicatedServer.playersCount) {
          case 0:{
            applyStatusChangeToPathsToServersMap(port, "OPEN");
            break;
          }
          case 1:{
            applyStatusChangeToPathsToServersMap(port, "AWAITING");
            break;
          }
          default:
            break;
        }

      });

      ws.on("error", function (error) {
        console.error("WebSocket error:", error);
      });
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