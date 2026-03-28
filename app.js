const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const postsRoutes = require("./routes/posts");
const commentsRoutes = require("./routes/comments");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const notRoutes = require("./routes/notification");
const chatsRoutes = require("./routes/chats");
const messagesRoutes = require("./routes/messages");
const Message = require("./models/message");
const onlineUsers = new Map();
const app = express();
require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env" : "dev.env",
});

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use("/images", express.static(path.join("images")));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "PUT, POST, GET, PATCH, DELETE",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self';");
  next();
});

// const apiLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
// });
// app.use(apiLimiter);

app.use(postsRoutes);
app.use(commentsRoutes);
app.use(authRoutes);
app.use(userRoutes);
app.use(notRoutes);
app.use(chatsRoutes);
app.use(messagesRoutes);
const PORT = 3000;

mongoose
  .connect(
    `mongodb+srv://srdjanmihic3_db_user:${process.env.MONGO_DB_PW}@cluster0.chkmvbf.mongodb.net/socialMedia`,
  )
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log("server radi");
    });
    const io = require("./socket").init(server);
    io.on("connection", (socket) => {
      socket.on("join", (userId) => {
        socket.join(userId);
      });
      socket.on("join_chat", (chatId) => {
        socket.join(chatId);
      });
      socket.on("messages-seen", async ({ chatId, userId }) => {
        await Message.updateMany(
          { chatId, senderId: { $ne: userId }, isRead: { $ne: true } },
          { $set: { isRead: true } },
        );
        socket.to(chatId).emit("messages-seen", { chatId, userId });
      });
      socket.on("typing", ({ chatId, userId }) => {
        socket.to(chatId).emit("user_typing", { chatId, userId });
      });
      socket.on("stop_typing", ({ chatId, userId }) => {
        socket.to(chatId).emit("user_stop_typing", { chatId, userId });
      });
      socket.on("user_online", (userId) => {
        onlineUsers.set(userId, socket.id);
        io.emit("online_users", Array.from(onlineUsers.keys()));
      });
      socket.on("disconnect", () => {
        for (let [userId, sId] of onlineUsers.entries()) {
          if (sId === socket.id) {
            onlineUsers.delete(userId);
            break;
          }
        }
        io.emit("online_users", Array.from(onlineUsers.keys()));
      });
    });
  })
  .catch((err) => console.log(err));
