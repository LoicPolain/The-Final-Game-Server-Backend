import isPortReachable from "is-port-reachable";

async function collectUnusedUdpPorts(minPort, maxPort, host) {
  const unusedUdpPorts = [];
  for (let port = minPort; port <= maxPort; port++) {
    const reachable = await isPortReachable(port, { host, protocol: "udp" });
    if (!reachable) {
      unusedUdpPorts.push(port);
    }
  }
  return unusedUdpPorts;
}

      export { collectUnusedUdpPorts as unusedPortsResult };