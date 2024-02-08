import { SessionInfo } from "./sessionStatusClass.js";
import http from "http";
import httpProxy from "http-proxy";

// Map paths to WebSocket servers
let pathsToServers = new Map();

function reverseProxy(portLst) {
    // Create a new HTTP server
    const server = http.createServer((req, res) => {
      // Here, you can handle any regular HTTP requests if needed
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("WebSocket reverse proxy is running!");
    });
  
    // Create a WebSocket proxy instance
    const proxy = httpProxy.createProxyServer({
      ws: true,
    });
  
    portLst.forEach((port) => {
      const session = new SessionInfo(
        `/session${port - 7000}`,
        `ws://localhost:${port}`,
        "OPEN"
      );
      var path = `/session${port - 7000}`;
      pathsToServers.set(path, session);
    });
  
    // Handle WebSocket upgrade requests
    server.on("upgrade", (req, socket, head) => {
      const url = req.url;
      if (url != "/") {
        const target = pathsToServers.get(url).location;
        if (!target) {
          socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
          socket.destroy();
          return;
        }
  
        proxy.ws(req, socket, head, { target }, (err) => {
          console.error("WebSocket proxy error:", err);
        });
      }
      if (url == "/") {
        const target = getAvailablePath()
        if (!target) {
          socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
          socket.destroy();
          return;
        }
  
        proxy.ws(req, socket, head, { target }, (err) => {
          console.error("WebSocket proxy error:", err);
        });
      }
    });
  
    // Start the HTTP server
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`WebSocket reverse proxy listening on port ${PORT}`);
    });
  }

  function getAvailablePath() {
    let availablePath = null
    pathsToServers.forEach((info, path)=>{
      if (info.status == "OPEN") {
        availablePath = info.location
        return
      }
    })
    return availablePath
  }

  export { reverseProxy as reverseProxy };