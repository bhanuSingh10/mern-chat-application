import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import route from "./routes/authRoutes.js";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const databaseURL = process.env.DATABASE_URL;

app.use(
  cors({
    origin: [process.env.ORIGIN],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true
  })
);

app.use("/uploads/profiles", express.static("uploads/profiles"));

app.use(cookieParser());
app.use(express.json());

// Correct the route prefix
app.use("/api/auth", route);

const server = app.listen(port, () => {
  console.log(`Server running at PORT: ${port}`);
});

// Debug database connection URL
// if (!databaseURL) {
//   console.error("DATABASE_URL is not defined in the .env file");
//   process.exit(1);
// }

console.log("Connecting to MongoDB...");

// Connect to MongoDB
mongoose
  .connect(databaseURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("DB connected successfully"))
  .catch((err) => {
    console.error("DB connection failed. Error:", err.message);
    process.exit(1);
  });
