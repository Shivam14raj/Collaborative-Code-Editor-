import React, { useEffect, useState } from "react";
import "./App.css";
import { io } from "socket.io-client";
import Editor from "@monaco-editor/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const socket = io("http://localhost:7000");

const App = () => {
  const [joined, setjoin] = useState(false);
  const [roomID, setroomID] = useState("");
  const [username, setusername] = useState("");
  const [language, setlanguage] = useState("javascript");
  const [code, setcode] = useState("");
  const [users, setusers] = useState([]);
  const [typing, setTyping] = useState("");

  // CODE SYNC
  useEffect(() => {
    const handler = (code) => {   
      setcode(code); 
    };

    socket.on("codeUpdate", handler);

    return () => socket.off("codeUpdate", handler);
  }, []);

  // USERS SYNC
  useEffect(() => {
    const handler = (users) => {
      setusers(users || []);
    };
    socket.on("user-joined", handler);
    return () => socket.off("user-joined", handler);
  }, []);

  // Typing useeffect
 useEffect(() => {
  let timeout;

  const handler = (userName) => {
    if (!userName) return;

    setTyping(`${userName} is typing`);

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      setTyping("");
    }, 1200);
  };

  socket.on("userTyping", handler);

  return () => {
    socket.off("userTyping", handler);
    clearTimeout(timeout);
  };
}, []);  
  

// leave room handler 
const leaveRoomHandler = () => {
  socket.emit("leave-room", {
    roomID,
    userName: username,
  });

  setjoin(false);
  setroomID("");
  setusername("");
  setcode("");
  setusers([]);
  setTyping(""); 

  toast.success("Left room successfully");
}; 


  // JOIN ROOM
  const joinRoomHandler = () => {
    if (roomID && username) {
      socket.emit("join", {
        roomID,
        userName: username, 
      });
      setjoin(true);
    }
  };

  // COPY ROOM ID
  const copyRoomID = () => {
    navigator.clipboard.writeText(roomID);
    toast.success("Room ID copied successfully!");
  };

  // CODE CHANGE
  const codehandler = (newcode) => {
    setcode(newcode);
    socket.emit("codeChange", {
      roomID,
      code: newcode,
    });
    socket.emit("typing", { roomID, userName: username });
  };

  // JOIN SCREEN
  if (!joined) {
    return (
      <div className="join-wrapper">
        <div className="bg-aurora"></div>

        <div className="join-card">
          <h1>Enter the Room</h1>
          <p className="tagline">Where ideas sync in real time</p>

          <div className="input-group">
            <input
              type="text"
              placeholder="Room ID"
              value={roomID}
              onChange={(e) => setroomID(e.target.value)}
            />
          </div>

          <div className="input-group">
            <input
              type="text"
              placeholder="Your identity"
              value={username}
              onChange={(e) => setusername(e.target.value)}
            />
          </div>

          <button className="enter-btn" onClick={joinRoomHandler}>
            Enter Space
          </button>
        </div>
      </div>
    );
  }

  // EDITOR SCREEN
  return (
    <>
      <ToastContainer />

      <div className="editor-container">
        <div className="sidebar">
          <div className="room-info">
            <h2>Code Room:{roomID}</h2>
            <button onClick={copyRoomID}>Copy ID</button>
          </div>

          <h3>Users in Room</h3>
          <ul>
            {users.filter(Boolean).map((user, index) => (
              <li key={index}>{user || "Anonymous"}</li> 
            ))}
          </ul>

          {/* <p className="typing-indicator">user typing....</p> */}
          {typing && <p className="typing-indicator">{typing}</p>}

          <select
            className="language-class"
            value={language}
            onChange={(e) => setlanguage(e.target.value)}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>

          <button className="leave-room" onClick={leaveRoomHandler}>Leave Room</button>
        </div>

        <div className="editor-wrapper">
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={codehandler}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
            }}
          />
        </div>
      </div>
    </>
  );
};

export default App;
