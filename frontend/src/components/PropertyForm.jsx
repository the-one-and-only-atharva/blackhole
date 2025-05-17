import React, { useState } from "react";
import { createProperty } from "../api";

export default function PropertyForm({ onCreated }) {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [form, setForm] = useState({
    owner_name: "",
    owner_email: "",
    buyer_intent: "sale",
    location: "",
    verification: "pending",
    terms: "",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      owner: {
        name: form.owner_name,
        email: form.owner_email,
      },
      buyer_intent: form.buyer_intent,
      location: form.location,
      verification: form.verification,
      terms: form.terms,
    };
    await createProperty(payload);
    onCreated();
    setForm({
      owner_name: "",
      owner_email: "",
      buyer_intent: "sale",
      location: "",
      verification: "pending",
      terms: "",
    });
    setIsFormVisible(false);
  }

  return (
    <>
      <button
        onClick={() => setIsFormVisible(true)}
        className="relative group bg-transparent border-2 border-cyan-400 text-cyan-400 py-2 px-4 rounded-md text-sm font-medium overflow-hidden transition-all duration-300 hover:bg-cyan-400 hover:text-black cursor-pointer"
      >
        <span className="relative z-10">Add New Property</span>
        <div className="absolute inset-0 bg-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
      </button>

      {isFormVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-4 max-w-md w-full mx-4 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">
                Add New Property
              </h2>
              <button
                onClick={() => setIsFormVisible(false)}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label
                  htmlFor="owner_name"
                  className="block text-gray-300 font-medium mb-1"
                >
                  Owner Name
                </label>
                <input
                  id="owner_name"
                  name="owner_name"
                  placeholder="Enter owner's name"
                  value={form.owner_name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-[#0a0a0a] border border-gray-800 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors duration-200"
                />
              </div>

              <div>
                <label
                  htmlFor="owner_email"
                  className="block text-gray-300 font-medium mb-1"
                >
                  Owner Email
                </label>
                <input
                  id="owner_email"
                  name="owner_email"
                  type="email"
                  placeholder="Enter owner's email"
                  value={form.owner_email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-[#0a0a0a] border border-gray-800 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors duration-200"
                />
              </div>

              <div>
                <label
                  htmlFor="buyer_intent"
                  className="block text-gray-300 font-medium mb-1"
                >
                  Intent
                </label>
                <select
                  id="buyer_intent"
                  name="buyer_intent"
                  value={form.buyer_intent}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#0a0a0a] border border-gray-800 rounded-md text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors duration-200"
                >
                  <option value="sale">Sale</option>
                  <option value="rent">Rent</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="block text-gray-300 font-medium mb-1"
                >
                  Location
                </label>
                <input
                  id="location"
                  name="location"
                  placeholder="Enter property location"
                  value={form.location}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-[#0a0a0a] border border-gray-800 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors duration-200"
                />
              </div>

              <div>
                <label
                  htmlFor="verification"
                  className="block text-gray-300 font-medium mb-1"
                >
                  Verification Status
                </label>
                <input
                  id="verification"
                  name="verification"
                  placeholder="Enter verification status"
                  value={form.verification}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-[#0a0a0a] border border-gray-800 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors duration-200"
                />
              </div>

              <div>
                <label
                  htmlFor="terms"
                  className="block text-gray-300 font-medium mb-1"
                >
                  Terms
                </label>
                <textarea
                  id="terms"
                  name="terms"
                  placeholder="Enter property terms"
                  value={form.terms}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="w-full px-3 py-2 bg-[#0a0a0a] border border-gray-800 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors duration-200"
                />
              </div>

              <div className="flex justify-end space-x-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsFormVisible(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="relative group bg-transparent border-2 border-cyan-400 text-cyan-400 py-2 px-4 rounded-md text-base font-medium overflow-hidden transition-all duration-300 hover:bg-cyan-400 hover:text-black cursor-pointer"
                >
                  <span className="relative z-10">Add Property</span>
                  <div className="absolute inset-0 bg-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
