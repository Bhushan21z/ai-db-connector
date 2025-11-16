import { MongoClient, ObjectId } from "mongodb";
import { z } from "zod";
import { tool } from "@openai/agents";
import "dotenv/config";

let client;

async function db() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
  }
  return client.db(process.env.MONGO_DB);
}

async function collectionExists(collectionName) {
  const database = await db();
  const collections = await database.listCollections({ name: collectionName }).toArray();
  return collections.length > 0;
}

// Helper to parse JSON strings in parameters
function parseJSONField(field) {
  if (typeof field === "string") {
    try {
      return JSON.parse(field);
    } catch {
      return field;
    }
  }
  return field;
}

export const listCollections = tool({
  name: "list_collections",
  description: "List all collections in the database. Use this to verify collection names before operations.",
  parameters: z.object({}),
  async execute() {
    console.log("---------------------------------------------------");
    console.log("Listing all collections");
    try {
      const database = await db();
      const collections = await database.listCollections().toArray();
      const names = collections.map((c) => c.name);
      return {
        status: "success",
        operation: "list_collections",
        data: names,
        message: `Found ${names.length} collection(s): ${names.join(", ") || "none"}`,
      };
    } catch (err) {
      console.error("❌ List collections error:", err);
      return {
        status: "error",
        operation: "list_collections",
        data: null,
        message: `Failed to list collections: ${err.message}`,
      };
    }
  },
});

export const createCollection = tool({
  name: "create_collection",
  description: "Create a new MongoDB collection. Check with list_collections first to avoid duplicates.",
  parameters: z.object({
    name: z
      .string()
      .min(1)
      .describe("The name of the collection to create (must be non-empty)."),
  }),
  async execute({ name }) {
    console.log("---------------------------------------------------");
    console.log(`Creating collection: ${name}`);
    try {
      const exists = await collectionExists(name);
      if (exists) {
        return {
          status: "error",
          operation: "create",
          collection: name,
          data: null,
          message: `Collection '${name}' already exists. No action taken.`,
        };
      }

      const database = await db();
      await database.createCollection(name);
      return {
        status: "success",
        operation: "create",
        collection: name,
        data: null,
        message: `Collection '${name}' created successfully.`,
      };
    } catch (err) {
      console.error("❌ Create collection error:", err);
      return {
        status: "error",
        operation: "create",
        collection: name,
        data: null,
        message: `Failed to create collection: ${err.message}`,
      };
    }
  },
});

export const insertOne = tool({
  name: "insert_one",
  description: "Insert a document into a MongoDB collection. Collection must exist first. Pass document as JSON string or object.",
  parameters: z.object({
    collection: z.string().min(1).describe("The name of the collection."),
    document: z
      .string()
      .describe("A JSON string representing the document to insert. Example: '{\"name\":\"John\",\"age\":30}'"),
  }),
  async execute({ collection, document }) {
    console.log("---------------------------------------------------");
    console.log(`Inserting document into collection: ${collection}`);
    try {
      const exists = await collectionExists(collection);
      if (!exists) {
        return {
          status: "error",
          operation: "insert",
          collection,
          data: null,
          message: `Collection '${collection}' does not exist. Create it first using create_collection.`,
        };
      }

      const parsedDoc = parseJSONField(document);
      const database = await db();
      const result = await database.collection(collection).insertOne(parsedDoc);
      
      return {
        status: "success",
        operation: "insert",
        collection,
        data: {
          insertedId: result.insertedId.toString(),
          document: { _id: result.insertedId, ...parsedDoc },
        },
        message: `Document inserted successfully with ID: ${result.insertedId}`,
      };
    } catch (err) {
      console.error("❌ Insert error:", err);
      return {
        status: "error",
        operation: "insert",
        collection,
        data: null,
        message: `Failed to insert document: ${err.message}`,
      };
    }
  },
});

