import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
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
    // Check if user is logged in
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
        body: `username=${encodeURIComponent(
          email
        )}&password=${encodeURIComponent(password)}`,
      });

      if (!response.ok) throw new Error("Login failed");

      const data = await response.json();
      localStorage.setItem("token", data.access_token);

      // Fetch user data
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
      alert("Login failed. Please check your credentials.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  return (
    <div className="app">
      <Navbar user={user} onLogout={handleLogout} />
      <div style={{ padding: "2rem" }}>
        <Routes>
          <Route
            path="/"
            element={<LandingPage onGetStarted={() => navigate("/login")} />}
          />
          <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
          <Route
            path="/properties"
            element={
              user ? (
                <>
                  <PropertyForm user={user} />
                  <PropertyList />
                </>
              ) : (
                <div>Please log in to view properties</div>
              )
            }
          />
          <Route path="/properties/:id" element={<PropertyDetails />} />
        </Routes>
      </div>
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
