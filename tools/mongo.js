// tools/mongo.js
import { MongoClient } from "mongodb";
import { z } from "zod";
import { tool } from "@openai/agents";
import "dotenv/config";

let client;

/**
 * DB connection helper
 * - validates env
 * - lazy connects
 */
async function db() {
  if (!process.env.MONGO_URI) {
    throw new Error(
      "MONGO_URI is not set. Add MONGO_URI to your .env (mongodb+srv://... or mongodb://...)"
    );
  }
  if (!process.env.MONGO_DB_NAME) {
    throw new Error(
      "MONGO_DB_NAME is not set. Add MONGO_DB_NAME to your .env"
    );
  }

  if (!client) {
    client = new MongoClient(process.env.MONGO_URI, { connectTimeoutMS: 10000 });
    await client.connect();
  }
  return client.db(process.env.MONGO_DB_NAME);
}

/**
 * A safe JSON scalar union for values. Using simple scalar union keeps JSON schema valid for OpenAI.
 */
const JSONScalar = z.union([z.string(), z.number(), z.boolean(), z.null()]);

/**
 * A flexible object with scalar values. Using catchall ensures JSON Schema has type: object
 * and additionalProperties of allowed scalar types.
 */
const ScalarObject = z.object({}).catchall(JSONScalar).nullable();

/**
 * A standardized response format used by all tools
 */
function okResponse(op, collection, data = null, message = "") {
  return {
    status: "success",
    operation: op,
    collection,
    data,
    message,
  };
}
function errorResponse(op, collection, message) {
  return {
    status: "error",
    operation: op,
    collection,
    data: null,
    message,
  };
}

/**
 * create_collection: create a named collection if not exists.
 * - parameters are required and explicit
 */
export const createCollection = tool({
  name: "create_collection",
  description:
    "Create a new MongoDB collection. Parameters: { name: string }",
  parameters: z.object({
    name: z.string().min(1).describe("The name of the collection to create."),
  }),
  async execute({ name }) {
    console.log("[tool:create_collection] create:", name);
    try {
      const database = await db();
      // createCollection throws if already exists; ensure existence check
      const existing = await database.listCollections({ name }).hasNext();
      if (!existing) {
        await database.createCollection(name);
        return okResponse("create", name, null, `Collection '${name}' created.`);
      } else {
        return okResponse("create", name, null, `Collection '${name}' already exists.`);
      }
    } catch (err) {
      console.error("[create_collection] error:", err);
      return errorResponse("create", name, `Failed to create collection: ${err.message}`);
    }
  },
});

/**
 * insert_one: insert a flat scalar-valued document
 * - document must be provided (required)
 */
export const insertOne = tool({
  name: "insert_one",
  description:
    "Insert a document into a MongoDB collection. Provide a flat key/value JSON document (scalars only).",
  parameters: z.object({
    collection: z.string().min(1),
    document: ScalarObject.describe("A flat JSON document with scalar values."),
  }),
  async execute({ collection, document }) {
    console.log("[tool:insert_one] collection:", collection, "document:", document);
    try {
      const database = await db();
      // auto-create collection if needed
      const colExists = await database.listCollections({ name: collection }).hasNext();
      if (!colExists) {
        await database.createCollection(collection);
      }
      const result = await database.collection(collection).insertOne(document);
      return okResponse("insert", collection, { insertedId: result.insertedId }, "Document inserted.");
    } catch (err) {
      console.error("[insert_one] error:", err);
      return errorResponse("insert", collection, `Insert failed: ${err.message}`);
    }
  },
});

/**
 * find_documents: query with nullable flat filters
 * - query: nullable - default null -> match all
 */
export const findDocuments = tool({
  name: "find_documents",
  description:
    "Find documents in a collection. Use a flat key/value filter (scalars). If query is null, all documents are returned.",
  parameters: z.object({
    collection: z.string().min(1),
    query: ScalarObject.default(null).describe("Flat filter object or null for all documents."),
    limit: z.number().int().positive().max(1000).nullable().describe("Optional limit on returned documents (default none)."),
  }),
  async execute({ collection, query, limit }) {
    console.log("[tool:find_documents] collection:", collection, "query:", query, "limit:", limit);
    try {
      const database = await db();
      const col = database.collection(collection);
      // If collection doesn't exist — return empty result but not an exception
      const exists = await database.listCollections({ name: collection }).hasNext();
      if (!exists) {
        return okResponse("find", collection, [], `Collection '${collection}' does not exist.`);
      }
      const cursor = col.find(query ?? {});
      if (limit) cursor.limit(limit);
      const results = await cursor.toArray();
      return okResponse("find", collection, results, `${results.length} documents found.`);
    } catch (err) {
      console.error("[find_documents] error:", err);
      return errorResponse("find", collection, `Find failed: ${err.message}`);
    }
  },
});

/**
 * update_one: update first matching document
 * - filter & update are required and must be scalar-objects
 */
export const updateOne = tool({
  name: "update_one",
  description: "Update a document in a collection using a filter.",
  parameters: z.object({
    collection: z.string(),
    filter: JSONScalar.describe("Filter: key/value fields"),
    update: JSONScalar.describe("Fields to update (flat key/value fields)"),
  }),
  async execute({ collection, filter, update }) {
    try {
      const database = await db();
      
      // ✔ ALWAYS wrap update inside $set
      const mongoUpdate = { $set: update };

      const result = await database.collection(collection).updateOne(filter, mongoUpdate);

      return {
        status: "success",
        operation: "update_one",
        collection,
        data: {
          matched: result.matchedCount,
          modified: result.modifiedCount,
        },
      };
    } catch (err) {
      return {
        status: "error",
        operation: "update_one",
        collection,
        message: err.message,
      };
    }
  },
});

/**
 * delete_one: delete first matching document
 */
export const deleteOne = tool({
  name: "delete_one",
  description: "Delete one document matching the filter.",
  parameters: z.object({
    collection: z.string().min(1),
    filter: ScalarObject.describe("Filter object to match the doc to delete."),
  }),
  async execute({ collection, filter }) {
    console.log("[tool:delete_one] collection:", collection, "filter:", filter);
    try {
      const database = await db();
      const result = await database.collection(collection).deleteOne(filter);
      return okResponse("delete", collection, { deleted: result.deletedCount }, "Delete executed.");
    } catch (err) {
      console.error("[delete_one] error:", err);
      return errorResponse("delete", collection, `Delete failed: ${err.message}`);
    }
  },
});
