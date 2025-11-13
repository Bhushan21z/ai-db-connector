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
  // await tryPrompt("Create collection users");
  // await tryPrompt("Insert into users { name: 'Bhushan', email: 'bhushan@gmail.com', type: 'student' }");
  // await tryPrompt("Find all documents in users");
  // // update example:
  await tryPrompt("Update one in users where name is 'bhu' set { type: 'graduate' }");
  // await tryPrompt("Find users where email is 'bhushan@gmail.com'");
  // delete example:
  // await tryPrompt("Delete from users where name is 'Bhushan'");
})();
