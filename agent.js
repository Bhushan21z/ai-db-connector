// agent.js
import { Agent } from "@openai/agents";
import {
  createCollection,
  insertOne,
  findDocuments,
  updateOne,
  deleteOne,
} from "./tools/mongo.js";

/**
 * Instructions:
 * - The agent MUST call the appropriate tool with the exact parameter names.
 * - Always prefer a single tool call that accomplishes the user's intent (do not call multiple tools if one is sufficient).
 * - All responses should be the final tool output in JSON form (the agent should not add extra freeform text).
 * - If ambiguous (missing collection name, or missing fields), ask a single clarifying question.
 */
export const mongoAgent = new Agent({
  name: "MongoDB Agent",
  instructions: `
You are an expert MongoDB assistant. The user will give requests about CRUD operations.
Rules:
1) Map user intent to exactly one tool call if possible (create_collection, insert_one, find_documents, update_one, delete_one).
2) Tool parameter names must match schema: collection, document, query, filter, update, limit.
3) If a required parameter is missing (e.g., collection name), ask a short clarifying question (single question).
4) Return the tool's structured JSON result as the final output (do not add extra commentary).
5) Use exact field names and JSON-friendly types only.
6) Do not attempt to infer nested objects (use flat objects with scalar values) unless user explicitly provides valid nested structure.
7) Keep responses concise.
  `,
  model: "gpt-4o-mini", // change to the model you prefer
  tools: [createCollection, insertOne, findDocuments, updateOne, deleteOne],
});
