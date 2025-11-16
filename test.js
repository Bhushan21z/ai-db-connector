// test.js
import "dotenv/config";
import { run } from "@openai/agents";
import { mongoAgent } from "./agent.js";

// Examples you can try:
// "Create collection users"
// "Insert into users { name: 'Bhushan', email: 'bhushan@gmail.com', type: 'student' }"
// "Find all documents in users"
// "Find users where email is bhushan@gmail.com"
// "Update a user where name is Bhushan set { type: 'alumni' }"
// "Delete from users where name is Bhushan"

async function tryPrompt(prompt) {
  console.log("PROMPT:", prompt);
  const result = await run(mongoAgent, prompt, { timeout: 120000 });
  // run returns a complex object; finalOutput is where the agent's final text output lives
  console.log("FINAL OUTPUT:\n", result.finalOutput);
  // If you want the structured tool output, it is usually in result.toolCalls or the agent's final message;
  // but printing finalOutput is the simplest immediate view.
}

(async () => {
  // quick test: adjust prompt to your use
  // await tryPrompt("Create collection schools");
  // await tryPrompt("Insert into schools name ABC School, location New York");
  await tryPrompt("Find all documents in schools");
  // update example:
  // await tryPrompt("Update one in schools where name is ABC School set location to Los Angeles");
  // await tryPrompt("Find all documents in schools");
  // delete example:
  // await tryPrompt("Delete from schools where name is ABC School");
})();
