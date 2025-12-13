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
// POST /auth/token
// User provides Mongo Provider + URI → returns service token
// -----------------------------------------------------
app.post("/auth/token", authMiddleware, async (req, res) => {
  const { provider, mongoUri, dbName } = req.body;

  if (!provider || !mongoUri)
    return res.status(400).json({
      error: "provider and mongoUri are required to generate service token.",
    });

  const serviceToken = generateJwt(
    {
      email: req.user.email,
      userId: req.user.id,
      mongo: {
        provider,
        uri: mongoUri,
        db: dbName || "default_db",
      },
    },
    "30d"
  );

  res.json({ success: true, serviceToken });
});

// -----------------------------------------------------
// MONGO AGENT ENDPOINT
// Requires: Authorization: Bearer <serviceToken>
// -----------------------------------------------------
app.post("/mongo", async (req, res) => {
  try {
    const header = req.headers.authorization;

    if (!header)
      return res.status(401).json({ error: "Missing Authorization header." });

    const token = header.split(" ")[1];
    const userData = jwt.verify(token, process.env.JWT_SECRET);

    if (!userData.mongo)
      return res.status(400).json({
        error: "This is not a valid service token. Generate one via /auth/token.",
      });

    const { prompt } = req.body;
    if (!prompt)
      return res.status(400).json({
        error: "Missing prompt. Provide { prompt: \"...\" }",
      });

    console.log("📩 Mongo Prompt:", prompt);
    console.log("🔗 Using MongoDB:", userData.mongo.uri);

    // Simple MongoDB interaction example
    try {
      const userClient = new MongoClient(userData.mongo.uri);
      await userClient.connect();
      const db = userClient.db(userData.mongo.db);

      // Example: List collections
      const collections = await db.listCollections().toArray();
      const collectionNames = collections.map(col => col.name);

      // Simple response based on common queries
      let response = `Connected to database: ${userData.mongo.db}\n`;
      response += `Available collections: ${collectionNames.join(', ')}\n\n`;

      console.log("📩 Mongo Prompt:", prompt);

      // Create a dynamic agent for this request using the user's database connection
      const mongoAgent = createMongoAgent(db);
      const result = await run(mongoAgent, prompt);

      await userClient.close();

      res.json({
        success: true,
        prompt,
        finalOutput: result.finalOutput,
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
