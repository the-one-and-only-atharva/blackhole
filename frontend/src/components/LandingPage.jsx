import React from "react";

export default function LandingPage({ onGetStarted }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-lg p-16 text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Smart Property Agent</h1>
        <p className="text-xl mb-8 opacity-90">
          Secure, verified property listings with blockchain-ready record
          keeping
        </p>
        <button
          onClick={onGetStarted}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-md transition duration-200"
        >
          Get Started
        </button>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8">
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <h3 className="text-xl font-semibold mb-2">Secure Records</h3>
          <p className="text-gray-600">
            Every property change is hashed and logged for verification
          </p>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <h3 className="text-xl font-semibold mb-2">Fraud Detection</h3>
          <p className="text-gray-600">
            Advanced algorithms to detect suspicious listings
          </p>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <h3 className="text-xl font-semibold mb-2">
            Multi-Agent Verification
          </h3>
          <p className="text-gray-600">
            Multiple parties can verify property records
          </p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center py-12 mt-8">
        <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-gray-600 mb-6">
          Join our platform and start listing or searching for properties today
        </p>
        <button
          onClick={onGetStarted}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-md transition duration-200"
        >
          Create Account
        </button>
      </div>
    </div>
  );
}
