import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaUser, FaSpinner } from "react-icons/fa";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const InputField = ({
  icon: Icon,
  type,
  name,
  placeholder,
  value,
  onChange,
  error,
  disabled,
}) => (
  <div className="relative mb-4">
    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
      <Icon className="h-5 w-5 text-gray-400" />
    </div>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`
        w-full pl-12 pr-4 py-3.5 rounded-xl
        bg-gray-800/50 border text-white
        placeholder-gray-400
        focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${error ? "border-red-500" : "border-gray-700"}
      `}
    />
    {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
  </div>
);

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUser(token);
    }
  }, []);

  const fetchUser = async (token) => {
    try {
      const response = await fetch("http://localhost:8000/me", {
        headers: {
          Authorization: token,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        if (onAuth) onAuth(userData);
      } else {
        localStorage.removeItem("token");
        setUser(null);
        if (onAuth) onAuth(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      localStorage.removeItem("token");
      setUser(null);
      if (onAuth) onAuth(null);
    }
  };

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          name: form.name,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMode("login");
        setForm({ email: form.email, password: "", name: "" });
      } else {
        setError(data.detail || "Registration failed");
      }
    } catch (error) {
      setError("Failed to connect to the server");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validate password length
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const formData = new URLSearchParams();
      formData.append("username", form.email);
      formData.append("password", form.password);

      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        const token = `${data.token_type} ${data.access_token}`;
        localStorage.setItem("token", token);
        await fetchUser(token);
      } else {
        // Handle specific error messages from the backend
        if (data.detail === "Incorrect username or password") {
          setError("Incorrect email or password");
        } else if (data.detail === "Could not validate credentials") {
          setError("Invalid email or password format");
        } else {
          setError(data.detail || "Login failed");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Failed to connect to the server");
    } finally {
      setIsLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setUser(null);
    if (onAuth) onAuth(null);
  }

  if (user) {
    return (
      <motion.div
        variants={fadeIn}
        initial="initial"
        animate="animate"
        exit="exit"
        className="bg-gray-900/50 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-gray-800 mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-300">
              <span className="font-semibold">Logged in as:</span> {user.email}
              {user.name && (
                <span className="text-gray-400"> ({user.name})</span>
              )}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors duration-200"
          >
            Logout
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      exit="exit"
      className="bg-gray-900/50 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-gray-800 mb-6"
    >
      <div className="flex space-x-4 mb-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setMode("login")}
          disabled={mode === "login"}
          className={`flex-1 py-2 rounded-xl font-semibold transition-colors duration-200 ${
            mode === "login"
              ? "bg-gray-700 text-gray-300 cursor-not-allowed"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          Login
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setMode("register")}
          disabled={mode === "register"}
          className={`flex-1 py-2 rounded-xl font-semibold transition-colors duration-200 ${
            mode === "register"
              ? "bg-gray-700 text-gray-300 cursor-not-allowed"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          Register
        </motion.button>
      </div>

      {mode === "register" ? (
        <form onSubmit={handleRegister} className="space-y-4">
          <InputField
            icon={FaEnvelope}
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            error={error}
            disabled={isLoading}
          />
          <InputField
            icon={FaUser}
            type="text"
            name="name"
            placeholder="Name (optional)"
            value={form.name}
            onChange={handleChange}
            disabled={isLoading}
          />
          <InputField
            icon={FaLock}
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            error={error}
            disabled={isLoading}
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-gray-700 to-gray-800 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <FaSpinner className="w-5 h-5 animate-spin mr-2" />
                Registering...
              </div>
            ) : (
              "Register"
            )}
          </motion.button>
        </form>
      ) : (
        <form onSubmit={handleLogin} className="space-y-4">
          <InputField
            icon={FaEnvelope}
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            error={error}
            disabled={isLoading}
          />
          <InputField
            icon={FaLock}
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            error={error}
            disabled={isLoading}
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-gray-700 to-gray-800 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <FaSpinner className="w-5 h-5 animate-spin mr-2" />
                Signing in...
              </div>
            ) : (
              "Login"
            )}
          </motion.button>
        </form>
      )}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-sm text-red-500 text-center"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}
