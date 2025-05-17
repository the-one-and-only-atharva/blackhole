import React from "react";
import { Link } from "react-router-dom";

export default function Navbar({ user, onLogout }) {
  return (
    <nav className="bg-white shadow-md px-8 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-gray-800">
          Smart Property Agent
        </Link>

        <div className="flex items-center space-x-8">
          <Link to="/" className="text-gray-600 hover:text-gray-900">
            Home
          </Link>
          <Link to="/properties" className="text-gray-600 hover:text-gray-900">
            Properties
          </Link>
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <span className="text-gray-600">
                Welcome, {user.name || user.email}
              </span>
              <button
                onClick={onLogout}
                className="text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="text-blue-600 hover:text-blue-800">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
