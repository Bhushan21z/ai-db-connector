// storage.ts

// ---------------------------
// TYPES
// ---------------------------
export interface User {
  id: string;
  email: string;
  token: string; // Login JWT token
}

export interface DBConfig {
  provider: string; // mongodb, firestore, mysql (future)
  uri: string;
  dbName: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string | any;
  timestamp: number;
}

// ---------------------------
// STORAGE UTILITIES
// ---------------------------
export const storage = {
  // ---------------------------------------------------
  // AUTH USER
  // ---------------------------------------------------
  getUser: (): User | null => {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  setUser: (user: User) => {
    localStorage.setItem("user", JSON.stringify(user));
  },

  removeUser: () => {
    localStorage.removeItem("user");
  },

  // ---------------------------------------------------
  // LOGIN JWT TOKEN
  // ---------------------------------------------------
  getAuthToken: (): string | null => {
    const user = storage.getUser();
    return user ? user.token : null;
  },

  setAuthToken: (token: string) => {
    const user = storage.getUser();
    if (user) {
      user.token = token;
      storage.setUser(user);
    }
  },

  removeAuthToken: () => {
    // Handled by removeUser
  },

  // ---------------------------------------------------
  // CLEAR ALL USER DATA
  // ---------------------------------------------------
  clearAll: () => {
    localStorage.removeItem("user");
  },
};
