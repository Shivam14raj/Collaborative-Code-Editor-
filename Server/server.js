import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

const rooms = new Map();

io.on("connection", (socket) => {
  console.log("client connected:", socket.id);

  let currentRoom = null;
  let currentUser = null;

  // JOIN ROOM
  socket.on("join", ({ roomID, userName }) => {
    currentRoom = roomID;
    currentUser = userName;

    socket.join(roomID);

    if (!rooms.has(roomID)) {
      rooms.set(roomID, new Set());
    }

    rooms.get(roomID).add(userName);

    io.to(roomID).emit(
      "user-joined",
      Array.from(rooms.get(roomID))
    );
  });

  // CODE SYNC
  socket.on("codeChange", ({ roomID, code }) => {
    socket.to(roomID).emit("codeUpdate", code);
  }); 

  // typing incicator 
  socket.on("typing",  ({roomID, userName})=>{
     if(!roomID || !userName) return; 
     socket.to(roomID).emit("userTyping", userName) 
  })
  

  // leave room 
  socket.on("leave-room", ({ roomID, userName }) => {
  socket.leave(roomID);

  if (rooms.has(roomID)) {
    rooms.get(roomID).delete(userName);

    io.to(roomID).emit(
      "user-joined",
      Array.from(rooms.get(roomID))
    );
  }

  console.log(`${userName} left room ${roomID}`);
});


  // DISCONNECT HANDLING
  socket.on("disconnect", () => {
    if (currentRoom && currentUser) {
      rooms.get(currentRoom)?.delete(currentUser);

      io.to(currentRoom).emit(
        "user-joined",
        Array.from(rooms.get(currentRoom) || [])
      );
    }

    console.log("client disconnected:", socket.id);
  });
});

const port = process.env.PORT || 7000;

server.listen(port, () => {
  console.log(`server running on port ${port}`);
});