require("dotenv").config();

const http = require("http");
const { WebSocketServer } = require("ws");

const { app, sessionMiddleware } = require("./app");
const connectDB = require("./config/db");
const Message = require("./models/message");

const PORT = process.env.PORT || 3000;

async function startServer() {
  await connectDB();

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });

  const onlineUsers = new Map();

  wss.on("connection", (ws, req) => {
    sessionMiddleware(req, {}, () => {

      if (!req.session || !req.session.userId) {
        console.log("WebSocket rejected: No session");
        ws.close();
        return;
      }

      // 🔥 ALWAYS STORE USER ID AS STRING
      const userId = req.session.userId.toString();

      onlineUsers.set(userId, ws);

      console.log("User connected:", userId);
      console.log("Online users:", Array.from(onlineUsers.keys()));

      ws.on("message", async (message) => {
        try {
          const data = JSON.parse(message);
          const { to, text } = data;

          const receiverId = to.toString();

          console.log("Message from:", userId);
          console.log("Message to:", receiverId);

          // ✅ Save message in DB
          await Message.create({
            sender: userId,
            receiver: receiverId,
            content: text,
          });

          const recipientSocket = onlineUsers.get(receiverId);

          console.log("Recipient online?", !!recipientSocket);

          if (recipientSocket) {
            recipientSocket.send(
              JSON.stringify({
                from: userId,
                text,
              })
            );
          }

        } catch (err) {
          console.error("Message error:", err);
        }
      });

      ws.on("close", () => {
        onlineUsers.delete(userId);
        console.log("User disconnected:", userId);
        console.log("Online users:", Array.from(onlineUsers.keys()));
      });

    });
  });

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();