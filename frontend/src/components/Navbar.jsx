import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Navbar({ user, onLogout }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
  };

  return (
    <nav
      className="bg-[#0a0a0a] border-b border-gray-800 px-8 py-4 shine-effect"
      onMouseMove={handleMouseMove}
      style={{
        "--mouse-x": `${mousePosition.x}px`,
        "--mouse-y": `${mousePosition.y}px`,
      }}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center relative z-10">
        <Link
          to="/"
          className="text-2xl font-bold text-white hover:text-cyan-400 transition-colors duration-300"
        >
          Smart Property Agent
        </Link>

        <div className="flex items-center space-x-8">
          <Link
            to="/"
            className="relative text-gray-400 hover:text-cyan-400 transition-colors duration-300 group"
          >
            Home
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link
            to="/properties"
            className="relative text-gray-400 hover:text-cyan-400 transition-colors duration-300 group"
          >
            Properties
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="relative text-gray-400 hover:text-cyan-400 transition-colors duration-300 group"
              >
                Dashboard
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <span className="relative group text-cyan-400 font-medium px-4 py-1.5 rounded-full bg-gray-800/50 border border-gray-700 overflow-hidden">
                <span className="relative z-10 group-hover:text-black transition-colors duration-300">
                  Welcome, {user.name || user.email}
                </span>
                <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
              </span>
              <button
                onClick={onLogout}
                className="relative group bg-transparent border-2 border-cyan-400 text-cyan-400 px-4 py-1 rounded-md text-sm font-medium overflow-hidden transition-all duration-300 hover:bg-cyan-400 hover:text-black cursor-pointer"
              >
                <span className="relative z-10">Logout</span>
                <div className="absolute inset-0 bg-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="relative group bg-transparent border-2 border-cyan-400 text-cyan-400 px-4 py-1 rounded-md text-sm font-medium overflow-hidden transition-all duration-300 hover:bg-cyan-400 hover:text-black cursor-pointer"
            >
              <span className="relative z-10">Login</span>
              <div className="absolute inset-0 bg-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
