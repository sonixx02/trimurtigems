import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import fs from 'fs';
import diamondRoutes from "./routes/diamondRoutes.js";
import jewelryRoutes from "./routes/jewelryRoutes.js";
import inquiryRoutes from "./routes/inquiryRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: "*",
  credentials: true
}));
app.use(express.json());

// Global Debug Logging
app.use((req, res, next) => {
  const msg = `[Global] ${new Date().toISOString()} ${req.method} ${req.url}\n`;
  console.log(msg.trim());
  try { fs.appendFileSync('debug.log', msg); } catch (e) { }
  next();
});

// Serve static files from the 'uploads' folder
app.use("/uploads", express.static(join(__dirname, "uploads")));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/diamonds", diamondRoutes);
app.use("/api/jewelry", jewelryRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));