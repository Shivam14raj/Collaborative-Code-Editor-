# 🚀 Real-Time Collaborative Code Editor

A real-time collaborative code editor built using **React, Node.js, Express, Socket.io, and Monaco Editor**.  
It allows multiple users to join a shared room and write code together in real time.

---

## ✨ Features

- 🔗 Join or create rooms using Room ID  
- 👥 Real-time user list in each room  
- 💻 Live collaborative code editing  
- ⚡ Instant synchronization across all users  
- 🧑‍💻 Monaco Editor with syntax highlighting  
- 🗣️ Live typing indicator  
- 📋 Copy Room ID feature  
- 🚪 Leave room functionality  
- 🔔 Toast notifications for actions  
- 🎨 Dark-themed modern UI  

---

## 🛠️ Tech Stack

**Frontend:**
- React.js
- Monaco Editor
- Socket.io-client
- React Toastify
- CSS

**Backend:**
- Node.js
- Express.js
- Socket.io

--- 
## 📁 Project Structure 
project-root/
│
├── client/ # React frontend
│ ├── src/
│ └── App.jsx
│
├── server/ # Node + Socket.io backend
│ ├── index.js
│ └── .env
│
├── .gitignore
└── README.md 

--- 
## 🚀 How it works
Users enter a Room ID and join a session
Socket.io connects all users in the same room
Code changes are broadcast in real time
Server maintains active users per room
Typing and user join/leave events are synced 

---
## 📌 Future Improvements
Authentication system (login/signup)
Save code to database
Multi-file support
Chat inside rooms
Code execution (JS/Python runner)
Cursor tracking per user

---
## 📄 License

This project is licensed under the MIT License.




## 📁 Project Structure
 
