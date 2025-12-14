// app.js
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { MongoClient, ObjectId } from "mongodb";
import { createMongoAgent } from "./agent.js";
import { run } from "@openai/agents";
import "dotenv/config";

// ----------------------------
// MongoDB Connection for Auth Users
// ----------------------------
const client = new MongoClient(process.env.MONGO_AUTH_URI);
await client.connect();
const authDB = client.db(process.env.MONGO_DB_NAME);
const usersCollection = authDB.collection("users");

// ----------------------------
// Express App Setup
// ----------------------------
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;

// -----------------------------------------------------
// AUTH HELPERS
// -----------------------------------------------------
const generateJwt = (payload, expires = "7d") =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: expires });

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header)
    return res.status(401).json({ error: "Missing Authorization header." });

  try {
    const token = header.split(" ")[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token." });
  }
};

// -----------------------------------------------------
// POST /auth/register
// -----------------------------------------------------
app.post("/auth/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "email and password are required." });

  const existing = await usersCollection.findOne({ email });
  if (existing)
    return res.status(409).json({ error: "User already exists." });

  const hashedPw = await bcrypt.hash(password, 10);

  const result = await usersCollection.insertOne({
    email,
    password: hashedPw,
    createdAt: new Date(),
  });

  res.json({
    success: true,
    message: "User registered successfully.",
    id: result.insertedId
  });
});

// -----------------------------------------------------
// POST /auth/login
// -----------------------------------------------------
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await usersCollection.findOne({ email });
  if (!user)
    return res.status(404).json({ error: "User not found." });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: "Invalid credentials." });

  const token = generateJwt({ email: user.email, id: user._id.toString() });

  res.json({
    success: true,
    token,
    email: user.email,
    id: user._id.toString()
  });
});

// -----------------------------------------------------
// USER CONFIG ENDPOINTS
// -----------------------------------------------------

// GET /user/config - Retrieve DB credentials
app.get("/user/config", authMiddleware, async (req, res) => {
  try {
    const user = await usersCollection.findOne({ _id: new ObjectId(req.user.id) });
    if (!user) return res.status(404).json({ error: "User not found." });

    res.json({
      success: true,
      config: user.dbConfig || null
    });
  } catch (err) {
    console.error("❌ GET /user/config Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /user/config - Save DB credentials
app.post("/user/config", authMiddleware, async (req, res) => {
  const { provider, uri, dbName } = req.body;

  if (!provider || !uri || !dbName) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    await usersCollection.updateOne(
      { _id: new ObjectId(req.user.id) },
      { $set: { dbConfig: { provider, uri, dbName } } }
    );

    res.json({ success: true, message: "Configuration saved." });
  } catch (err) {
    console.error("❌ POST /user/config Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// -----------------------------------------------------
// CHAT HISTORY ENDPOINTS
// -----------------------------------------------------

// GET /user/chat - Retrieve chat history
app.get("/user/chat", authMiddleware, async (req, res) => {
  try {
    const user = await usersCollection.findOne({ _id: new ObjectId(req.user.id) });
    if (!user) return res.status(404).json({ error: "User not found." });

    res.json({
      success: true,
      history: user.chatHistory || []
    });
  } catch (err) {
    console.error("❌ GET /user/chat Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /user/chat - Clear chat history
app.delete("/user/chat", authMiddleware, async (req, res) => {
  try {
    await usersCollection.updateOne(
      { _id: new ObjectId(req.user.id) },
      { $set: { chatHistory: [] } }
    );
    res.json({ success: true, message: "Chat history cleared." });
  } catch (err) {
    console.error("❌ DELETE /user/chat Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /user/token - Generate long-lived API Token
app.post("/user/token", authMiddleware, async (req, res) => {
  try {
    // Generate a token that never expires (or expires in a very long time, e.g., 1 year)
    const apiToken = generateJwt(
      {
        email: req.user.email,
        id: req.user.id,
        type: "api_token"
      },
      "365d"
    );

    res.json({ success: true, apiToken });
  } catch (err) {
    console.error("❌ POST /user/token Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// -----------------------------------------------------
// MONGO AGENT ENDPOINT
// Requires: Authorization: Bearer <AuthToken>
// -----------------------------------------------------
app.post("/mongo", authMiddleware, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt)
      return res.status(400).json({
        error: "Missing prompt. Provide { prompt: \"...\" }",
      });

    // Fetch user config from DB
    const user = await usersCollection.findOne({ _id: new ObjectId(req.user.id) });
    if (!user || !user.dbConfig) {
      return res.status(400).json({
        error: "Database configuration not found. Please save credentials first.",
      });
    }

    const { uri, dbName } = user.dbConfig;

    console.log("📩 Mongo Prompt:", prompt);
    console.log("🔗 Using MongoDB:", uri);

    // Save User Message to History
    const userMsg = { role: "user", content: prompt, timestamp: Date.now() };
    await usersCollection.updateOne(
      { _id: new ObjectId(req.user.id) },
      { $push: { chatHistory: userMsg } }
    );

    // Simple MongoDB interaction example
    try {
      const userClient = new MongoClient(uri);
      await userClient.connect();
      const db = userClient.db(dbName);

      // Create a dynamic agent for this request using the user's database connection
      const mongoAgent = createMongoAgent(db);
      const result = await run(mongoAgent, prompt);

      await userClient.close();
      console.log("Mongo Agent Result:", result.finalOutput);

      // Try to parse JSON output
      let finalContent = result.finalOutput;
      try {
        // Remove markdown code blocks if present (just in case)
        const cleanOutput = result.finalOutput.replace(/```json\n?|\n?```/g, "").trim();
        finalContent = JSON.parse(cleanOutput);
      } catch (e) {
        console.warn("Failed to parse agent output as JSON, using raw string.");
      }

      // Save Assistant Message to History
      const assistantMsg = {
        role: "assistant",
        content: finalContent,
        timestamp: Date.now()
      };

      await usersCollection.updateOne(
        { _id: new ObjectId(req.user.id) },
        { $push: { chatHistory: assistantMsg } }
      );

      res.json({
        success: true,
        prompt,
        finalOutput: finalContent,
        toolCalls: result.toolCalls
      });

    } catch (dbError) {
      console.error("❌ Database Error:", dbError);
      res.status(500).json({
        success: false,
        error: `Database connection failed: ${dbError.message}`
      });
    }

  } catch (err) {
    console.error("❌ /mongo Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// -----------------------------------------------------
app.get("/", (req, res) => {
  res.send("MongoDB AI Agent Server is Running 🚀");
});

app.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));
