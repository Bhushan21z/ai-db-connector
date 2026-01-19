// app.js
import express from "express";
import cors from "cors";
import "dotenv/config";

// Routes
import authRoutes from "./backend/apis/auth.js";
import userRoutes from "./backend/apis/user.js";
import chatRoutes from "./backend/apis/chat.js";
import agentRoutes from "./backend/apis/agent.js";

// ----------------------------
// Express App Setup
// ----------------------------
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;

// -----------------------------------------------------
// API ROUTES
// -----------------------------------------------------
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/user/chat", chatRoutes);
app.use("/agent", agentRoutes);

// -----------------------------------------------------
app.get("/", (req, res) => {
  res.send("Database AI Agent Server is Running 🚀");
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));
}

export default app;
