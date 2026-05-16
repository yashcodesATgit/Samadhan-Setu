import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEMO_ACCOUNTS } from "@/lib/mockData";

// ============================================================
// AuthContext.jsx — NO BACKEND VERSION
// User login/logout is handled purely in the browser.
// User info is saved in localStorage so it persists on refresh.
// ============================================================

const AuthContext = createContext(undefined);

// The key used to store the logged-in user in localStorage
const USER_KEY = "samadhaan_user";

// ──────────────────────────────────────────────────────────────
// AuthProvider
// Wrap the whole app with this. It provides:
//   user    - the currently logged-in user (or null if not logged in)
//   loading - true while checking localStorage on page load
//   login   - function to log in
//   logout  - function to log out
// ──────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On page load, check if a user was already saved in localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch {
      // If localStorage data is corrupted, just ignore it
    }
    setLoading(false);
  }, []);

  // ──────────────────────────────────────────────────────────
  // login function
  // Accepts { email, password, role }
  // Any email/password works — role is guessed from the email.
  // You can also use the demo accounts in mockData.js.
  // ──────────────────────────────────────────────────────────
  const login = async ({ email, password, role }) => {
    setLoading(true);

    // Small delay to simulate a network request (makes the UI feel more realistic)
    await new Promise((r) => setTimeout(r, 500));

    // Check if the email matches a demo account
    const demo = DEMO_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );

    let loggedInUser;

    if (demo) {
      // Use the demo account details
      loggedInUser = {
        id: `user-${demo.email}`,
        name: demo.name,
        email: demo.email,
        role: demo.role,
      };
    } else {
      // Allow ANY email/password combination — no real validation
      // Just guess the role from the email (if it contains "admin" → admin)
      const guessedRole = role || (email.toLowerCase().includes("admin") ? "admin" : "citizen");
      const guessedName = email.split("@")[0]; // use the part before @ as the name

      loggedInUser = {
        id: `user-${Date.now()}`,
        name: guessedName,
        email: email,
        role: guessedRole,
      };
    }

    // Save to localStorage so user stays logged in after page refresh
    localStorage.setItem(USER_KEY, JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    setLoading(false);
  };

  // ──────────────────────────────────────────────────────────
  // logout function — clears the user from localStorage
  // ──────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  // useMemo ensures we don't create a new object on every render
  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ──────────────────────────────────────────────────────────────
// useAuth hook
// Use this in any component: const { user, login, logout } = useAuth();
// ──────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
