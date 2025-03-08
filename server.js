const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// Enable CORS for WebSockets
app.use(cors({ origin: "*" }));

const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
        credentials: true,
    },
    transports: ["websocket", "polling"], // Ensure WebSocket + Polling
});

// Handle WebSocket connections
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("sync", ({ roomId, action, time }) => {
        socket.to(roomId).emit("sync", { action, time });
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// Ensure the backend listens on the correct port
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