export const findDocuments = tool({
  name: "find_documents",
  description: "Find documents in a collection. Pass query as JSON string. Use '{}' for all documents. Supports MongoDB operators like $gt, $lt, $in, etc.",
  parameters: z.object({
    collection: z.string().min(1).describe("The name of the collection."),
    query: z
      .string()
      .default("{}")
      .describe(
        "MongoDB filter query as JSON string. Examples: '{\"name\":\"John\"}', '{\"age\":{\"$gt\":25}}', '{\"_id\":\"507f1f77bcf86cd799439011\"}'. Use '{}' for all documents."
      ),
    limit: z
      .number()
      .int()
      .positive()
      .max(1000)
      .optional()
      .default(100)
      .describe("Maximum number of documents to return (default: 100, max: 1000)."),
  }),
  async execute({ collection, query, limit }) {
    console.log("---------------------------------------------------");
    console.log(`Finding documents in collection: ${collection} with query:`, query);
    try {
      const exists = await collectionExists(collection);
      if (!exists) {
        return {
          status: "error",
          operation: "find",
          collection,
          data: null,
          message: `Collection '${collection}' does not exist. Available collections can be checked with list_collections.`,
        };
      }

      // Parse query string to object
      let parsedQuery = {};
      try {
        parsedQuery = JSON.parse(query);
      } catch (e) {
        return {
          status: "error",
          operation: "find",
          collection,
          data: null,
          message: `Invalid query JSON format: ${e.message}`,
        };
      }

      // Handle _id query with ObjectId conversion
      if (parsedQuery._id && typeof parsedQuery._id === "string") {
        try {
          parsedQuery._id = new ObjectId(parsedQuery._id);
        } catch (e) {
          return {
            status: "error",
            operation: "find",
            collection,
            data: null,
            message: `Invalid ObjectId format: ${parsedQuery._id}`,
          };
        }
      }

      const database = await db();
      const results = await database
        .collection(collection)
        .find(parsedQuery)
        .limit(limit)
        .toArray();

      // Convert ObjectId to string for JSON serialization
      const serializedResults = results.map((doc) => ({
        ...doc,
        _id: doc._id.toString(),
      }));

      return {
        status: "success",
        operation: "find",
        collection,
        data: serializedResults,
        count: serializedResults.length,
        message: `Found ${serializedResults.length} document(s)${serializedResults.length === limit ? ` (limited to ${limit})` : ""}.`,
      };
    } catch (err) {
      console.error("❌ MongoDB find error:", err);
      return {
        status: "error",
        operation: "find",
        collection,
        data: null,
        message: `Failed to retrieve data from '${collection}': ${err.message}`,
      };
    }
  },
});

