import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000");

const App = () => {
  const [docId, setDocId] = useState("");
  const [content, setContent] = useState("");

  const loadDocument = async (id) => {
    setDocId(id);
    socket.emit("join", id);
    const res = await axios.get(`http://localhost:5000/documents/${id}`);
    setContent(res.data.content);
  };

  useEffect(() => {
    socket.on("loadDocument", (data) => setContent(data));
    socket.on("update", (data) => setContent(data));
  }, []);

  const handleChange = (e) => {
    setContent(e.target.value);
    socket.emit("edit", { docId, content: e.target.value });
  };

  return (
    <div>
      <h2>Real-Time Collaborative Editor</h2>
      <input placeholder="Document ID" onBlur={(e) => loadDocument(e.target.value)} />
      <textarea value={content} onChange={handleChange} rows="10" cols="50"></textarea>
    </div>
  );
};

export default App;
