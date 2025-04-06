import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import route from "./routes/authRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import setupSocket from "./socket.js";
import messagesRoutes from "./routes/messagesRoutes.js";
import channelRoutes from "./routes/ChannelRoutes.js";
import { all } from "axios";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const databaseURL = process.env.DATABASE_URL;

const allowedOrigins = [
  "https://mern-chat-application-ecru.vercel.app",
  "http://localhost:5173" 
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true
  })
);

app.use("/uploads/profiles", express.static("uploads/profiles"));
app.use("/uploads/files",express.static("uploads/files"))

app.use(cookieParser());
app.use(express.json());

// Correct the route prefix
app.use("/api/auth", route);
app.use("/api/contacts", contactRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/channel", channelRoutes);

const server = app.listen(port, () => {
  console.log(`Server running at PORT: ${port}`);
});

setupSocket(server);

console.log("Connecting to MongoDB...");

// Connect to MongoDB
mongoose
  .connect(databaseURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("DB connected successfully"))
  .catch((err) => {
    console.error("DB connection failed. Error:", err.message);
    process.exit(1);
  });