export const updateOne = tool({
  name: "update_one",
  description: "Update a single document in a collection. IMPORTANT: Use find_documents first to verify which document will be updated. Pass filter and update as JSON strings.",
  parameters: z.object({
    collection: z.string().min(1).describe("The name of the collection."),
    filter: z
      .string()
      .describe("Filter to match the document as JSON string. Example: '{\"_id\":\"507f1f77bcf86cd799439011\"}' or '{\"name\":\"John\"}'"),
    update: z
      .string()
      .describe("Fields to update with new values as JSON string. Example: '{\"age\":31,\"city\":\"NYC\"}'"),
  }),
  async execute({ collection, filter, update }) {
    console.log("---------------------------------------------------");
    console.log(`Updating document in collection: ${collection}`);
    try {
      const exists = await collectionExists(collection);
      if (!exists) {
        return {
          status: "error",
          operation: "update",
          collection,
          data: null,
          message: `Collection '${collection}' does not exist.`,
        };
      }

      // Parse filter and update strings
      let parsedFilter, parsedUpdate;
      try {
        parsedFilter = JSON.parse(filter);
        parsedUpdate = JSON.parse(update);
      } catch (e) {
        return {
          status: "error",
          operation: "update",
          collection,
          data: null,
          message: `Invalid JSON format: ${e.message}`,
        };
      }

      // Handle _id filter with ObjectId conversion
      if (parsedFilter._id && typeof parsedFilter._id === "string") {
        try {
          parsedFilter._id = new ObjectId(parsedFilter._id);
        } catch (e) {
          return {
            status: "error",
            operation: "update",
            collection,
            data: null,
            message: `Invalid ObjectId format in filter: ${parsedFilter._id}`,
          };
        }
      }

      const database = await db();
      
      // First, find the document to show what will be updated
      const existingDoc = await database.collection(collection).findOne(parsedFilter);
      
      if (!existingDoc) {
        return {
          status: "error",
          operation: "update",
          collection,
          data: { matched: 0, modified: 0 },
          message: "No document matches the filter. Update aborted.",
        };
      }

      const result = await database
        .collection(collection)
        .updateOne(parsedFilter, { $set: parsedUpdate });

      return {
        status: "success",
        operation: "update",
        collection,
        data: {
          matched: result.matchedCount,
          modified: result.modifiedCount,
          documentId: existingDoc._id.toString(),
          updatedFields: Object.keys(parsedUpdate),
        },
        message: `Updated ${result.modifiedCount} document(s). Matched: ${result.matchedCount}`,
      };
    } catch (err) {
      console.error("❌ Update error:", err);
      return {
        status: "error",
        operation: "update",
        collection,
        data: null,
        message: `Failed to update document: ${err.message}`,
      };
    }
  },
});

export const deleteOne = tool({
  name: "delete_one",
  description: "Delete a single document from a collection. IMPORTANT: Use find_documents first to verify which document will be deleted. Pass filter as JSON string.",
  parameters: z.object({
    collection: z.string().min(1).describe("The name of the collection."),
    filter: z
      .string()
      .describe("Filter to match the document as JSON string. Example: '{\"_id\":\"507f1f77bcf86cd799439011\"}' or '{\"email\":\"user@example.com\"}'"),
  }),
  async execute({ collection, filter }) {
    console.log("---------------------------------------------------");
    console.log(`Deleting document from collection: ${collection}`);
    try {
      const exists = await collectionExists(collection);
      if (!exists) {
        return {
          status: "error",
          operation: "delete",
          collection,
          data: null,
          message: `Collection '${collection}' does not exist.`,
        };
      }

      // Parse filter string
      let parsedFilter;
      try {
        parsedFilter = JSON.parse(filter);
      } catch (e) {
        return {
          status: "error",
          operation: "delete",
          collection,
          data: null,
          message: `Invalid filter JSON format: ${e.message}`,
        };
      }

      // Handle _id filter with ObjectId conversion
      if (parsedFilter._id && typeof parsedFilter._id === "string") {
        try {
          parsedFilter._id = new ObjectId(parsedFilter._id);
        } catch (e) {
          return {
            status: "error",
            operation: "delete",
            collection,
            data: null,
            message: `Invalid ObjectId format in filter: ${parsedFilter._id}`,
          };
        }
      }

      const database = await db();
      
      // First, find the document to show what will be deleted
      const existingDoc = await database.collection(collection).findOne(parsedFilter);
      
      if (!existingDoc) {
        return {
          status: "error",
          operation: "delete",
          collection,
          data: { deleted: 0 },
          message: "No document matches the filter. Delete aborted.",
        };
      }

      const result = await database.collection(collection).deleteOne(parsedFilter);

      return {
        status: "success",
        operation: "delete",
        collection,
        data: {
          deleted: result.deletedCount,
          deletedDocumentId: existingDoc._id.toString(),
        },
        message: `Deleted ${result.deletedCount} document(s).`,
      };
    } catch (err) {
      console.error("❌ Delete error:", err);
      return {
        status: "error",
        operation: "delete",
        collection,
        data: null,
        message: `Failed to delete document: ${err.message}`,
      };
    }
  },
});
