import express from "express";
import cors from "cors";
import { run } from "@openai/agents";
import { mongoAgent } from "./agent.js";   // your working Mongo agent
import "dotenv/config";

const app = express();
app.use(cors());
app.use(express.json());           // for JSON body
app.use(express.urlencoded({ extended: true })); // for form POST
const PORT = process.env.PORT || 3000;

/**
 * POST /mongo
 * Accepts:
 *   - req.body.prompt
 *   - OR req.query.prompt
 *   - OR req.body = { collection, filter, update }  (later for direct calls)
 *
 * Example:
 *   POST /mongo?prompt=insert into users name Bhushan, type student
 */
app.post("/mongo", async (req, res) => {
  try {
    // Accept prompt from either query or body
    const prompt =
      req.body.prompt ||
      req.query.prompt ||
      req.body.text ||
      null;

    if (!prompt) {
      return res.status(400).json({
        error: "Missing prompt. Send { prompt: \"your instruction\" }"
      });
    }

    console.log("📩 Incoming Prompt:", prompt);

    // Run your AI Agent
    const result = await run(mongoAgent, prompt);

    res.json({
      success: true,
      prompt,
      finalOutput: result.finalOutput,
      toolCalls: result.toolCalls,
    });

  } catch (err) {
    console.error("❌ Server Error:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

app.get("/", (req, res) => {
  res.send("MongoDB AI Agent Server is Running 🚀");
});

app.listen(PORT, () => {
  console.log(`🔥 Server listening on port ${PORT}`);
});
