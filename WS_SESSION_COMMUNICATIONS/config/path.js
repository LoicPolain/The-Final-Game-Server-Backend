import { SessionInfo } from "./sessionStatusClass.js";

let pathsToServersMap = new Map();

function generateMapsPathWS(portLst) {
    portLst.forEach((port) => {
        const session = new SessionInfo(
          `/session${port - 7000}`,
          `ws://localhost:${port}`,
          "OPEN",
          Date.now()
        );
        let path = `/session${port - 7000}`;
        pathsToServersMap.set(path, session);
      });    
}

function setPathsToServersMap(pathsToServers) {
    pathsToServersMap = pathsToServers
}

function getPathsToServersMap() {
    return pathsToServersMap
}

function applyStatusChangeToPathsToServersMap(port, status) {
    let path = `/session${port - 7000}`;
    pathsToServersMap.get(path).status = status;
    pathsToServersMap.get(path).lastUpdate = Date.now();
}

export { 
    getPathsToServersMap,
    setPathsToServersMap, 
    generateMapsPathWS,
    applyStatusChangeToPathsToServersMap
};