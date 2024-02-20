import { unusedPortsResult } from "./config/ports.js";
import { createWebSockets } from "./config/ws.js";
import { reverseProxy } from "./config/reverseProxy.js";

// Network config
const minPort = 7777;
const maxPort = 7780;
const host = "localhost";

unusedPortsResult(minPort, maxPort, host)
  .then((unusedPorts) => {
    console.log(
      "Unused UDP ports that are available for game sessions:",
      unusedPorts.length
    );
    createWebSockets(unusedPorts);
    reverseProxy(unusedPorts);
  })
  .catch((err) => {
    console.error("Error collecting unused UDP ports:", err);
  });