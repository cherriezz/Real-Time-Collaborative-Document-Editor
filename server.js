const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

mongoose.connect("mongodb://localhost:27017/docsDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Document = mongoose.model("Document", new mongoose.Schema({
  content: String,
}));

app.use(cors());
app.use(express.json());

app.get("/documents/:id", async (req, res) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) return res.status(404).send("Document not found");
  res.json(doc);
});

app.post("/documents", async (req, res) => {
  const newDoc = await Document.create({ content: "" });
  res.json(newDoc);
});

io.on("connection", (socket) => {
  socket.on("join", async (docId) => {
    socket.join(docId);
    const doc = await Document.findById(docId);
    socket.emit("loadDocument", doc?.content || "");
  });

  socket.on("edit", async ({ docId, content }) => {
    await Document.findByIdAndUpdate(docId, { content });
    socket.to(docId).emit("update", content);
  });
});

server.listen(5000, () => console.log("Server running on port 5000"));
