import React, { useState, useEffect } from "react";
import { register, login, getCurrentUser } from "../api";

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getCurrentUser(token).then((u) => {
        if (!u.detail) setUser(u);
      });
    }
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    const res = await register(form);
    if (res.id) {
      setMode("login");
      setForm({ email: form.email, password: "", name: "" });
    } else {
      setError(res.detail || "Registration failed");
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    const res = await login(form);
    if (res.access_token) {
      localStorage.setItem("token", res.access_token);
      const u = await getCurrentUser(res.access_token);
      setUser(u);
      if (onAuth) onAuth(u);
    } else {
      setError(res.detail || "Login failed");
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setUser(null);
    if (onAuth) onAuth(null);
  }

  if (user) {
    return (
      <div style={{ marginBottom: 20 }}>
        <b>Logged in as:</b> {user.email} {user.name && `(${user.name})`}{" "}
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <div>
        <button onClick={() => setMode("login")} disabled={mode === "login"}>
          Login
        </button>
        <button
          onClick={() => setMode("register")}
          disabled={mode === "register"}
        >
          Register
        </button>
      </div>
      {mode === "register" ? (
        <form onSubmit={handleRegister}>
          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            name="name"
            placeholder="Name (optional)"
            value={form.name}
            onChange={handleChange}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Register</button>
        </form>
      ) : (
        <form onSubmit={handleLogin}>
          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Login</button>
        </form>
      )}
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}
