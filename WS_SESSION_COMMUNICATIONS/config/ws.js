import { WebSocket, WebSocketServer } from "ws";
import { exec } from "child_process";
import {
  applyStatusChangeToPathsToServersMap,
  getPathsToServersMap,
} from "./path.js";

const STOP = "STOP"
const CREATE = "CREATE"
const REMOVE = "REMOVE"


const createWebSockets = async function (portLst) {
  console.log(`Created game WebSocket hub on port: ${portLst}`);
  portLst.forEach((port) => {
    const ws = new WebSocketServer({ port: port });

    // Define the Docker commands:
    const dockerCommandCreateSession = `docker run -d -p ${port}:7777/udp --name session${
      port - 7000
    } server`;
    const dockerCommandStopSession = `docker container stop session${
      port - 7000
    }`;
    const dockerCommandDeleteSession = `docker container rm session${
      port - 7000
    }`;

    // Store connected clients
    const clients = new Set();

    let dedicatedServer = {
      port: port,
      status: "Awaiting players",
      playersCount: 0,
      sessionRunning: false
    };

    ws.on("connection", (ws) => {
      console.log(`New user connected on game session: ${port}`);
      clients.add(ws);
      ws.send(`Your are connected to game session ${port}`);

      dedicatedServer.playersCount++;

      switch (dedicatedServer.playersCount) {
        case 1: {
          applyStatusChangeToPathsToServersMap(port, "AWAITING");
          dedicatedServer.status = "Awaiting players";
          break;
        }
        case 2: {
          console.log(`Session ${port} is full!`);
          applyStatusChangeToPathsToServersMap(port, "CLOSED");

          dedicatedServer.status = "Full";
          executeUbuntuCmd(dockerCommandStopSession, STOP)
            .then(() => {
              executeUbuntuCmd(dockerCommandDeleteSession, REMOVE)
                .then(() => {
                  executeUbuntuCmd(dockerCommandCreateSession, CREATE)                  
                  .then(() => {                  
                    dedicatedServer.sessionRunning = true;
                    console.log(`Session ${port - 7000} is running`);
                    broadcast(JSON.stringify(dedicatedServer), clients);
                  })
                  .catch((error) => {
                    console.error("Error occurred:", error);
                  });                  
                })
                .catch((error) => {
                  console.error("Error occurred:", error);
                });
            })
            .catch((error) => {
              console.error("Error occurred:", error);
            });

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
        }
      });

      ws.on("close", function close() {
        console.log(`User disconnected from game session: ${port}`);
        dedicatedServer.playersCount--;

        switch (dedicatedServer.playersCount) {
          case 0: {
            dedicatedServer.playersCount = 0
            executeUbuntuCmd(dockerCommandStopSession, STOP)
              .then(() => {
                executeUbuntuCmd(dockerCommandDeleteSession, REMOVE)
                  .then(() => {
                    dedicatedServer.sessionRunning = false;
                    applyStatusChangeToPathsToServersMap(port, "OPEN");
                  })
                  .catch((error) => {
                    console.error("Error occurred:", error);
                  });
              })
              .catch((error) => {
                console.error("Error occurred:", error);
              });
            break;
          }
          case 1: {
            //applyStatusChangeToPathsToServersMap(port, "AWAITING");
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

    function executeUbuntuCmd(ubuntu_cmd, type) {
      return new Promise((resolve, reject) => {
        // Execute the Docker command
        const childProcess = exec(ubuntu_cmd);

        // Handle stdout data
        childProcess.stdout.on("data", (data) => {
          console.log(`${type}: Container ${port} stdout: ${data}`);
        });

        // Handle stderr data
        childProcess.stderr.on("data", (data) => {
          console.error(`${type}: Container ${port} error: ${data}`);
        });

        // Handle process exit
        childProcess.on("close", (code) => {
          console.log(`${type}: child process exited with code ${code}`);
          resolve();
        });

        // Handle errors
        childProcess.on("error", (error) => {
          console.error("Error occurred:", error);
          reject(error);
        });
      });
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
