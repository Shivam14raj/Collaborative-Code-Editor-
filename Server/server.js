import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import axios from 'axios'

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



  // compile code sync 
 const languageMap = {
  javascript: 63,
  python: 71,
  cpp: 54,
  java: 62,
};

socket.on("compileCode", async ({ code, roomID, language }) => {
  try {
    if (!rooms.has(roomID)) return;

    if (!code || !languageMap[language]) {
      return io.to(roomID).emit("codeResponse", {
        output: "Code or language is missing",
      });
    }

    const response = await axios.post(
      "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
      {
        source_code: code,
        language_id: languageMap[language],
        stdin: "",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    io.to(roomID).emit("codeResponse", {
      output:
        response.data.stdout ||
        response.data.stderr ||
        response.data.compile_output ||
        response.data.message ||
        "No output",
    });
  } catch (error) {
    console.log("Judge0 error:", error.response?.data || error.message);

    io.to(roomID).emit("codeResponse", {
      output:
        error.response?.data?.message ||
        "Code execution failed",
    });
  }
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