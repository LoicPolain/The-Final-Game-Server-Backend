const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 8080;

// Session data structure to store information about game sessions
const sessions = {};

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// POST endpoint to receive current path and return new path
app.post('/generateNewPath', (req, res) => {
    const { sessionId, currentPath } = req.body;

    // Check if session exists, if not, create a new one
    if (!sessions[sessionId]) {
        sessions[sessionId] = {
            currentPath: currentPath,
            // You can add more session-specific data here
        };
    }

    const newPath = generateNewPath(sessionId, currentPath);

    res.json({ newPath: newPath });
});

// Function to generate a new path for a specific game session
function generateNewPath(sessionId, currentPath) {
    // Example logic to generate a new path for the given session
    // This is just a placeholder example
    return `${currentPath}/${sessionId}/new`; // Appending session ID to the current path as an example
}

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
