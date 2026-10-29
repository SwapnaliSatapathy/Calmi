import express from "express";
import "dotenv/config";
import connectDB from "./config/connectionDB.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Routes
import userRouter from "./routes/user.routes.js";
import chatRoutes from "./routes/chat.routes.js";

const PORT = process.env.PORT || 5004;
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5004", // adjust if frontend runs on a different port
    credentials: true,
  })
);

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Frontend folder
const frontendPath = path.join(__dirname, "../frontend");

// Serve frontend safely
if (fs.existsSync(path.join(frontendPath, "index.html"))) {
  app.use(express.static(frontendPath));

  // Catch all requests that are NOT API or user routes
  app.get(/^(?!\/(api|users)).*$/, (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
} else {
  console.error(
    "Frontend file not found at:",
    path.join(frontendPath, "index.html")
  );
}

// Backend routes
app.use("/users", userRouter);
app.use("/api", chatRoutes);

// Connect DB & start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });
