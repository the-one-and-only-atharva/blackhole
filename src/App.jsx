import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import PropertyList from "./components/PropertyList";
import PropertyForm from "./components/PropertyForm";
import PropertyDetails from "./components/PropertyDetails";
import LoginForm from "./components/LoginForm";

function AppContent() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:8000/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setUser(data))
        .catch(() => {
          localStorage.removeItem("token");
          setUser(null);
        });
    }
  }, []);

  const handleLogin = async (email, password) => {
    try {
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
      });

      if (!response.ok) throw new Error("Login failed");

      const data = await response.json();
      localStorage.setItem("token", data.access_token);

      const userResponse = await fetch("http://localhost:8000/me", {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      });
      const userData = await userResponse.json();
      setUser(userData);
      navigate("/properties");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please check your credentials.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={handleLogout} />
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="container mx-auto px-4 py-8"
        >
          <Routes>
            <Route path="/" element={<LandingPage onGetStarted={() => navigate("/login")} />} />
            <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
            <Route
              path="/properties"
              element={
                user ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <PropertyForm user={user} />
                    <PropertyList />
                  </motion.div>
                ) : (
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Please log in to view properties</h2>
                    <button
                      onClick={() => navigate("/login")}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Go to Login
                    </button>
                  </div>
                )
              }
            />
            <Route path="/properties/:id" element={<PropertyDetails />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
      <Toaster position="top-right" />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}