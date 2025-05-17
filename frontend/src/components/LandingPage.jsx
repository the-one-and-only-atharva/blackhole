import React from "react";
import { motion } from "framer-motion";
import architectureBg from "../assets/architecture-2083687.jpg";

export default function LandingPage({ onGetStarted }) {
  return (
    <div
      className="min-h-screen text-white relative"
      style={{
        backgroundImage: `url(${architectureBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Frosted Glass Overlay */}
      <div className="absolute inset-0 backdrop-blur-md bg-black/50"></div>

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 50,
            damping: 5,
            mass: 1,
            duration: 0.8,
          }}
          className="relative z-10 text-center px-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 50,
              damping: 5,
              delay: 0.2,
            }}
            className="inline-block mb-8"
          >
            <span className="text-cyan-400 text-sm tracking-widest uppercase font-light">
              The Future of Property
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 50,
              damping: 5,
              delay: 0.4,
            }}
            className="text-7xl font-bold mb-6 tracking-tight text-white"
          >
            Smart Property Agent
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 50,
              damping: 5,
              delay: 0.6,
            }}
            className="text-2xl mb-12 text-gray-300 max-w-2xl mx-auto leading-relaxed"
          >
            Experience the future of property management with blockchain-powered
            security and verification.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 50,
              damping: 5,
            }}
            whileHover={{
              scale: 1.05,
              transition: {
                type: "spring",
                stiffness: 50,
                damping: 5,
              },
            }}
            whileTap={{
              scale: 0.95,
              transition: {
                type: "spring",
                stiffness: 50,
                damping: 5,
              },
            }}
            onClick={onGetStarted}
            className="relative group bg-transparent border-2 border-cyan-400 text-cyan-400 px-16 py-5 rounded-md text-xl font-medium overflow-hidden transition-colors duration-300 hover:bg-cyan-400 hover:text-black cursor-pointer"
          >
            <span className="relative z-10">Get Started</span>
            <div className="absolute inset-0 bg-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
          </motion.button>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="py-32 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              type: "spring",
              stiffness: 50,
              damping: 5,
            }}
            className="text-5xl font-bold text-center mb-20 text-white"
          >
            Why Choose Us
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
                title: "Secure Records",
                description:
                  "Every property change is hashed and logged for verification, ensuring complete transparency and security.",
              },
              {
                icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                title: "Fraud Detection",
                description:
                  "Advanced algorithms continuously monitor and detect suspicious listings, protecting your investments.",
              },
              {
                icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
                title: "Multi-Agent Verification",
                description:
                  "Multiple parties can verify property records, ensuring complete transparency and trust.",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  type: "spring",
                  stiffness: 50,
                  damping: 5,
                  delay: index * 0.1,
                }}
                whileHover={{
                  y: -10,
                  transition: {
                    type: "spring",
                    stiffness: 50,
                    damping: 5,
                  },
                }}
                className="group p-8 rounded-xl bg-[#1a1a1a] border border-gray-800 hover:border-cyan-400 hover:bg-[#2c2b2b] transition-colors duration-300"
              >
                <div className="h-16 w-16 bg-cyan-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d={feature.icon}
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-cyan-400">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="relative py-32 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            type: "spring",
            stiffness: 50,
            damping: 5,
          }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-6xl font-bold mb-8 text-white">
            Ready to get started?
          </h2>
          <p className="text-2xl text-gray-300 mb-12 leading-relaxed">
            Join our platform and experience the future of property management
            today.
          </p>
          <motion.button
            whileHover={{
              scale: 1.05,
              transition: {
                type: "spring",
                stiffness: 50,
                damping: 5,
              },
            }}
            whileTap={{
              scale: 0.95,
              transition: {
                type: "spring",
                stiffness: 50,
                damping: 5,
              },
            }}
            onClick={onGetStarted}
            className="relative group bg-transparent border-2 border-cyan-400 text-cyan-400 px-16 py-5 rounded-md text-xl font-medium overflow-hidden transition-colors duration-300 hover:bg-cyan-400 hover:text-black cursor-pointer"
          >
            <span className="relative z-10">Create Account</span>
            <div className="absolute inset-0 bg-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
