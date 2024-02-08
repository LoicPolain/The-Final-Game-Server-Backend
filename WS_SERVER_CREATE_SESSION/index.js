const http = require('http');
const httpProxy = require('http-proxy');

// Create a new HTTP server
const server = http.createServer((req, res) => {
    // Here, you can handle any regular HTTP requests if needed
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('WebSocket reverse proxy is running!');
});

// Create a WebSocket proxy instance
const proxy = httpProxy.createProxyServer({
    ws: true
});

// Map paths to WebSocket servers
var pathsToServers = {
    '/path1': 'ws://localhost:7777',
    '/path2': 'ws://localhost:7778'
};

// Handle WebSocket upgrade requests
server.on('upgrade', (req, socket, head) => {
    const url = req.url;
    const target = pathsToServers[url];
    if (!target) {
        socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
        socket.destroy();
        return;
    }

    proxy.ws(req, socket, head, { target }, (err) => {
        console.error('WebSocket proxy error:', err);
    });
});

// Start the HTTP server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`WebSocket reverse proxy listening on port ${PORT}`);
});