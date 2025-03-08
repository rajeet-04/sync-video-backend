const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" },
});

app.use(cors());

let rooms = {}; // Store room data

// Handle WebSocket connections
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("create-room", (roomId) => {
        if (!rooms[roomId]) {
            rooms[roomId] = { videoState: { action: "pause", time: 0 } };
        }
        socket.join(roomId);
        console.log(`Room ${roomId} created`);
    });

    socket.on("join-room", (roomId) => {
        socket.join(roomId);
        console.log(`User joined room: ${roomId}`);

        // Sync new user with current video state
        if (rooms[roomId]) {
            socket.emit("sync", rooms[roomId].videoState);
        }
    });

    socket.on("sync", ({ roomId, action, time }) => {
        if (rooms[roomId]) {
            rooms[roomId].videoState = { action, time };
            socket.to(roomId).emit("sync", { action, time });
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// API route to check server status
app.get("/", (req, res) => {
    res.send("Sync Video Server is Running!");
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
