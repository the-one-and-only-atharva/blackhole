import React, { useState } from "react";

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
      <div className="max-w-md w-full bg-[#1a1a1a] rounded-xl border border-gray-800 p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-400">Please sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-gray-300 font-medium mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-800 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors duration-200"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-gray-300 font-medium mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-800 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors duration-200"
              placeholder="Enter your password"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-800 bg-[#0a0a0a] text-cyan-400 focus:ring-cyan-400 focus:ring-offset-0"
              />
              <label htmlFor="remember" className="ml-2 text-gray-400">
                Remember me
              </label>
            </div>
            <a
              href="#"
              className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="relative group w-full bg-transparent border-2 border-cyan-400 text-cyan-400 py-3 px-4 rounded-md text-lg font-medium overflow-hidden transition-all duration-300 hover:bg-cyan-400 hover:text-black cursor-pointer"
          >
            <span className="relative z-10">Sign In</span>
            <div className="absolute inset-0 bg-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
          </button>

          <p className="text-center text-gray-400 text-sm mt-6">
            Don't have an account?{" "}
            <a
              href="#"
              className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
            >
              Sign up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
