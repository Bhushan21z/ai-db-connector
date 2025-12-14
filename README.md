# Database AI Agent

**Database AI Agent** is a powerful, secure, and user-friendly application that allows you to interact with your databases using natural language. Powered by OpenAI's advanced language models, it translates your plain English queries into precise database operations.

Currently supports **MongoDB**, with plans for Firestore, MySQL, and PostgreSQL.

![Database AI Agent Dashboard](https://i.ibb.co/BVHBTQYd/Screenshot-from-2025-12-14-19-46-48.png)

## 🚀 Features

-   **Natural Language Queries**: Ask questions like "Find all users who signed up last week" or "Count orders by status" and get instant results.
-   **Full CRUD Support**: Perform Create, Read, Update, and Delete operations seamlessly.
-   **Secure Credentials**: Your database connection strings are encrypted (AES-256) and stored securely in our backend. We never log raw credentials.
-   **API Access**: Generate long-lived Bearer tokens to integrate the AI agent into your own applications or workflows via a simple REST API.
-   **Persistent Chat History**: Your conversation history is saved, allowing you to review past queries and results.
-   **Structured JSON Responses**: The agent returns data in a structured JSON format, making it easy to parse and display.
-   **Premium UI**: A modern, responsive dashboard built with React, Tailwind CSS, and Shadcn UI.

![Connection](https://i.ibb.co/99K8GL0h/Screenshot-from-2025-12-14-19-45-40.png)
![AI Chat](https://i.ibb.co/DPryd0Tc/Screenshot-from-2025-12-14-19-45-25.png)

## 🛠️ Tech Stack

-   **Frontend**: React, Vite, TypeScript, Tailwind CSS, Shadcn UI, Lucide React.
-   **Backend**: Node.js, Express.js.
-   **Database**: MongoDB (for storing user accounts, encrypted configs, and chat history).
-   **AI Engine**: OpenAI Agents SDK (`gpt-4o-mini`).
-   **Authentication**: JWT (JSON Web Tokens).

## 📋 Prerequisites

-   **Node.js** (v18 or higher)
-   **MongoDB**: You need a MongoDB instance for the application's own data (users, history).
-   **OpenAI API Key**: Required for the AI agent functionality.

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Bhushan21z/ai-db-connector.git
cd ai-db-connector
```

### 2. Backend Setup

1.  Navigate to the root directory (if not already there).
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the root directory:
    ```env
    PORT=5000
    MONGO_AUTH_URI=mongodb://localhost:27017 # URI for the app's internal DB
    MONGO_DB_NAME=ai_agent_db            # Name for the app's internal DB
    JWT_SECRET=your_super_secret_jwt_key
    OPENAI_API_KEY=sk-...                # Your OpenAI API Key
    ```
4.  Start the backend server:
    ```bash
    node app.js
    ```
    The server will start on `http://localhost:5000`.

### 3. Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `frontend` directory:
    ```env
    VITE_BACKEND_URL=http://localhost:5000
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```
    The frontend will be available at `http://localhost:5173`.

## 📖 Usage Guide

### 1. Registration & Login
-   Open the frontend application.
-   Sign up for a new account.
-   Log in to access the dashboard.

### 2. Connect Your Database
-   Go to the **Credentials** tab.
-   Select your provider (currently **MongoDB**).
-   Enter your **Connection URI** (e.g., `mongodb+srv://...`).
-   Enter the **Database Name** you want to query.
-   Click **Save & Connect**. Your credentials are encrypted and saved.

### 3. Chat with Your Data
-   Switch to the **AI Chat** tab.
-   Type your request in plain English.
    -   *Example*: "List all collections in the database."
    -   *Example*: "Find the user with email 'test@example.com'."
    -   *Example*: "Update the status of order #123 to 'shipped'."
-   The AI will execute the operation and show you the results in a structured format.

### 4. External API Access
-   Go to the **API Access** tab.
-   Click **Generate API Token**.
-   Copy the token. **Keep it safe!**
-   You can now make requests to the agent from any external tool (like cURL, Postman, or your own app).

#### API Example (cURL)

```bash
curl -X POST http://localhost:5000/mongo \
  -H "Authorization: Bearer <YOUR_API_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Count the number of documents in the users collection"}'
```

**Response:**
```json
{
  "success": true,
  "prompt": "Count the number of documents in the users collection",
  "finalOutput": {
    "operation": "count_documents",
    "collection": "users",
    "affected": 42,
    "status": "Success",
    "data": null
  }
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
